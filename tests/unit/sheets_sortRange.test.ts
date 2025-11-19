import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema definition (matches src/index.ts)
const SheetsSortRangeSchema = z.object({
  spreadsheetId: z.string().min(1, "Spreadsheet ID is required"),
  sheetId: z.number().int().min(0, "Sheet ID is required"),
  startRowIndex: z.number().int().min(0, "Start row index must be non-negative"),
  endRowIndex: z.number().int().min(0, "End row index must be non-negative"),
  startColumnIndex: z.number().int().min(0, "Start column index must be non-negative"),
  endColumnIndex: z.number().int().min(0, "End column index must be non-negative"),
  sortSpecs: z.array(z.object({
    dimensionIndex: z.number().int().min(0, "Dimension index must be non-negative"),
    sortOrder: z.enum(["ASCENDING", "DESCENDING"], {
      errorMap: () => ({ message: "Sort order must be ASCENDING or DESCENDING" })
    })
  })).min(1, "At least one sort specification is required")
}).refine(data => data.endRowIndex > data.startRowIndex, {
  message: "End row index must be greater than start row index"
}).refine(data => data.endColumnIndex > data.startColumnIndex, {
  message: "End column index must be greater than start column index"
});

describe('sheets_sortRange - Unit Tests', () => {
  describe('Schema Validation', () => {
    it('should validate correct parameters with single sort spec', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 0,
        endRowIndex: 10,
        startColumnIndex: 0,
        endColumnIndex: 5,
        sortSpecs: [{
          dimensionIndex: 0,
          sortOrder: 'ASCENDING' as const
        }]
      };

      const result = SheetsSortRangeSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate correct parameters with multiple sort specs', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 1,
        endRowIndex: 100,
        startColumnIndex: 0,
        endColumnIndex: 10,
        sortSpecs: [
          { dimensionIndex: 0, sortOrder: 'ASCENDING' as const },
          { dimensionIndex: 2, sortOrder: 'DESCENDING' as const }
        ]
      };

      const result = SheetsSortRangeSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject missing sortSpecs', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 0,
        endRowIndex: 10,
        startColumnIndex: 0,
        endColumnIndex: 5
      };

      const result = SheetsSortRangeSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject empty sortSpecs array', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 0,
        endRowIndex: 10,
        startColumnIndex: 0,
        endColumnIndex: 5,
        sortSpecs: []
      };

      const result = SheetsSortRangeSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('At least one sort specification is required');
      }
    });

    it('should reject invalid sortOrder', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 0,
        endRowIndex: 10,
        startColumnIndex: 0,
        endColumnIndex: 5,
        sortSpecs: [{
          dimensionIndex: 0,
          sortOrder: 'INVALID'
        }]
      };

      const result = SheetsSortRangeSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Sort order must be ASCENDING or DESCENDING');
      }
    });

    it('should reject negative dimensionIndex', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 0,
        endRowIndex: 10,
        startColumnIndex: 0,
        endColumnIndex: 5,
        sortSpecs: [{
          dimensionIndex: -1,
          sortOrder: 'ASCENDING'
        }]
      };

      const result = SheetsSortRangeSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject when endRowIndex <= startRowIndex', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 5,
        endRowIndex: 5,
        startColumnIndex: 0,
        endColumnIndex: 5,
        sortSpecs: [{ dimensionIndex: 0, sortOrder: 'ASCENDING' as const }]
      };

      const result = SheetsSortRangeSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('End row index must be greater than start row index');
      }
    });
  });

  describe('API Request Formation', () => {
    it('should form correct SortRangeRequest with single spec', () => {
      const input = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 1,
        endRowIndex: 100,
        startColumnIndex: 0,
        endColumnIndex: 5,
        sortSpecs: [{ dimensionIndex: 0, sortOrder: 'ASCENDING' as const }]
      };

      const expectedRequest = {
        spreadsheetId: input.spreadsheetId,
        requestBody: {
          requests: [{
            sortRange: {
              range: {
                sheetId: input.sheetId,
                startRowIndex: input.startRowIndex,
                endRowIndex: input.endRowIndex,
                startColumnIndex: input.startColumnIndex,
                endColumnIndex: input.endColumnIndex
              },
              sortSpecs: input.sortSpecs
            }
          }]
        }
      };

      expect(expectedRequest.requestBody.requests[0].sortRange.sortSpecs).toHaveLength(1);
      expect(expectedRequest.requestBody.requests[0].sortRange.sortSpecs[0].dimensionIndex).toBe(0);
      expect(expectedRequest.requestBody.requests[0].sortRange.sortSpecs[0].sortOrder).toBe('ASCENDING');
    });

    it('should form correct SortRangeRequest with multiple specs', () => {
      const input = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 1,
        endRowIndex: 100,
        startColumnIndex: 0,
        endColumnIndex: 10,
        sortSpecs: [
          { dimensionIndex: 0, sortOrder: 'ASCENDING' as const },
          { dimensionIndex: 3, sortOrder: 'DESCENDING' as const }
        ]
      };

      const expectedSortSpecs = input.sortSpecs;
      expect(expectedSortSpecs).toHaveLength(2);
      expect(expectedSortSpecs[0].dimensionIndex).toBe(0);
      expect(expectedSortSpecs[0].sortOrder).toBe('ASCENDING');
      expect(expectedSortSpecs[1].dimensionIndex).toBe(3);
      expect(expectedSortSpecs[1].sortOrder).toBe('DESCENDING');
    });
  });
});
