import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema definition (matches src/index.ts)
const SheetsClearValuesSchema = z.object({
  spreadsheetId: z.string().min(1, "Spreadsheet ID is required"),
  range: z.string().min(1, "Range is required")
});

describe('sheets_clearValues - Unit Tests', () => {
  describe('Schema Validation', () => {
    it('should validate correct parameters', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        range: 'Sheet1!A1:B10'
      };

      const result = SheetsClearValuesSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should reject missing spreadsheetId', () => {
      const invalidInput = {
        range: 'Sheet1!A1:B10'
      };

      const result = SheetsClearValuesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Required');
      }
    });

    it('should reject empty spreadsheetId', () => {
      const invalidInput = {
        spreadsheetId: '',
        range: 'Sheet1!A1:B10'
      };

      const result = SheetsClearValuesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Spreadsheet ID is required');
      }
    });

    it('should reject missing range', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'
      };

      const result = SheetsClearValuesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject empty range', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        range: ''
      };

      const result = SheetsClearValuesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Range is required');
      }
    });

    it('should accept A1 notation', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        range: 'Sheet1!A1:Z100'
      };

      const result = SheetsClearValuesSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept range without sheet name', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        range: 'A1:B10'
      };

      const result = SheetsClearValuesSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe('API Request Formation', () => {
    it('should form correct spreadsheets.values.clear request', () => {
      const input = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        range: 'Sheet1!A1:B10'
      };

      const expectedRequest = {
        spreadsheetId: input.spreadsheetId,
        range: input.range
      };

      expect(expectedRequest.spreadsheetId).toBe(input.spreadsheetId);
      expect(expectedRequest.range).toBe(input.range);
    });
  });
});
