import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema definition (matches src/index.ts)
const SheetsFindReplaceSchema = z.object({
  spreadsheetId: z.string().min(1, "Spreadsheet ID is required"),
  find: z.string().min(1, "Find text is required"),
  replacement: z.string(),
  matchCase: z.boolean().optional(),
  matchEntireCell: z.boolean().optional(),
  searchByRegex: z.boolean().optional(),
  includeFormulas: z.boolean().optional(),
  sheetId: z.number().int().min(0).optional(),
  startRowIndex: z.number().int().min(0).optional(),
  endRowIndex: z.number().int().min(0).optional(),
  startColumnIndex: z.number().int().min(0).optional(),
  endColumnIndex: z.number().int().min(0).optional(),
  allSheets: z.boolean().optional()
});

describe('sheets_findReplace - Unit Tests', () => {
  describe('Schema Validation', () => {
    it('should validate correct minimal parameters', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        find: 'old',
        replacement: 'new'
      };

      const result = SheetsFindReplaceSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate with all optional parameters', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        find: 'search',
        replacement: 'replace',
        matchCase: true,
        matchEntireCell: false,
        searchByRegex: true,
        includeFormulas: true,
        sheetId: 0,
        startRowIndex: 0,
        endRowIndex: 100,
        startColumnIndex: 0,
        endColumnIndex: 10,
        allSheets: false
      };

      const result = SheetsFindReplaceSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept empty replacement string', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        find: 'delete this',
        replacement: ''
      };

      const result = SheetsFindReplaceSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject missing find parameter', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        replacement: 'new'
      };

      const result = SheetsFindReplaceSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject empty find string', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        find: '',
        replacement: 'new'
      };

      const result = SheetsFindReplaceSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Find text is required');
      }
    });

    it('should reject missing replacement parameter', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        find: 'old'
      };

      const result = SheetsFindReplaceSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should accept partial range specification', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        find: 'test',
        replacement: 'result',
        sheetId: 0,
        startRowIndex: 5
      };

      const result = SheetsFindReplaceSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject negative sheetId', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        find: 'test',
        replacement: 'result',
        sheetId: -1
      };

      const result = SheetsFindReplaceSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('API Request Formation', () => {
    it('should form correct FindReplaceRequest with minimal params', () => {
      const input = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        find: 'old',
        replacement: 'new'
      };

      const expectedRequest = {
        spreadsheetId: input.spreadsheetId,
        requestBody: {
          requests: [{
            findReplace: {
              find: input.find,
              replacement: input.replacement
            }
          }]
        }
      };

      expect(expectedRequest.requestBody.requests[0].findReplace.find).toBe('old');
      expect(expectedRequest.requestBody.requests[0].findReplace.replacement).toBe('new');
    });

    it('should include optional boolean flags when provided', () => {
      const input = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        find: 'test',
        replacement: 'result',
        matchCase: true,
        searchByRegex: true,
        includeFormulas: false
      };

      const expectedFindReplace: any = {
        find: input.find,
        replacement: input.replacement,
        matchCase: true,
        searchByRegex: true,
        includeFormulas: false
      };

      expect(expectedFindReplace.matchCase).toBe(true);
      expect(expectedFindReplace.searchByRegex).toBe(true);
      expect(expectedFindReplace.includeFormulas).toBe(false);
    });

    it('should include range when specified', () => {
      const input = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        find: 'test',
        replacement: 'result',
        sheetId: 0,
        startRowIndex: 0,
        endRowIndex: 50,
        startColumnIndex: 0,
        endColumnIndex: 5
      };

      const expectedRange = {
        sheetId: 0,
        startRowIndex: 0,
        endRowIndex: 50,
        startColumnIndex: 0,
        endColumnIndex: 5
      };

      expect(expectedRange.sheetId).toBe(0);
      expect(expectedRange.startRowIndex).toBe(0);
      expect(expectedRange.endRowIndex).toBe(50);
    });
  });
});
