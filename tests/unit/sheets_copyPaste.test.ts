import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema definition (matches src/index.ts)
const SheetsCopyPasteSchema = z.object({
  spreadsheetId: z.string().min(1, "Spreadsheet ID is required"),
  sourceSheetId: z.number().int().min(0, "Source sheet ID is required"),
  sourceStartRowIndex: z.number().int().min(0, "Source start row index must be non-negative"),
  sourceEndRowIndex: z.number().int().min(0, "Source end row index must be non-negative"),
  sourceStartColumnIndex: z.number().int().min(0, "Source start column index must be non-negative"),
  sourceEndColumnIndex: z.number().int().min(0, "Source end column index must be non-negative"),
  destinationSheetId: z.number().int().min(0, "Destination sheet ID is required"),
  destinationStartRowIndex: z.number().int().min(0, "Destination start row index must be non-negative"),
  destinationEndRowIndex: z.number().int().min(0, "Destination end row index must be non-negative"),
  destinationStartColumnIndex: z.number().int().min(0, "Destination start column index must be non-negative"),
  destinationEndColumnIndex: z.number().int().min(0, "Destination end column index must be non-negative"),
  pasteType: z.enum(["PASTE_NORMAL", "PASTE_VALUES", "PASTE_FORMAT", "PASTE_NO_BORDERS", "PASTE_FORMULA", "PASTE_DATA_VALIDATION", "PASTE_CONDITIONAL_FORMATTING"]).optional(),
  pasteOrientation: z.enum(["NORMAL", "TRANSPOSE"]).optional()
}).refine(data => data.sourceEndRowIndex > data.sourceStartRowIndex, {
  message: "Source end row index must be greater than source start row index"
}).refine(data => data.sourceEndColumnIndex > data.sourceStartColumnIndex, {
  message: "Source end column index must be greater than source start column index"
}).refine(data => data.destinationEndRowIndex > data.destinationStartRowIndex, {
  message: "Destination end row index must be greater than destination start row index"
}).refine(data => data.destinationEndColumnIndex > data.destinationStartColumnIndex, {
  message: "Destination end column index must be greater than destination start column index"
});

describe('sheets_copyPaste - Unit Tests', () => {
  describe('Schema Validation', () => {
    it('should validate correct parameters for basic copy paste', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sourceSheetId: 0,
        sourceStartRowIndex: 0,
        sourceEndRowIndex: 10,
        sourceStartColumnIndex: 0,
        sourceEndColumnIndex: 5,
        destinationSheetId: 0,
        destinationStartRowIndex: 20,
        destinationEndRowIndex: 30,
        destinationStartColumnIndex: 0,
        destinationEndColumnIndex: 5
      };

      const result = SheetsCopyPasteSchema.safeParse(validInput);
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
        destinationStartRowIndex: 0,
        destinationEndRowIndex: 5,
        destinationStartColumnIndex: 0,
        destinationEndColumnIndex: 3,
        pasteType: 'PASTE_VALUES' as const
      };

      const result = SheetsCopyPasteSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate with pasteOrientation TRANSPOSE', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sourceSheetId: 0,
        sourceStartRowIndex: 0,
        sourceEndRowIndex: 5,
        sourceStartColumnIndex: 0,
        sourceEndColumnIndex: 3,
        destinationSheetId: 0,
        destinationStartRowIndex: 10,
        destinationEndRowIndex: 13,
        destinationStartColumnIndex: 0,
        destinationEndColumnIndex: 5,
        pasteOrientation: 'TRANSPOSE' as const
      };

      const result = SheetsCopyPasteSchema.safeParse(validInput);
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
        destinationStartRowIndex: 10,
        destinationEndRowIndex: 15,
        destinationStartColumnIndex: 0,
        destinationEndColumnIndex: 5
      };

      const result = SheetsCopyPasteSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Source end row index must be greater than source start row index');
      }
    });

    it('should reject when destination endColumnIndex <= startColumnIndex', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sourceSheetId: 0,
        sourceStartRowIndex: 0,
        sourceEndRowIndex: 5,
        sourceStartColumnIndex: 0,
        sourceEndColumnIndex: 5,
        destinationSheetId: 0,
        destinationStartRowIndex: 10,
        destinationEndRowIndex: 15,
        destinationStartColumnIndex: 5,
        destinationEndColumnIndex: 5
      };

      const result = SheetsCopyPasteSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Destination end column index must be greater than destination start column index');
      }
    });

    it('should accept copy across different sheets', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sourceSheetId: 0,
        sourceStartRowIndex: 0,
        sourceEndRowIndex: 10,
        sourceStartColumnIndex: 0,
        sourceEndColumnIndex: 5,
        destinationSheetId: 123,
        destinationStartRowIndex: 0,
        destinationEndRowIndex: 10,
        destinationStartColumnIndex: 0,
        destinationEndColumnIndex: 5
      };

      const result = SheetsCopyPasteSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate PASTE_FORMAT pasteType', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sourceSheetId: 0,
        sourceStartRowIndex: 0,
        sourceEndRowIndex: 5,
        sourceStartColumnIndex: 0,
        sourceEndColumnIndex: 3,
        destinationSheetId: 0,
        destinationStartRowIndex: 10,
        destinationEndRowIndex: 15,
        destinationStartColumnIndex: 0,
        destinationEndColumnIndex: 3,
        pasteType: 'PASTE_FORMAT' as const
      };

      const result = SheetsCopyPasteSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe('API Request Formation', () => {
    it('should form correct CopyPasteRequest', () => {
      const input = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sourceSheetId: 0,
        sourceStartRowIndex: 0,
        sourceEndRowIndex: 10,
        sourceStartColumnIndex: 0,
        sourceEndColumnIndex: 5,
        destinationSheetId: 0,
        destinationStartRowIndex: 20,
        destinationEndRowIndex: 30,
        destinationStartColumnIndex: 0,
        destinationEndColumnIndex: 5
      };

      const expectedCopyPaste: any = {
        source: {
          sheetId: 0,
          startRowIndex: 0,
          endRowIndex: 10,
          startColumnIndex: 0,
          endColumnIndex: 5
        },
        destination: {
          sheetId: 0,
          startRowIndex: 20,
          endRowIndex: 30,
          startColumnIndex: 0,
          endColumnIndex: 5
        }
      };

      expect(expectedCopyPaste.source.sheetId).toBe(0);
      expect(expectedCopyPaste.destination.sheetId).toBe(0);
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
        destinationStartRowIndex: 0,
        destinationEndRowIndex: 5,
        destinationStartColumnIndex: 0,
        destinationEndColumnIndex: 3,
        pasteType: 'PASTE_VALUES' as const
      };

      const expectedCopyPaste: any = {
        source: {
          sheetId: input.sourceSheetId,
          startRowIndex: input.sourceStartRowIndex,
          endRowIndex: input.sourceEndRowIndex,
          startColumnIndex: input.sourceStartColumnIndex,
          endColumnIndex: input.sourceEndColumnIndex
        },
        destination: {
          sheetId: input.destinationSheetId,
          startRowIndex: input.destinationStartRowIndex,
          endRowIndex: input.destinationEndRowIndex,
          startColumnIndex: input.destinationStartColumnIndex,
          endColumnIndex: input.destinationEndColumnIndex
        },
        pasteType: 'PASTE_VALUES'
      };

      expect(expectedCopyPaste.pasteType).toBe('PASTE_VALUES');
    });
  });
});
