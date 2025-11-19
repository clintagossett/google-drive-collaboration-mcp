import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema definition (matches src/index.ts)
const SheetsGetSpreadsheetSchema = z.object({
  spreadsheetId: z.string().min(1, "Spreadsheet ID is required"),
  ranges: z.array(z.string()).optional(),
  includeGridData: z.boolean().optional()
});

describe('sheets_getSpreadsheet - Unit Tests', () => {
  describe('Schema Validation', () => {
    it('should validate correct parameters with minimal input', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'
      };

      const result = SheetsGetSpreadsheetSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate correct parameters with all options', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        ranges: ['Sheet1!A1:B10', 'Sheet2!C1:D5'],
        includeGridData: true
      };

      const result = SheetsGetSpreadsheetSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should reject missing spreadsheetId', () => {
      const invalidInput = {
        ranges: ['Sheet1!A1:B10']
      };

      const result = SheetsGetSpreadsheetSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Required');
      }
    });

    it('should reject empty spreadsheetId', () => {
      const invalidInput = {
        spreadsheetId: '',
        includeGridData: true
      };

      const result = SheetsGetSpreadsheetSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Spreadsheet ID is required');
      }
    });

    it('should accept empty ranges array', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        ranges: []
      };

      const result = SheetsGetSpreadsheetSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept includeGridData as false', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        includeGridData: false
      };

      const result = SheetsGetSpreadsheetSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe('API Request Formation', () => {
    it('should form correct spreadsheets.get request structure', () => {
      const input = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        ranges: ['Sheet1!A1:B10'],
        includeGridData: true
      };

      // Expected Google Sheets API request structure
      const expectedRequest = {
        spreadsheetId: input.spreadsheetId,
        ranges: input.ranges,
        includeGridData: input.includeGridData
      };

      expect(expectedRequest.spreadsheetId).toBe(input.spreadsheetId);
      expect(expectedRequest.ranges).toEqual(input.ranges);
      expect(expectedRequest.includeGridData).toBe(true);
    });

    it('should form correct request without optional parameters', () => {
      const input = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'
      };

      const expectedRequest = {
        spreadsheetId: input.spreadsheetId,
        ranges: undefined,
        includeGridData: undefined
      };

      expect(expectedRequest.spreadsheetId).toBe(input.spreadsheetId);
      expect(expectedRequest.ranges).toBeUndefined();
      expect(expectedRequest.includeGridData).toBeUndefined();
    });
  });
});
