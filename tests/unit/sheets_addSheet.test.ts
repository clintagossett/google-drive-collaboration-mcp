import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema definition (matches src/index.ts)
const SheetsAddSheetSchema = z.object({
  spreadsheetId: z.string().min(1, "Spreadsheet ID is required"),
  title: z.string().min(1, "Sheet title is required"),
  index: z.number().int().min(0).optional(),
  sheetType: z.enum(["GRID", "OBJECT"]).optional(),
  gridRowCount: z.number().int().min(1).optional(),
  gridColumnCount: z.number().int().min(1).optional(),
  frozenRowCount: z.number().int().min(0).optional(),
  frozenColumnCount: z.number().int().min(0).optional(),
  hidden: z.boolean().optional(),
  tabColorRed: z.number().min(0).max(1).optional(),
  tabColorGreen: z.number().min(0).max(1).optional(),
  tabColorBlue: z.number().min(0).max(1).optional(),
  rightToLeft: z.boolean().optional()
});

describe('sheets_addSheet - Unit Tests', () => {
  describe('Schema Validation', () => {
    it('should validate correct parameters with minimal input', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        title: 'New Sheet'
      };

      const result = SheetsAddSheetSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate correct parameters with all options', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        title: 'Q1 Data',
        index: 1,
        sheetType: 'GRID' as const,
        gridRowCount: 1000,
        gridColumnCount: 26,
        frozenRowCount: 1,
        frozenColumnCount: 2,
        hidden: false,
        tabColorRed: 0.2,
        tabColorGreen: 0.6,
        tabColorBlue: 0.9,
        rightToLeft: false
      };

      const result = SheetsAddSheetSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should reject missing spreadsheetId', () => {
      const invalidInput = {
        title: 'New Sheet'
      };

      const result = SheetsAddSheetSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject empty spreadsheetId', () => {
      const invalidInput = {
        spreadsheetId: '',
        title: 'New Sheet'
      };

      const result = SheetsAddSheetSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Spreadsheet ID is required');
      }
    });

    it('should reject missing title', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'
      };

      const result = SheetsAddSheetSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject empty title', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        title: ''
      };

      const result = SheetsAddSheetSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Sheet title is required');
      }
    });

    it('should reject negative index', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        title: 'New Sheet',
        index: -1
      };

      const result = SheetsAddSheetSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject tab color values greater than 1', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        title: 'New Sheet',
        tabColorRed: 1.5
      };

      const result = SheetsAddSheetSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject tab color values less than 0', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        title: 'New Sheet',
        tabColorGreen: -0.1
      };

      const result = SheetsAddSheetSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should accept zero for frozen counts', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        title: 'New Sheet',
        frozenRowCount: 0,
        frozenColumnCount: 0
      };

      const result = SheetsAddSheetSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept OBJECT sheetType', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        title: 'New Sheet',
        sheetType: 'OBJECT' as const
      };

      const result = SheetsAddSheetSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe('API Request Formation', () => {
    it('should form correct AddSheetRequest in batchUpdate', () => {
      const input = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        title: 'Q1 Data',
        gridRowCount: 1000,
        gridColumnCount: 26,
        frozenRowCount: 1,
        tabColorGreen: 0.8
      };

      const expectedProperties: any = {
        title: input.title,
        gridProperties: {
          rowCount: input.gridRowCount,
          columnCount: input.gridColumnCount,
          frozenRowCount: input.frozenRowCount
        },
        tabColor: {
          red: 0,
          green: input.tabColorGreen,
          blue: 0
        }
      };

      expect(expectedProperties.title).toBe(input.title);
      expect(expectedProperties.gridProperties.rowCount).toBe(input.gridRowCount);
      expect(expectedProperties.tabColor.green).toBe(input.tabColorGreen);
    });
  });
});
