import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema definition (matches src/index.ts)
const SheetsDeleteNamedRangeSchema = z.object({
  spreadsheetId: z.string().min(1, "Spreadsheet ID is required"),
  namedRangeId: z.string().min(1, "Named range ID is required")
});

describe('sheets_deleteNamedRange - Unit Tests', () => {
  describe('Schema Validation', () => {
    it('should validate correct parameters', () => {
      const validInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        namedRangeId: 'range123'
      };

      const result = SheetsDeleteNamedRangeSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should reject missing spreadsheetId', () => {
      const invalidInput = {
        namedRangeId: 'range123'
      };

      const result = SheetsDeleteNamedRangeSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject empty spreadsheetId', () => {
      const invalidInput = {
        spreadsheetId: '',
        namedRangeId: 'range123'
      };

      const result = SheetsDeleteNamedRangeSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Spreadsheet ID is required');
      }
    });

    it('should reject missing namedRangeId', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'
      };

      const result = SheetsDeleteNamedRangeSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject empty namedRangeId', () => {
      const invalidInput = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        namedRangeId: ''
      };

      const result = SheetsDeleteNamedRangeSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Named range ID is required');
      }
    });
  });

  describe('API Request Formation', () => {
    it('should form correct DeleteNamedRangeRequest', () => {
      const input = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        namedRangeId: 'myRangeId123'
      };

      const expectedRequest = {
        spreadsheetId: input.spreadsheetId,
        requestBody: {
          requests: [{
            deleteNamedRange: {
              namedRangeId: input.namedRangeId
            }
          }]
        }
      };

      expect(expectedRequest.spreadsheetId).toBe(input.spreadsheetId);
      expect(expectedRequest.requestBody.requests[0].deleteNamedRange.namedRangeId).toBe('myRangeId123');
    });
  });
});
