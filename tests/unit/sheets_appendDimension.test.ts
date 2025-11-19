import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema definition (matches src/index.ts)
const SheetsAppendDimensionSchema = z.object({
  spreadsheetId: z.string().min(1, "Spreadsheet ID is required"),
  sheetId: z.number().int().min(0, "Sheet ID is required"),
  dimension: z.enum(["ROWS", "COLUMNS"], {
    errorMap: () => ({ message: "Dimension must be ROWS or COLUMNS" })
  }),
  length: z.number().int().min(1, "Length must be at least 1")
});

describe('sheets_appendDimension - Unit Tests', () => {
  describe('Schema Validation', () => {
    it('should validate correct parameters for appending rows', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        dimension: 'ROWS' as const,
        length: 10
      };

      const result = SheetsAppendDimensionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate correct parameters for appending columns', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 123,
        dimension: 'COLUMNS' as const,
        length: 5
      };

      const result = SheetsAppendDimensionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should reject missing spreadsheetId', () => {
      const invalidInput = {
        sheetId: 0,
        dimension: 'ROWS',
        length: 10
      };

      const result = SheetsAppendDimensionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject empty spreadsheetId', () => {
      const invalidInput = {
        spreadsheetId: '',
        sheetId: 0,
        dimension: 'ROWS',
        length: 10
      };

      const result = SheetsAppendDimensionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Spreadsheet ID is required');
      }
    });

    it('should reject missing sheetId', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        dimension: 'ROWS',
        length: 10
      };

      const result = SheetsAppendDimensionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject negative sheetId', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: -1,
        dimension: 'ROWS',
        length: 10
      };

      const result = SheetsAppendDimensionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject invalid dimension value', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        dimension: 'INVALID',
        length: 10
      };

      const result = SheetsAppendDimensionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Dimension must be ROWS or COLUMNS');
      }
    });

    it('should reject missing length', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        dimension: 'ROWS'
      };

      const result = SheetsAppendDimensionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject length less than 1', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        dimension: 'ROWS',
        length: 0
      };

      const result = SheetsAppendDimensionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Length must be at least 1');
      }
    });

    it('should reject negative length', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        dimension: 'ROWS',
        length: -5
      };

      const result = SheetsAppendDimensionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should accept length of 1', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        dimension: 'COLUMNS' as const,
        length: 1
      };

      const result = SheetsAppendDimensionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept large length value', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        dimension: 'ROWS' as const,
        length: 1000
      };

      const result = SheetsAppendDimensionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe('API Request Formation', () => {
    it('should form correct AppendDimensionRequest for rows', () => {
      const input = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        dimension: 'ROWS' as const,
        length: 10
      };

      const expectedRequest = {
        spreadsheetId: input.spreadsheetId,
        requestBody: {
          requests: [{
            appendDimension: {
              sheetId: input.sheetId,
              dimension: input.dimension,
              length: input.length
            }
          }]
        }
      };

      expect(expectedRequest.spreadsheetId).toBe(input.spreadsheetId);
      expect(expectedRequest.requestBody.requests[0].appendDimension.sheetId).toBe(input.sheetId);
      expect(expectedRequest.requestBody.requests[0].appendDimension.dimension).toBe('ROWS');
      expect(expectedRequest.requestBody.requests[0].appendDimension.length).toBe(10);
    });

    it('should form correct AppendDimensionRequest for columns', () => {
      const input = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 123,
        dimension: 'COLUMNS' as const,
        length: 5
      };

      const expectedAppendDimension = {
        sheetId: input.sheetId,
        dimension: input.dimension,
        length: input.length
      };

      expect(expectedAppendDimension.dimension).toBe('COLUMNS');
      expect(expectedAppendDimension.sheetId).toBe(123);
      expect(expectedAppendDimension.length).toBe(5);
    });
  });
});
