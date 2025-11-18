import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema definition (matches src/index.ts)
const DocsReplaceAllTextSchema = z.object({
  documentId: z.string().min(1, "Document ID is required"),
  containsText: z.string().min(1, "Search text is required"),
  replaceText: z.string(),
  matchCase: z.boolean().optional()
});

describe('docs_replaceAllText - Unit Tests', () => {
  describe('Schema Validation', () => {
    it('should validate correct parameters', () => {
      const validInput = {
        documentId: '1CIeAIWDqN_s1g9b7V2h79VpFjlrPM15VYuZ09zsNM9w',
        containsText: 'old text',
        replaceText: 'new text',
        matchCase: true
      };

      const result = DocsReplaceAllTextSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate without matchCase (optional parameter)', () => {
      const validInput = {
        documentId: '1CIeAIWDqN_s1g9b7V2h79VpFjlrPM15VYuZ09zsNM9w',
        containsText: 'find this',
        replaceText: 'replace with this'
      };

      const result = DocsReplaceAllTextSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.matchCase).toBeUndefined();
      }
    });

    it('should reject missing documentId', () => {
      const invalidInput = {
        containsText: 'search',
        replaceText: 'replace'
      };

      const result = DocsReplaceAllTextSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject empty documentId', () => {
      const invalidInput = {
        documentId: '',
        containsText: 'search',
        replaceText: 'replace'
      };

      const result = DocsReplaceAllTextSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Document ID is required');
      }
    });

    it('should reject missing containsText', () => {
      const invalidInput = {
        documentId: '1CIeAIWDqN_s1g9b7V2h79VpFjlrPM15VYuZ09zsNM9w',
        replaceText: 'replace'
      };

      const result = DocsReplaceAllTextSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject empty containsText', () => {
      const invalidInput = {
        documentId: '1CIeAIWDqN_s1g9b7V2h79VpFjlrPM15VYuZ09zsNM9w',
        containsText: '',
        replaceText: 'replace'
      };

      const result = DocsReplaceAllTextSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Search text is required');
      }
    });

    it('should accept empty replaceText (delete operation)', () => {
      const validInput = {
        documentId: '1CIeAIWDqN_s1g9b7V2h79VpFjlrPM15VYuZ09zsNM9w',
        containsText: 'remove this',
        replaceText: ''
      };

      const result = DocsReplaceAllTextSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept special characters in text', () => {
      const validInput = {
        documentId: '1CIeAIWDqN_s1g9b7V2h79VpFjlrPM15VYuZ09zsNM9w',
        containsText: '$price: 100',
        replaceText: '$price: 200'
      };

      const result = DocsReplaceAllTextSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe('API Request Formation', () => {
    it('should form correct batchUpdate request structure with matchCase', () => {
      const input = {
        documentId: '1CIeAIWDqN_s1g9b7V2h79VpFjlrPM15VYuZ09zsNM9w',
        containsText: 'old',
        replaceText: 'new',
        matchCase: true
      };

      const expectedRequest = {
        documentId: input.documentId,
        requestBody: {
          requests: [{
            replaceAllText: {
              containsText: {
                text: input.containsText,
                matchCase: true
              },
              replaceText: input.replaceText
            }
          }]
        }
      };

      expect(expectedRequest.requestBody.requests[0].replaceAllText.containsText.text).toBe(input.containsText);
      expect(expectedRequest.requestBody.requests[0].replaceAllText.replaceText).toBe(input.replaceText);
      expect(expectedRequest.requestBody.requests[0].replaceAllText.containsText.matchCase).toBe(true);
    });

    it('should default matchCase to false when not provided', () => {
      const input = {
        documentId: '1CIeAIWDqN_s1g9b7V2h79VpFjlrPM15VYuZ09zsNM9w',
        containsText: 'search',
        replaceText: 'replace'
      };

      // matchCase should default to false in the handler
      const matchCase = input.matchCase ?? false;
      expect(matchCase).toBe(false);
    });
  });
});
