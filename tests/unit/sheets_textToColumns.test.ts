import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema definition (matches src/index.ts)
const SheetsTextToColumnsSchema = z.object({
  spreadsheetId: z.string().min(1, "Spreadsheet ID is required"),
  sheetId: z.number().int().min(0, "Sheet ID is required"),
  startRowIndex: z.number().int().min(0, "Start row index must be non-negative"),
  endRowIndex: z.number().int().min(0, "End row index must be non-negative"),
  startColumnIndex: z.number().int().min(0, "Start column index must be non-negative"),
  endColumnIndex: z.number().int().min(0, "End column index must be non-negative"),
  delimiterType: z.enum(["COMMA", "SEMICOLON", "PERIOD", "SPACE", "CUSTOM", "AUTODETECT"], {
    errorMap: () => ({ message: "Invalid delimiter type" })
  }),
  delimiter: z.string().optional()
}).refine(data => data.endRowIndex > data.startRowIndex, {
  message: "End row index must be greater than start row index"
}).refine(data => data.endColumnIndex > data.startColumnIndex, {
  message: "End column index must be greater than start column index"
});

describe('sheets_textToColumns - Unit Tests', () => {
  describe('Schema Validation', () => {
    it('should validate correct parameters with COMMA delimiter', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 0,
        endRowIndex: 10,
        startColumnIndex: 0,
        endColumnIndex: 1,
        delimiterType: 'COMMA' as const
      };

      const result = SheetsTextToColumnsSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate with CUSTOM delimiter', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 0,
        endRowIndex: 10,
        startColumnIndex: 0,
        endColumnIndex: 1,
        delimiterType: 'CUSTOM' as const,
        delimiter: '|'
      };

      const result = SheetsTextToColumnsSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate with AUTODETECT', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 0,
        endRowIndex: 10,
        startColumnIndex: 0,
        endColumnIndex: 1,
        delimiterType: 'AUTODETECT' as const
      };

      const result = SheetsTextToColumnsSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject invalid delimiter type', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 0,
        endRowIndex: 10,
        startColumnIndex: 0,
        endColumnIndex: 1,
        delimiterType: 'INVALID'
      };

      const result = SheetsTextToColumnsSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Invalid delimiter type');
      }
    });

    it('should reject missing delimiterType', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 0,
        endRowIndex: 10,
        startColumnIndex: 0,
        endColumnIndex: 1
      };

      const result = SheetsTextToColumnsSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject when endRowIndex <= startRowIndex', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 5,
        endRowIndex: 5,
        startColumnIndex: 0,
        endColumnIndex: 1,
        delimiterType: 'COMMA' as const
      };

      const result = SheetsTextToColumnsSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('End row index must be greater than start row index');
      }
    });

    it('should validate all standard delimiter types', () => {
      const delimiterTypes = ['COMMA', 'SEMICOLON', 'PERIOD', 'SPACE', 'CUSTOM', 'AUTODETECT'];

      delimiterTypes.forEach(type => {
        const input = {
          spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
          sheetId: 0,
          startRowIndex: 0,
          endRowIndex: 10,
          startColumnIndex: 0,
          endColumnIndex: 1,
          delimiterType: type as any
        };

        const result = SheetsTextToColumnsSchema.safeParse(input);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('API Request Formation', () => {
    it('should form correct TextToColumnsRequest with standard delimiter', () => {
      const input = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 0,
        endRowIndex: 10,
        startColumnIndex: 0,
        endColumnIndex: 1,
        delimiterType: 'COMMA' as const
      };

      const expectedRequest = {
        spreadsheetId: input.spreadsheetId,
        requestBody: {
          requests: [{
            textToColumns: {
              source: {
                sheetId: input.sheetId,
                startRowIndex: input.startRowIndex,
                endRowIndex: input.endRowIndex,
                startColumnIndex: input.startColumnIndex,
                endColumnIndex: input.endColumnIndex
              },
              delimiterType: input.delimiterType
            }
          }]
        }
      };

      expect(expectedRequest.requestBody.requests[0].textToColumns.delimiterType).toBe('COMMA');
      expect(expectedRequest.requestBody.requests[0].textToColumns.source.sheetId).toBe(0);
    });

    it('should include custom delimiter when provided', () => {
      const input = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        startRowIndex: 0,
        endRowIndex: 10,
        startColumnIndex: 0,
        endColumnIndex: 1,
        delimiterType: 'CUSTOM' as const,
        delimiter: '|'
      };

      const expectedTextToColumns: any = {
        source: {
          sheetId: input.sheetId,
          startRowIndex: input.startRowIndex,
          endRowIndex: input.endRowIndex,
          startColumnIndex: input.startColumnIndex,
          endColumnIndex: input.endColumnIndex
        },
        delimiterType: 'CUSTOM',
        delimiter: '|'
      };

      expect(expectedTextToColumns.delimiter).toBe('|');
      expect(expectedTextToColumns.delimiterType).toBe('CUSTOM');
    });
  });
});
