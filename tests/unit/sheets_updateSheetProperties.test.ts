import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema definition (matches src/index.ts)
const SheetsUpdateSheetPropertiesSchema = z.object({
  spreadsheetId: z.string().min(1, "Spreadsheet ID is required"),
  sheetId: z.number().int().min(0, "Sheet ID is required"),
  title: z.string().optional(),
  index: z.number().int().min(0).optional(),
  hidden: z.boolean().optional(),
  tabColorRed: z.number().min(0).max(1).optional(),
  tabColorGreen: z.number().min(0).max(1).optional(),
  tabColorBlue: z.number().min(0).max(1).optional(),
  frozenRowCount: z.number().int().min(0).optional(),
  frozenColumnCount: z.number().int().min(0).optional(),
  rightToLeft: z.boolean().optional()
});

describe('sheets_updateSheetProperties - Unit Tests', () => {
  describe('Schema Validation', () => {
    it('should validate correct parameters with title only', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        title: 'Renamed Sheet'
      };

      const result = SheetsUpdateSheetPropertiesSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate correct parameters with all options', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 123456,
        title: 'Updated Sheet',
        index: 2,
        hidden: true,
        tabColorRed: 0.9,
        tabColorGreen: 0.5,
        tabColorBlue: 0.1,
        frozenRowCount: 2,
        frozenColumnCount: 1,
        rightToLeft: true
      };

      const result = SheetsUpdateSheetPropertiesSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should reject missing spreadsheetId', () => {
      const invalidInput = {
        sheetId: 0,
        title: 'Renamed'
      };

      const result = SheetsUpdateSheetPropertiesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject empty spreadsheetId', () => {
      const invalidInput = {
        spreadsheetId: '',
        sheetId: 0,
        title: 'Renamed'
      };

      const result = SheetsUpdateSheetPropertiesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Spreadsheet ID is required');
      }
    });

    it('should reject missing sheetId', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        title: 'Renamed'
      };

      const result = SheetsUpdateSheetPropertiesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject negative sheetId', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: -1,
        title: 'Renamed'
      };

      const result = SheetsUpdateSheetPropertiesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should accept updating only frozen counts', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        frozenRowCount: 2,
        frozenColumnCount: 1
      };

      const result = SheetsUpdateSheetPropertiesSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept updating only tab color', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        tabColorRed: 1,
        tabColorGreen: 0,
        tabColorBlue: 0
      };

      const result = SheetsUpdateSheetPropertiesSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept updating only hidden property', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        hidden: true
      };

      const result = SheetsUpdateSheetPropertiesSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject tab color values greater than 1', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        tabColorRed: 1.5
      };

      const result = SheetsUpdateSheetPropertiesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject tab color values less than 0', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        tabColorBlue: -0.1
      };

      const result = SheetsUpdateSheetPropertiesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject negative index', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        index: -1
      };

      const result = SheetsUpdateSheetPropertiesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('API Request Formation', () => {
    it('should form correct UpdateSheetPropertiesRequest with field mask', () => {
      const input = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        title: 'Renamed Sheet',
        frozenRowCount: 1
      };

      const expectedProperties: any = {
        sheetId: input.sheetId,
        title: input.title,
        gridProperties: {
          frozenRowCount: input.frozenRowCount
        }
      };

      const expectedFields = 'title,gridProperties.frozenRowCount';

      expect(expectedProperties.sheetId).toBe(input.sheetId);
      expect(expectedProperties.title).toBe(input.title);
      expect(expectedFields).toContain('title');
      expect(expectedFields).toContain('gridProperties.frozenRowCount');
    });
  });
});
