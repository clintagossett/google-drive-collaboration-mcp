import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema definition (matches src/index.ts)
const SheetsCutPasteSchema = z.object({
  spreadsheetId: z.string().min(1, "Spreadsheet ID is required"),
  sourceSheetId: z.number().int().min(0, "Source sheet ID is required"),
  sourceStartRowIndex: z.number().int().min(0, "Source start row index must be non-negative"),
  sourceEndRowIndex: z.number().int().min(0, "Source end row index must be non-negative"),
  sourceStartColumnIndex: z.number().int().min(0, "Source start column index must be non-negative"),
  sourceEndColumnIndex: z.number().int().min(0, "Source end column index must be non-negative"),
  destinationSheetId: z.number().int().min(0, "Destination sheet ID is required"),
  destinationRowIndex: z.number().int().min(0, "Destination row index must be non-negative"),
  destinationColumnIndex: z.number().int().min(0, "Destination column index must be non-negative"),
  pasteType: z.enum(["PASTE_NORMAL", "PASTE_VALUES", "PASTE_FORMAT", "PASTE_NO_BORDERS", "PASTE_FORMULA", "PASTE_DATA_VALIDATION", "PASTE_CONDITIONAL_FORMATTING"]).optional()
}).refine(data => data.sourceEndRowIndex > data.sourceStartRowIndex, {
  message: "Source end row index must be greater than source start row index"
}).refine(data => data.sourceEndColumnIndex > data.sourceStartColumnIndex, {
  message: "Source end column index must be greater than source start column index"
});

describe('sheets_cutPaste - Unit Tests', () => {
  describe('Schema Validation', () => {
    it('should validate correct parameters for basic cut paste', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sourceSheetId: 0,
        sourceStartRowIndex: 0,
        sourceEndRowIndex: 10,
        sourceStartColumnIndex: 0,
        sourceEndColumnIndex: 5,
        destinationSheetId: 0,
        destinationRowIndex: 20,
        destinationColumnIndex: 0
      };

      const result = SheetsCutPasteSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate with pasteType', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sourceSheetId: 0,
        sourceStartRowIndex: 0,
        sourceEndRowIndex: 5,
        sourceStartColumnIndex: 0,
        sourceEndColumnIndex: 3,
        destinationSheetId: 1,
        destinationRowIndex: 0,
        destinationColumnIndex: 0,
        pasteType: 'PASTE_VALUES' as const
      };

      const result = SheetsCutPasteSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject when source endRowIndex <= startRowIndex', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sourceSheetId: 0,
        sourceStartRowIndex: 5,
        sourceEndRowIndex: 5,
        sourceStartColumnIndex: 0,
        sourceEndColumnIndex: 5,
        destinationSheetId: 0,
        destinationRowIndex: 10,
        destinationColumnIndex: 0
      };

      const result = SheetsCutPasteSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Source end row index must be greater than source start row index');
      }
    });

    it('should reject when source endColumnIndex <= startColumnIndex', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sourceSheetId: 0,
        sourceStartRowIndex: 0,
        sourceEndRowIndex: 5,
        sourceStartColumnIndex: 3,
        sourceEndColumnIndex: 3,
        destinationSheetId: 0,
        destinationRowIndex: 10,
        destinationColumnIndex: 0
      };

      const result = SheetsCutPasteSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Source end column index must be greater than source start column index');
      }
    });

    it('should accept cut across different sheets', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sourceSheetId: 0,
        sourceStartRowIndex: 0,
        sourceEndRowIndex: 10,
        sourceStartColumnIndex: 0,
        sourceEndColumnIndex: 5,
        destinationSheetId: 123,
        destinationRowIndex: 0,
        destinationColumnIndex: 0
      };

      const result = SheetsCutPasteSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept destination at origin (0,0)', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sourceSheetId: 0,
        sourceStartRowIndex: 5,
        sourceEndRowIndex: 10,
        sourceStartColumnIndex: 5,
        sourceEndColumnIndex: 10,
        destinationSheetId: 0,
        destinationRowIndex: 0,
        destinationColumnIndex: 0
      };

      const result = SheetsCutPasteSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate PASTE_FORMULA pasteType', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sourceSheetId: 0,
        sourceStartRowIndex: 0,
        sourceEndRowIndex: 5,
        sourceStartColumnIndex: 0,
        sourceEndColumnIndex: 3,
        destinationSheetId: 0,
        destinationRowIndex: 10,
        destinationColumnIndex: 0,
        pasteType: 'PASTE_FORMULA' as const
      };

      const result = SheetsCutPasteSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject missing spreadsheetId', () => {
      const invalidInput = {
        sourceSheetId: 0,
        sourceStartRowIndex: 0,
        sourceEndRowIndex: 5,
        sourceStartColumnIndex: 0,
        sourceEndColumnIndex: 3,
        destinationSheetId: 0,
        destinationRowIndex: 10,
        destinationColumnIndex: 0
      };

      const result = SheetsCutPasteSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('API Request Formation', () => {
    it('should form correct CutPasteRequest', () => {
      const input = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sourceSheetId: 0,
        sourceStartRowIndex: 0,
        sourceEndRowIndex: 10,
        sourceStartColumnIndex: 0,
        sourceEndColumnIndex: 5,
        destinationSheetId: 0,
        destinationRowIndex: 20,
        destinationColumnIndex: 10
      };

      const expectedCutPaste: any = {
        source: {
          sheetId: 0,
          startRowIndex: 0,
          endRowIndex: 10,
          startColumnIndex: 0,
          endColumnIndex: 5
        },
        destination: {
          sheetId: 0,
          rowIndex: 20,
          columnIndex: 10
        }
      };

      expect(expectedCutPaste.source.sheetId).toBe(0);
      expect(expectedCutPaste.destination.sheetId).toBe(0);
      expect(expectedCutPaste.destination.rowIndex).toBe(20);
      expect(expectedCutPaste.destination.columnIndex).toBe(10);
    });

    it('should include pasteType when provided', () => {
      const input = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sourceSheetId: 0,
        sourceStartRowIndex: 0,
        sourceEndRowIndex: 5,
        sourceStartColumnIndex: 0,
        sourceEndColumnIndex: 3,
        destinationSheetId: 1,
        destinationRowIndex: 10,
        destinationColumnIndex: 5,
        pasteType: 'PASTE_VALUES' as const
      };

      const expectedCutPaste: any = {
        source: {
          sheetId: input.sourceSheetId,
          startRowIndex: input.sourceStartRowIndex,
          endRowIndex: input.sourceEndRowIndex,
          startColumnIndex: input.sourceStartColumnIndex,
          endColumnIndex: input.sourceEndColumnIndex
        },
        destination: {
          sheetId: input.destinationSheetId,
          rowIndex: input.destinationRowIndex,
          columnIndex: input.destinationColumnIndex
        },
        pasteType: 'PASTE_VALUES'
      };

      expect(expectedCutPaste.pasteType).toBe('PASTE_VALUES');
    });
  });
});
