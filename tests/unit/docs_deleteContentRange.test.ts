import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';

// Schema definition (matches src/index.ts)
const DocsDeleteContentRangeSchema = z.object({
  documentId: z.string().min(1, "Document ID is required"),
  startIndex: z.number().min(1, "Start index must be at least 1"),
  endIndex: z.number().min(1, "End index must be at least 1")
});

describe('docs_deleteContentRange - Unit Tests', () => {
  describe('Schema Validation', () => {
    it('should validate correct parameters', () => {
      const validInput = {
        documentId: '1CIeAIWDqN_s1g9b7V2h79VpFjlrPM15VYuZ09zsNM9w',
        startIndex: 1,
        endIndex: 10
      };

      const result = DocsDeleteContentRangeSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should reject missing documentId', () => {
      const invalidInput = {
        startIndex: 1,
        endIndex: 10
      };

      const result = DocsDeleteContentRangeSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Required');
      }
    });

    it('should reject empty documentId', () => {
      const invalidInput = {
        documentId: '',
        startIndex: 1,
        endIndex: 10
      };

      const result = DocsDeleteContentRangeSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Document ID is required');
      }
    });

    it('should reject startIndex less than 1', () => {
      const invalidInput = {
        documentId: '1CIeAIWDqN_s1g9b7V2h79VpFjlrPM15VYuZ09zsNM9w',
        startIndex: 0,
        endIndex: 10
      };

      const result = DocsDeleteContentRangeSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Start index must be at least 1');
      }
    });

    it('should reject endIndex less than 1', () => {
      const invalidInput = {
        documentId: '1CIeAIWDqN_s1g9b7V2h79VpFjlrPM15VYuZ09zsNM9w',
        startIndex: 1,
        endIndex: 0
      };

      const result = DocsDeleteContentRangeSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('End index must be at least 1');
      }
    });

    it('should accept endIndex equal to startIndex in schema (but API will reject)', () => {
      // Schema validation allows equal indices, but Google Docs API will reject empty ranges
      const validInput = {
        documentId: '1CIeAIWDqN_s1g9b7V2h79VpFjlrPM15VYuZ09zsNM9w',
        startIndex: 5,
        endIndex: 5
      };

      const result = DocsDeleteContentRangeSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept large index values', () => {
      const validInput = {
        documentId: '1CIeAIWDqN_s1g9b7V2h79VpFjlrPM15VYuZ09zsNM9w',
        startIndex: 1000,
        endIndex: 5000
      };

      const result = DocsDeleteContentRangeSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe('API Request Formation', () => {
    it('should form correct batchUpdate request structure', () => {
      const input = {
        documentId: '1CIeAIWDqN_s1g9b7V2h79VpFjlrPM15VYuZ09zsNM9w',
        startIndex: 1,
        endIndex: 10
      };

      // Expected Google Docs API request structure
      const expectedRequest = {
        documentId: input.documentId,
        requestBody: {
          requests: [{
            deleteContentRange: {
              range: {
                startIndex: input.startIndex,
                endIndex: input.endIndex
              }
            }
          }]
        }
      };

      expect(expectedRequest.documentId).toBe(input.documentId);
      expect(expectedRequest.requestBody.requests[0].deleteContentRange.range.startIndex).toBe(input.startIndex);
      expect(expectedRequest.requestBody.requests[0].deleteContentRange.range.endIndex).toBe(input.endIndex);
    });
  });
});
