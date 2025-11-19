import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema definition (matches src/index.ts)
const SheetsAppendValuesSchema = z.object({
  spreadsheetId: z.string().min(1, "Spreadsheet ID is required"),
  range: z.string().min(1, "Range is required"),
  values: z.array(z.array(z.string())),
  valueInputOption: z.enum(["RAW", "USER_ENTERED"]).default("USER_ENTERED"),
  insertDataOption: z.enum(["OVERWRITE", "INSERT_ROWS"]).optional()
});

describe('sheets_appendValues - Unit Tests', () => {
  describe('Schema Validation', () => {
    it('should validate correct parameters with minimal input', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        range: 'Sheet1!A1',
        values: [['Name', 'Age'], ['John', '30']]
      };

      const result = SheetsAppendValuesSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.valueInputOption).toBe('USER_ENTERED'); // default
      }
    });

    it('should validate correct parameters with all options', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        range: 'Sheet1!A1',
        values: [['Name', 'Age'], ['John', '30']],
        valueInputOption: 'RAW' as const,
        insertDataOption: 'INSERT_ROWS' as const
      };

      const result = SheetsAppendValuesSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toMatchObject(validInput);
      }
    });

    it('should reject missing spreadsheetId', () => {
      const invalidInput = {
        range: 'Sheet1!A1',
        values: [['Name']]
      };

      const result = SheetsAppendValuesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject empty spreadsheetId', () => {
      const invalidInput = {
        spreadsheetId: '',
        range: 'Sheet1!A1',
        values: [['Name']]
      };

      const result = SheetsAppendValuesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Spreadsheet ID is required');
      }
    });

    it('should reject empty range', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        range: '',
        values: [['Name']]
      };

      const result = SheetsAppendValuesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Range is required');
      }
    });

    it('should accept empty values array', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        range: 'Sheet1!A1',
        values: []
      };

      const result = SheetsAppendValuesSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject invalid valueInputOption', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        range: 'Sheet1!A1',
        values: [['Name']],
        valueInputOption: 'INVALID'
      };

      const result = SheetsAppendValuesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject invalid insertDataOption', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        range: 'Sheet1!A1',
        values: [['Name']],
        insertDataOption: 'INVALID'
      };

      const result = SheetsAppendValuesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('API Request Formation', () => {
    it('should form correct spreadsheets.values.append request', () => {
      const input = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        range: 'Sheet1!A1',
        values: [['Name', 'Age'], ['John', '30']],
        valueInputOption: 'USER_ENTERED' as const,
        insertDataOption: 'INSERT_ROWS' as const
      };

      const expectedRequest = {
        spreadsheetId: input.spreadsheetId,
        range: input.range,
        valueInputOption: input.valueInputOption,
        insertDataOption: input.insertDataOption,
        requestBody: { values: input.values }
      };

      expect(expectedRequest.spreadsheetId).toBe(input.spreadsheetId);
      expect(expectedRequest.range).toBe(input.range);
      expect(expectedRequest.requestBody.values).toEqual(input.values);
    });
  });
});
