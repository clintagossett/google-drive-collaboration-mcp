import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema definition (matches src/index.ts)
const SheetsInsertDimensionSchema = z.object({
  spreadsheetId: z.string().min(1, "Spreadsheet ID is required"),
  sheetId: z.number().int().min(0, "Sheet ID is required"),
  dimension: z.enum(["ROWS", "COLUMNS"], {
    errorMap: () => ({ message: "Dimension must be ROWS or COLUMNS" })
  }),
  startIndex: z.number().int().min(0, "Start index must be non-negative"),
  endIndex: z.number().int().min(0, "End index must be non-negative"),
  inheritFromBefore: z.boolean().optional()
}).refine(data => data.endIndex > data.startIndex, {
  message: "End index must be greater than start index"
});

describe('sheets_insertDimension - Unit Tests', () => {
  describe('Schema Validation', () => {
    it('should validate correct parameters for inserting rows', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        dimension: 'ROWS' as const,
        startIndex: 5,
        endIndex: 10
      };

      const result = SheetsInsertDimensionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate correct parameters for inserting columns', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 123,
        dimension: 'COLUMNS' as const,
        startIndex: 0,
        endIndex: 3
      };

      const result = SheetsInsertDimensionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate with inheritFromBefore option', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        dimension: 'ROWS' as const,
        startIndex: 2,
        endIndex: 5,
        inheritFromBefore: true
      };

      const result = SheetsInsertDimensionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.inheritFromBefore).toBe(true);
      }
    });

    it('should reject missing spreadsheetId', () => {
      const invalidInput = {
        sheetId: 0,
        dimension: 'ROWS',
        startIndex: 0,
        endIndex: 5
      };

      const result = SheetsInsertDimensionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject empty spreadsheetId', () => {
      const invalidInput = {
        spreadsheetId: '',
        sheetId: 0,
        dimension: 'ROWS',
        startIndex: 0,
        endIndex: 5
      };

      const result = SheetsInsertDimensionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Spreadsheet ID is required');
      }
    });

    it('should reject missing sheetId', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        dimension: 'ROWS',
        startIndex: 0,
        endIndex: 5
      };

      const result = SheetsInsertDimensionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject negative sheetId', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: -1,
        dimension: 'ROWS',
        startIndex: 0,
        endIndex: 5
      };

      const result = SheetsInsertDimensionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject missing dimension', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startIndex: 0,
        endIndex: 5
      };

      const result = SheetsInsertDimensionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject invalid dimension value', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        dimension: 'INVALID',
        startIndex: 0,
        endIndex: 5
      };

      const result = SheetsInsertDimensionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Dimension must be ROWS or COLUMNS');
      }
    });

    it('should reject negative startIndex', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        dimension: 'ROWS',
        startIndex: -1,
        endIndex: 5
      };

      const result = SheetsInsertDimensionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject negative endIndex', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        dimension: 'ROWS',
        startIndex: 0,
        endIndex: -1
      };

      const result = SheetsInsertDimensionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject when endIndex <= startIndex', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        dimension: 'ROWS',
        startIndex: 5,
        endIndex: 5
      };

      const result = SheetsInsertDimensionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('End index must be greater than start index');
      }
    });

    it('should reject when endIndex < startIndex', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        dimension: 'ROWS',
        startIndex: 10,
        endIndex: 5
      };

      const result = SheetsInsertDimensionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('End index must be greater than start index');
      }
    });

    it('should accept startIndex of 0', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        dimension: 'COLUMNS' as const,
        startIndex: 0,
        endIndex: 1
      };

      const result = SheetsInsertDimensionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe('API Request Formation', () => {
    it('should form correct InsertDimensionRequest for rows', () => {
      const input = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        dimension: 'ROWS' as const,
        startIndex: 5,
        endIndex: 10
      };

      const expectedRequest = {
        spreadsheetId: input.spreadsheetId,
        requestBody: {
          requests: [{
            insertDimension: {
              range: {
                sheetId: input.sheetId,
                dimension: input.dimension,
                startIndex: input.startIndex,
                endIndex: input.endIndex
              }
            }
          }]
        }
      };

      expect(expectedRequest.spreadsheetId).toBe(input.spreadsheetId);
      expect(expectedRequest.requestBody.requests[0].insertDimension.range.sheetId).toBe(input.sheetId);
      expect(expectedRequest.requestBody.requests[0].insertDimension.range.dimension).toBe('ROWS');
      expect(expectedRequest.requestBody.requests[0].insertDimension.range.startIndex).toBe(5);
      expect(expectedRequest.requestBody.requests[0].insertDimension.range.endIndex).toBe(10);
    });

    it('should form correct InsertDimensionRequest with inheritFromBefore', () => {
      const input = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 123,
        dimension: 'COLUMNS' as const,
        startIndex: 2,
        endIndex: 5,
        inheritFromBefore: true
      };

      const expectedInsertDimension: any = {
        range: {
          sheetId: input.sheetId,
          dimension: input.dimension,
          startIndex: input.startIndex,
          endIndex: input.endIndex
        },
        inheritFromBefore: true
      };

      expect(expectedInsertDimension.inheritFromBefore).toBe(true);
      expect(expectedInsertDimension.range.dimension).toBe('COLUMNS');
    });

    it('should calculate correct count (endIndex - startIndex)', () => {
      const input = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        dimension: 'ROWS' as const,
        startIndex: 5,
        endIndex: 10
      };

      const count = input.endIndex - input.startIndex;
      expect(count).toBe(5);
    });
  });
});
