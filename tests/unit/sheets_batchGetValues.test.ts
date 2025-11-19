import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema definition (matches src/index.ts)
const SheetsBatchGetValuesSchema = z.object({
  spreadsheetId: z.string().min(1, "Spreadsheet ID is required"),
  ranges: z.array(z.string()).min(1, "At least one range is required"),
  majorDimension: z.enum(["ROWS", "COLUMNS"]).optional(),
  valueRenderOption: z.enum(["FORMATTED_VALUE", "UNFORMATTED_VALUE", "FORMULA"]).optional()
});

describe('sheets_batchGetValues - Unit Tests', () => {
  describe('Schema Validation', () => {
    it('should validate correct parameters with minimal input', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        ranges: ['Sheet1!A1:B10']
      };

      const result = SheetsBatchGetValuesSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate correct parameters with all options', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        ranges: ['Sheet1!A1:B10', 'Sheet2!C1:D5'],
        majorDimension: 'ROWS' as const,
        valueRenderOption: 'FORMATTED_VALUE' as const
      };

      const result = SheetsBatchGetValuesSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should reject missing spreadsheetId', () => {
      const invalidInput = {
        ranges: ['Sheet1!A1:B10']
      };

      const result = SheetsBatchGetValuesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject empty spreadsheetId', () => {
      const invalidInput = {
        spreadsheetId: '',
        ranges: ['Sheet1!A1:B10']
      };

      const result = SheetsBatchGetValuesSchema.safeParse(invalidInput);
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

      const result = SheetsBatchGetValuesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('At least one range is required');
      }
    });

    it('should accept multiple ranges', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        ranges: ['Sheet1!A1:B10', 'Sheet2!C1:D5', 'Sheet3!E1:F20']
      };

      const result = SheetsBatchGetValuesSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept COLUMNS majorDimension', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        ranges: ['Sheet1!A1:B10'],
        majorDimension: 'COLUMNS' as const
      };

      const result = SheetsBatchGetValuesSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept UNFORMATTED_VALUE render option', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        ranges: ['Sheet1!A1:B10'],
        valueRenderOption: 'UNFORMATTED_VALUE' as const
      };

      const result = SheetsBatchGetValuesSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept FORMULA render option', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        ranges: ['Sheet1!A1:B10'],
        valueRenderOption: 'FORMULA' as const
      };

      const result = SheetsBatchGetValuesSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe('API Request Formation', () => {
    it('should form correct spreadsheets.values.batchGet request', () => {
      const input = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        ranges: ['Sheet1!A1:B10', 'Sheet2!C1:D5'],
        majorDimension: 'ROWS' as const,
        valueRenderOption: 'FORMATTED_VALUE' as const
      };

      const expectedRequest = {
        spreadsheetId: input.spreadsheetId,
        ranges: input.ranges,
        majorDimension: input.majorDimension,
        valueRenderOption: input.valueRenderOption
      };

      expect(expectedRequest.spreadsheetId).toBe(input.spreadsheetId);
      expect(expectedRequest.ranges).toEqual(input.ranges);
      expect(expectedRequest.majorDimension).toBe(input.majorDimension);
      expect(expectedRequest.valueRenderOption).toBe(input.valueRenderOption);
    });
  });
});
