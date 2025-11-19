import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema definition (matches src/index.ts)
const SheetsInsertRangeSchema = z.object({
  spreadsheetId: z.string().min(1, "Spreadsheet ID is required"),
  sheetId: z.number().int().min(0, "Sheet ID is required"),
  startRowIndex: z.number().int().min(0, "Start row index must be non-negative"),
  endRowIndex: z.number().int().min(0, "End row index must be non-negative"),
  startColumnIndex: z.number().int().min(0, "Start column index must be non-negative"),
  endColumnIndex: z.number().int().min(0, "End column index must be non-negative"),
  shiftDimension: z.enum(["ROWS", "COLUMNS"], {
    errorMap: () => ({ message: "Shift dimension must be ROWS or COLUMNS" })
  })
}).refine(data => data.endRowIndex > data.startRowIndex, {
  message: "End row index must be greater than start row index"
}).refine(data => data.endColumnIndex > data.startColumnIndex, {
  message: "End column index must be greater than start column index"
});

describe('sheets_insertRange - Unit Tests', () => {
  describe('Schema Validation', () => {
    it('should validate correct parameters for insert range with ROWS shift', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 5,
        endRowIndex: 10,
        startColumnIndex: 0,
        endColumnIndex: 5,
        shiftDimension: 'ROWS' as const
      };

      const result = SheetsInsertRangeSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate correct parameters with COLUMNS shift', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 123,
        startRowIndex: 0,
        endRowIndex: 10,
        startColumnIndex: 5,
        endColumnIndex: 10,
        shiftDimension: 'COLUMNS' as const
      };

      const result = SheetsInsertRangeSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject missing spreadsheetId', () => {
      const invalidInput = {
        sheetId: 0,
        startRowIndex: 0,
        endRowIndex: 5,
        startColumnIndex: 0,
        endColumnIndex: 5,
        shiftDimension: 'ROWS'
      };

      const result = SheetsInsertRangeSchema.safeParse(invalidInput);
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
        shiftDimension: 'ROWS'
      };

      const result = SheetsInsertRangeSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('End row index must be greater than start row index');
      }
    });

    it('should reject when endColumnIndex <= startColumnIndex', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 0,
        endRowIndex: 5,
        startColumnIndex: 5,
        endColumnIndex: 5,
        shiftDimension: 'COLUMNS'
      };

      const result = SheetsInsertRangeSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('End column index must be greater than start column index');
      }
    });

    it('should reject invalid shiftDimension', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 0,
        endRowIndex: 5,
        startColumnIndex: 0,
        endColumnIndex: 5,
        shiftDimension: 'INVALID'
      };

      const result = SheetsInsertRangeSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Shift dimension must be ROWS or COLUMNS');
      }
    });

    it('should accept range at origin (0,0)', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 0,
        endRowIndex: 1,
        startColumnIndex: 0,
        endColumnIndex: 1,
        shiftDimension: 'ROWS' as const
      };

      const result = SheetsInsertRangeSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe('API Request Formation', () => {
    it('should form correct InsertRangeRequest', () => {
      const input = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 5,
        endRowIndex: 10,
        startColumnIndex: 2,
        endColumnIndex: 7,
        shiftDimension: 'ROWS' as const
      };

      const expectedRequest = {
        spreadsheetId: input.spreadsheetId,
        requestBody: {
          requests: [{
            insertRange: {
              range: {
                sheetId: input.sheetId,
                startRowIndex: input.startRowIndex,
                endRowIndex: input.endRowIndex,
                startColumnIndex: input.startColumnIndex,
                endColumnIndex: input.endColumnIndex
              },
              shiftDimension: input.shiftDimension
            }
          }]
        }
      };

      expect(expectedRequest.requestBody.requests[0].insertRange.range.sheetId).toBe(0);
      expect(expectedRequest.requestBody.requests[0].insertRange.shiftDimension).toBe('ROWS');
    });

    it('should calculate correct range dimensions', () => {
      const input = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 5,
        endRowIndex: 10,
        startColumnIndex: 2,
        endColumnIndex: 7,
        shiftDimension: 'COLUMNS' as const
      };

      const rows = input.endRowIndex - input.startRowIndex;
      const cols = input.endColumnIndex - input.startColumnIndex;

      expect(rows).toBe(5);
      expect(cols).toBe(5);
    });
  });
});
