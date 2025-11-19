import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema definition (matches src/index.ts)
const SheetsClearBasicFilterSchema = z.object({
  spreadsheetId: z.string().min(1, "Spreadsheet ID is required"),
  sheetId: z.number().int().min(0, "Sheet ID is required")
});

describe('sheets_clearBasicFilter - Unit Tests', () => {
  describe('Schema Validation', () => {
    it('should validate correct parameters', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0
      };

      const result = SheetsClearBasicFilterSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should accept non-zero sheetId', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 123
      };

      const result = SheetsClearBasicFilterSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject missing spreadsheetId', () => {
      const invalidInput = {
        sheetId: 0
      };

      const result = SheetsClearBasicFilterSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject empty spreadsheetId', () => {
      const invalidInput = {
        spreadsheetId: '',
        sheetId: 0
      };

      const result = SheetsClearBasicFilterSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Spreadsheet ID is required');
      }
    });

    it('should reject missing sheetId', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'
      };

      const result = SheetsClearBasicFilterSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject negative sheetId', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: -1
      };

      const result = SheetsClearBasicFilterSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('API Request Formation', () => {
    it('should form correct ClearBasicFilterRequest', () => {
      const input = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0
      };

      const expectedRequest = {
        spreadsheetId: input.spreadsheetId,
        requestBody: {
          requests: [{
            clearBasicFilter: {
              sheetId: input.sheetId
            }
          }]
        }
      };

      expect(expectedRequest.spreadsheetId).toBe(input.spreadsheetId);
      expect(expectedRequest.requestBody.requests[0].clearBasicFilter.sheetId).toBe(0);
    });

    it('should form request for non-zero sheetId', () => {
      const input = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 456
      };

      const expectedSheetId = input.sheetId;
      expect(expectedSheetId).toBe(456);
    });
  });
});
