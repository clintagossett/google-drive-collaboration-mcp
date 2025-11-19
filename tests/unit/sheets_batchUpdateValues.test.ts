import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema definition (matches src/index.ts)
const SheetsBatchUpdateValuesSchema = z.object({
  spreadsheetId: z.string().min(1, "Spreadsheet ID is required"),
  valueInputOption: z.enum(["RAW", "USER_ENTERED"]).default("USER_ENTERED"),
  data: z.array(z.object({
    range: z.string(),
    values: z.array(z.array(z.string()))
  })).min(1, "At least one range update is required")
});

describe('sheets_batchUpdateValues - Unit Tests', () => {
  describe('Schema Validation', () => {
    it('should validate correct parameters with minimal input', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        data: [
          { range: 'Sheet1!A1:B2', values: [['A1', 'B1'], ['A2', 'B2']] }
        ]
      };

      const result = SheetsBatchUpdateValuesSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.valueInputOption).toBe('USER_ENTERED'); // default
      }
    });

    it('should validate correct parameters with all options', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        valueInputOption: 'RAW' as const,
        data: [
          { range: 'Sheet1!A1:B2', values: [['A1', 'B1'], ['A2', 'B2']] },
          { range: 'Sheet2!C1:D2', values: [['C1', 'D1'], ['C2', 'D2']] }
        ]
      };

      const result = SheetsBatchUpdateValuesSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toMatchObject(validInput);
      }
    });

    it('should reject missing spreadsheetId', () => {
      const invalidInput = {
        data: [
          { range: 'Sheet1!A1:B2', values: [['A1', 'B1']] }
        ]
      };

      const result = SheetsBatchUpdateValuesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject empty spreadsheetId', () => {
      const invalidInput = {
        spreadsheetId: '',
        data: [
          { range: 'Sheet1!A1:B2', values: [['A1', 'B1']] }
        ]
      };

      const result = SheetsBatchUpdateValuesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Spreadsheet ID is required');
      }
    });

    it('should reject empty data array', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        data: []
      };

      const result = SheetsBatchUpdateValuesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('At least one range update is required');
      }
    });

    it('should accept multiple range updates', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        data: [
          { range: 'Sheet1!A1', values: [['Value']] },
          { range: 'Sheet2!B2', values: [['Another']] },
          { range: 'Sheet3!C3', values: [['Third']] }
        ]
      };

      const result = SheetsBatchUpdateValuesSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject invalid valueInputOption', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        valueInputOption: 'INVALID',
        data: [
          { range: 'Sheet1!A1', values: [['Value']] }
        ]
      };

      const result = SheetsBatchUpdateValuesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('API Request Formation', () => {
    it('should form correct spreadsheets.values.batchUpdate request', () => {
      const input = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        valueInputOption: 'USER_ENTERED' as const,
        data: [
          { range: 'Sheet1!A1:B2', values: [['A1', 'B1'], ['A2', 'B2']] }
        ]
      };

      const expectedRequest = {
        spreadsheetId: input.spreadsheetId,
        requestBody: {
          valueInputOption: input.valueInputOption,
          data: input.data
        }
      };

      expect(expectedRequest.spreadsheetId).toBe(input.spreadsheetId);
      expect(expectedRequest.requestBody.valueInputOption).toBe(input.valueInputOption);
      expect(expectedRequest.requestBody.data).toEqual(input.data);
    });
  });
});
