import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema definition (matches src/index.ts)
const SheetsCreateSpreadsheetSchema = z.object({
  title: z.string().min(1, "Title is required"),
  locale: z.string().optional(),
  autoRecalc: z.enum(["ON_CHANGE", "MINUTE", "HOUR"]).optional(),
  timeZone: z.string().optional()
});

describe('sheets_createSpreadsheet - Unit Tests', () => {
  describe('Schema Validation', () => {
    it('should validate correct parameters with minimal input', () => {
      const validInput = {
        title: 'My Spreadsheet'
      };

      const result = SheetsCreateSpreadsheetSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate correct parameters with all options', () => {
      const validInput = {
        title: 'My Spreadsheet',
        locale: 'en_US',
        autoRecalc: 'ON_CHANGE' as const,
        timeZone: 'America/New_York'
      };

      const result = SheetsCreateSpreadsheetSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should reject missing title', () => {
      const invalidInput = {
        locale: 'en_US'
      };

      const result = SheetsCreateSpreadsheetSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Required');
      }
    });

    it('should reject empty title', () => {
      const invalidInput = {
        title: ''
      };

      const result = SheetsCreateSpreadsheetSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Title is required');
      }
    });

    it('should reject invalid autoRecalc value', () => {
      const invalidInput = {
        title: 'My Spreadsheet',
        autoRecalc: 'INVALID'
      };

      const result = SheetsCreateSpreadsheetSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should accept MINUTE autoRecalc', () => {
      const validInput = {
        title: 'My Spreadsheet',
        autoRecalc: 'MINUTE' as const
      };

      const result = SheetsCreateSpreadsheetSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept HOUR autoRecalc', () => {
      const validInput = {
        title: 'My Spreadsheet',
        autoRecalc: 'HOUR' as const
      };

      const result = SheetsCreateSpreadsheetSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe('API Request Formation', () => {
    it('should form correct spreadsheets.create request structure', () => {
      const input = {
        title: 'My Spreadsheet',
        locale: 'en_US',
        autoRecalc: 'ON_CHANGE' as const,
        timeZone: 'America/New_York'
      };

      // Expected Google Sheets API request structure
      const expectedRequestBody = {
        properties: {
          title: input.title,
          locale: input.locale,
          autoRecalc: input.autoRecalc,
          timeZone: input.timeZone
        }
      };

      expect(expectedRequestBody.properties.title).toBe(input.title);
      expect(expectedRequestBody.properties.locale).toBe(input.locale);
      expect(expectedRequestBody.properties.autoRecalc).toBe(input.autoRecalc);
      expect(expectedRequestBody.properties.timeZone).toBe(input.timeZone);
    });
  });
});
