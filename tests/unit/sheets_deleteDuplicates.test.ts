import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema definition (matches src/index.ts)
const SheetsDeleteDuplicatesSchema = z.object({
  spreadsheetId: z.string().min(1, "Spreadsheet ID is required"),
  sheetId: z.number().int().min(0, "Sheet ID is required"),
  startRowIndex: z.number().int().min(0, "Start row index must be non-negative"),
  endRowIndex: z.number().int().min(0, "End row index must be non-negative"),
  startColumnIndex: z.number().int().min(0, "Start column index must be non-negative"),
  endColumnIndex: z.number().int().min(0, "End column index must be non-negative"),
  comparisonColumns: z.array(z.object({
    sheetId: z.number().int().min(0, "Sheet ID is required"),
    dimension: z.enum(["ROWS", "COLUMNS"], {
      errorMap: () => ({ message: "Dimension must be ROWS or COLUMNS" })
    }),
    startIndex: z.number().int().min(0, "Start index must be non-negative"),
    endIndex: z.number().int().min(0, "End index must be non-negative")
  })).min(1, "At least one comparison column is required")
}).refine(data => data.endRowIndex > data.startRowIndex, {
  message: "End row index must be greater than start row index"
}).refine(data => data.endColumnIndex > data.startColumnIndex, {
  message: "End column index must be greater than start column index"
});

describe('sheets_deleteDuplicates - Unit Tests', () => {
  describe('Schema Validation', () => {
    it('should validate correct parameters with single comparison column', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 0,
        endRowIndex: 100,
        startColumnIndex: 0,
        endColumnIndex: 10,
        comparisonColumns: [{
          sheetId: 0,
          dimension: 'COLUMNS' as const,
          startIndex: 0,
          endIndex: 1
        }]
      };

      const result = SheetsDeleteDuplicatesSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate with multiple comparison columns', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 1,
        endRowIndex: 100,
        startColumnIndex: 0,
        endColumnIndex: 5,
        comparisonColumns: [
          {
            sheetId: 0,
            dimension: 'COLUMNS' as const,
            startIndex: 0,
            endIndex: 1
          },
          {
            sheetId: 0,
            dimension: 'COLUMNS' as const,
            startIndex: 2,
            endIndex: 3
          }
        ]
      };

      const result = SheetsDeleteDuplicatesSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject missing comparisonColumns', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 0,
        endRowIndex: 100,
        startColumnIndex: 0,
        endColumnIndex: 10
      };

      const result = SheetsDeleteDuplicatesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject empty comparisonColumns array', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 0,
        endRowIndex: 100,
        startColumnIndex: 0,
        endColumnIndex: 10,
        comparisonColumns: []
      };

      const result = SheetsDeleteDuplicatesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('At least one comparison column is required');
      }
    });

    it('should reject invalid dimension value', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 0,
        endRowIndex: 100,
        startColumnIndex: 0,
        endColumnIndex: 10,
        comparisonColumns: [{
          sheetId: 0,
          dimension: 'INVALID',
          startIndex: 0,
          endIndex: 1
        }]
      };

      const result = SheetsDeleteDuplicatesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Dimension must be ROWS or COLUMNS');
      }
    });

    it('should reject negative comparison column startIndex', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 0,
        endRowIndex: 100,
        startColumnIndex: 0,
        endColumnIndex: 10,
        comparisonColumns: [{
          sheetId: 0,
          dimension: 'COLUMNS',
          startIndex: -1,
          endIndex: 1
        }]
      };

      const result = SheetsDeleteDuplicatesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject when endRowIndex <= startRowIndex', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 10,
        endRowIndex: 10,
        startColumnIndex: 0,
        endColumnIndex: 5,
        comparisonColumns: [{
          sheetId: 0,
          dimension: 'COLUMNS' as const,
          startIndex: 0,
          endIndex: 1
        }]
      };

      const result = SheetsDeleteDuplicatesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('End row index must be greater than start row index');
      }
    });

    it('should accept ROWS dimension', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 0,
        endRowIndex: 100,
        startColumnIndex: 0,
        endColumnIndex: 10,
        comparisonColumns: [{
          sheetId: 0,
          dimension: 'ROWS' as const,
          startIndex: 0,
          endIndex: 50
        }]
      };

      const result = SheetsDeleteDuplicatesSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe('API Request Formation', () => {
    it('should form correct DeleteDuplicatesRequest', () => {
      const input = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 1,
        endRowIndex: 100,
        startColumnIndex: 0,
        endColumnIndex: 5,
        comparisonColumns: [{
          sheetId: 0,
          dimension: 'COLUMNS' as const,
          startIndex: 0,
          endIndex: 1
        }]
      };

      const expectedRequest = {
        spreadsheetId: input.spreadsheetId,
        requestBody: {
          requests: [{
            deleteDuplicates: {
              range: {
                sheetId: input.sheetId,
                startRowIndex: input.startRowIndex,
                endRowIndex: input.endRowIndex,
                startColumnIndex: input.startColumnIndex,
                endColumnIndex: input.endColumnIndex
              },
              comparisonColumns: input.comparisonColumns
            }
          }]
        }
      };

      expect(expectedRequest.requestBody.requests[0].deleteDuplicates.range.sheetId).toBe(0);
      expect(expectedRequest.requestBody.requests[0].deleteDuplicates.comparisonColumns).toHaveLength(1);
      expect(expectedRequest.requestBody.requests[0].deleteDuplicates.comparisonColumns[0].dimension).toBe('COLUMNS');
    });

    it('should include multiple comparison columns', () => {
      const input = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 1,
        endRowIndex: 100,
        startColumnIndex: 0,
        endColumnIndex: 10,
        comparisonColumns: [
          {
            sheetId: 0,
            dimension: 'COLUMNS' as const,
            startIndex: 0,
            endIndex: 1
          },
          {
            sheetId: 0,
            dimension: 'COLUMNS' as const,
            startIndex: 3,
            endIndex: 4
          }
        ]
      };

      const expectedComparisonColumns = input.comparisonColumns;
      expect(expectedComparisonColumns).toHaveLength(2);
      expect(expectedComparisonColumns[0].startIndex).toBe(0);
      expect(expectedComparisonColumns[1].startIndex).toBe(3);
    });
  });
});
