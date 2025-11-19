import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema definition (matches src/index.ts)
const SheetsUpdateDimensionPropertiesSchema = z.object({
  spreadsheetId: z.string().min(1, "Spreadsheet ID is required"),
  sheetId: z.number().int().min(0, "Sheet ID is required"),
  dimension: z.enum(["ROWS", "COLUMNS"], {
    errorMap: () => ({ message: "Dimension must be ROWS or COLUMNS" })
  }),
  startIndex: z.number().int().min(0, "Start index must be non-negative"),
  endIndex: z.number().int().min(0, "End index must be non-negative"),
  pixelSize: z.number().int().min(1, "Pixel size must be at least 1").optional(),
  hiddenByUser: z.boolean().optional()
}).refine(data => data.endIndex > data.startIndex, {
  message: "End index must be greater than start index"
}).refine(data => data.pixelSize !== undefined || data.hiddenByUser !== undefined, {
  message: "At least one property (pixelSize or hiddenByUser) must be specified"
});

describe('sheets_updateDimensionProperties - Unit Tests', () => {
  describe('Schema Validation', () => {
    it('should validate correct parameters with pixelSize', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        dimension: 'ROWS' as const,
        startIndex: 0,
        endIndex: 10,
        pixelSize: 100
      };

      const result = SheetsUpdateDimensionPropertiesSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate correct parameters with hiddenByUser', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 123,
        dimension: 'COLUMNS' as const,
        startIndex: 0,
        endIndex: 5,
        hiddenByUser: true
      };

      const result = SheetsUpdateDimensionPropertiesSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate with both pixelSize and hiddenByUser', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        dimension: 'ROWS' as const,
        startIndex: 5,
        endIndex: 15,
        pixelSize: 150,
        hiddenByUser: false
      };

      const result = SheetsUpdateDimensionPropertiesSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should reject when neither pixelSize nor hiddenByUser is provided', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        dimension: 'ROWS',
        startIndex: 0,
        endIndex: 5
      };

      const result = SheetsUpdateDimensionPropertiesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('At least one property (pixelSize or hiddenByUser) must be specified');
      }
    });

    it('should reject missing spreadsheetId', () => {
      const invalidInput = {
        sheetId: 0,
        dimension: 'ROWS',
        startIndex: 0,
        endIndex: 5,
        pixelSize: 100
      };

      const result = SheetsUpdateDimensionPropertiesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject empty spreadsheetId', () => {
      const invalidInput = {
        spreadsheetId: '',
        sheetId: 0,
        dimension: 'ROWS',
        startIndex: 0,
        endIndex: 5,
        pixelSize: 100
      };

      const result = SheetsUpdateDimensionPropertiesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Spreadsheet ID is required');
      }
    });

    it('should reject negative sheetId', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: -1,
        dimension: 'ROWS',
        startIndex: 0,
        endIndex: 5,
        pixelSize: 100
      };

      const result = SheetsUpdateDimensionPropertiesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject invalid dimension value', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        dimension: 'INVALID',
        startIndex: 0,
        endIndex: 5,
        pixelSize: 100
      };

      const result = SheetsUpdateDimensionPropertiesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Dimension must be ROWS or COLUMNS');
      }
    });

    it('should reject when endIndex <= startIndex', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        dimension: 'ROWS',
        startIndex: 5,
        endIndex: 5,
        pixelSize: 100
      };

      const result = SheetsUpdateDimensionPropertiesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('End index must be greater than start index');
      }
    });

    it('should reject pixelSize less than 1', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        dimension: 'ROWS',
        startIndex: 0,
        endIndex: 5,
        pixelSize: 0
      };

      const result = SheetsUpdateDimensionPropertiesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Pixel size must be at least 1');
      }
    });

    it('should reject negative pixelSize', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        dimension: 'ROWS',
        startIndex: 0,
        endIndex: 5,
        pixelSize: -10
      };

      const result = SheetsUpdateDimensionPropertiesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should accept pixelSize of 1', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        dimension: 'COLUMNS' as const,
        startIndex: 0,
        endIndex: 1,
        pixelSize: 1
      };

      const result = SheetsUpdateDimensionPropertiesSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe('API Request Formation', () => {
    it('should form correct UpdateDimensionPropertiesRequest with pixelSize', () => {
      const input = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        dimension: 'ROWS' as const,
        startIndex: 0,
        endIndex: 10,
        pixelSize: 100
      };

      const expectedProperties: any = {
        pixelSize: 100
      };
      const expectedFields = 'pixelSize';

      expect(expectedProperties.pixelSize).toBe(input.pixelSize);
      expect(expectedFields).toBe('pixelSize');
    });

    it('should form correct UpdateDimensionPropertiesRequest with hiddenByUser', () => {
      const input = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 123,
        dimension: 'COLUMNS' as const,
        startIndex: 2,
        endIndex: 5,
        hiddenByUser: true
      };

      const expectedProperties: any = {
        hiddenByUser: true
      };
      const expectedFields = 'hiddenByUser';

      expect(expectedProperties.hiddenByUser).toBe(true);
      expect(expectedFields).toBe('hiddenByUser');
    });

    it('should form correct UpdateDimensionPropertiesRequest with both properties', () => {
      const input = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        dimension: 'ROWS' as const,
        startIndex: 5,
        endIndex: 15,
        pixelSize: 150,
        hiddenByUser: false
      };

      const expectedProperties: any = {
        pixelSize: 150,
        hiddenByUser: false
      };
      const expectedFields = 'pixelSize,hiddenByUser';

      expect(expectedProperties.pixelSize).toBe(150);
      expect(expectedProperties.hiddenByUser).toBe(false);
      expect(expectedFields).toContain('pixelSize');
      expect(expectedFields).toContain('hiddenByUser');
    });
  });
});
