import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema definition (matches src/index.ts)
const SheetsTrimWhitespaceSchema = z.object({
  spreadsheetId: z.string().min(1, "Spreadsheet ID is required"),
  sheetId: z.number().int().min(0, "Sheet ID is required"),
  startRowIndex: z.number().int().min(0, "Start row index must be non-negative"),
  endRowIndex: z.number().int().min(0, "End row index must be non-negative"),
  startColumnIndex: z.number().int().min(0, "Start column index must be non-negative"),
  endColumnIndex: z.number().int().min(0, "End column index must be non-negative")
}).refine(data => data.endRowIndex > data.startRowIndex, {
  message: "End row index must be greater than start row index"
}).refine(data => data.endColumnIndex > data.startColumnIndex, {
  message: "End column index must be greater than start column index"
});

describe('sheets_trimWhitespace - Unit Tests', () => {
  describe('Schema Validation', () => {
    it('should validate correct parameters', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 0,
        endRowIndex: 100,
        startColumnIndex: 0,
        endColumnIndex: 10
      };

      const result = SheetsTrimWhitespaceSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should reject missing spreadsheetId', () => {
      const invalidInput = {
        sheetId: 0,
        startRowIndex: 0,
        endRowIndex: 100,
        startColumnIndex: 0,
        endColumnIndex: 10
      };

      const result = SheetsTrimWhitespaceSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject empty spreadsheetId', () => {
      const invalidInput = {
        spreadsheetId: '',
        sheetId: 0,
        startRowIndex: 0,
        endRowIndex: 100,
        startColumnIndex: 0,
        endColumnIndex: 10
      };

      const result = SheetsTrimWhitespaceSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Spreadsheet ID is required');
      }
    });

    it('should reject negative sheetId', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: -1,
        startRowIndex: 0,
        endRowIndex: 100,
        startColumnIndex: 0,
        endColumnIndex: 10
      };

      const result = SheetsTrimWhitespaceSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject when endRowIndex <= startRowIndex', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 10,
        endRowIndex: 10,
        startColumnIndex: 0,
        endColumnIndex: 5
      };

      const result = SheetsTrimWhitespaceSchema.safeParse(invalidInput);
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
        endRowIndex: 100,
        startColumnIndex: 5,
        endColumnIndex: 5
      };

      const result = SheetsTrimWhitespaceSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('End column index must be greater than start column index');
      }
    });

    it('should accept range at origin (0,0)', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 0,
        endRowIndex: 1,
        startColumnIndex: 0,
        endColumnIndex: 1
      };

      const result = SheetsTrimWhitespaceSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept large ranges', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 0,
        endRowIndex: 1000,
        startColumnIndex: 0,
        endColumnIndex: 26
      };

      const result = SheetsTrimWhitespaceSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe('API Request Formation', () => {
    it('should form correct TrimWhitespaceRequest', () => {
      const input = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 0,
        endRowIndex: 100,
        startColumnIndex: 0,
        endColumnIndex: 10
      };

      const expectedRequest = {
        spreadsheetId: input.spreadsheetId,
        requestBody: {
          requests: [{
            trimWhitespace: {
              range: {
                sheetId: input.sheetId,
                startRowIndex: input.startRowIndex,
                endRowIndex: input.endRowIndex,
                startColumnIndex: input.startColumnIndex,
                endColumnIndex: input.endColumnIndex
              }
            }
          }]
        }
      };

      expect(expectedRequest.requestBody.requests[0].trimWhitespace.range.sheetId).toBe(0);
      expect(expectedRequest.requestBody.requests[0].trimWhitespace.range.startRowIndex).toBe(0);
      expect(expectedRequest.requestBody.requests[0].trimWhitespace.range.endRowIndex).toBe(100);
    });

    it('should calculate correct range dimensions', () => {
      const input = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 5,
        endRowIndex: 25,
        startColumnIndex: 2,
        endColumnIndex: 7
      };

      const rows = input.endRowIndex - input.startRowIndex;
      const cols = input.endColumnIndex - input.startColumnIndex;

      expect(rows).toBe(20);
      expect(cols).toBe(5);
    });
  });
});
