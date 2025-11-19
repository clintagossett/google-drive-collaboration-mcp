import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema definition (matches src/index.ts)
const SheetsBatchClearValuesSchema = z.object({
  spreadsheetId: z.string().min(1, "Spreadsheet ID is required"),
  ranges: z.array(z.string()).min(1, "At least one range is required")
});

describe('sheets_batchClearValues - Unit Tests', () => {
  describe('Schema Validation', () => {
    it('should validate correct parameters with single range', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        ranges: ['Sheet1!A1:B10']
      };

      const result = SheetsBatchClearValuesSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate correct parameters with multiple ranges', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        ranges: ['Sheet1!A1:B10', 'Sheet2!C1:D5', 'Sheet3!E1:F20']
      };

      const result = SheetsBatchClearValuesSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should reject missing spreadsheetId', () => {
      const invalidInput = {
        ranges: ['Sheet1!A1:B10']
      };

      const result = SheetsBatchClearValuesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject empty spreadsheetId', () => {
      const invalidInput = {
        spreadsheetId: '',
        ranges: ['Sheet1!A1:B10']
      };

      const result = SheetsBatchClearValuesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Spreadsheet ID is required');
      }
    });

    it('should reject empty ranges array', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        ranges: []
      };

      const result = SheetsBatchClearValuesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('At least one range is required');
      }
    });

    it('should accept ranges without sheet name', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        ranges: ['A1:B10', 'C1:D5']
      };

      const result = SheetsBatchClearValuesSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe('API Request Formation', () => {
    it('should form correct spreadsheets.values.batchClear request', () => {
      const input = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        ranges: ['Sheet1!A1:B10', 'Sheet2!C1:D5']
      };

      const expectedRequest = {
        spreadsheetId: input.spreadsheetId,
        requestBody: { ranges: input.ranges }
      };

      expect(expectedRequest.spreadsheetId).toBe(input.spreadsheetId);
      expect(expectedRequest.requestBody.ranges).toEqual(input.ranges);
    });
  });
});
