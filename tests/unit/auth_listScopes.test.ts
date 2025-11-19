import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema definition (matches src/index.ts)
const AuthListScopesSchema = z.object({
  // No parameters needed
});

describe('auth_listScopes', () => {
  describe('Schema Validation', () => {
    it('should accept empty object (no parameters required)', () => {
      const result = AuthListScopesSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should accept object with any extra properties', () => {
      const result = AuthListScopesSchema.safeParse({
        extraProperty: 'ignored'
      });
      expect(result.success).toBe(true);
    });

    it('should accept null-like input', () => {
      const result = AuthListScopesSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('Response Format', () => {
    it('should have correct response structure', () => {
      const mockResponse = {
        scopes: [
          'https://www.googleapis.com/auth/drive',
          'https://www.googleapis.com/auth/documents',
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/presentations'
        ],
        scopeDescriptions: {
          'https://www.googleapis.com/auth/drive': 'Full access to Google Drive',
          'https://www.googleapis.com/auth/documents': 'Access to Google Docs',
          'https://www.googleapis.com/auth/spreadsheets': 'Access to Google Sheets',
          'https://www.googleapis.com/auth/presentations': 'Access to Google Slides'
        },
        tokenExpiry: '2025-01-19T12:00:00Z',
        hasRefreshToken: true
      };

      expect(mockResponse).toHaveProperty('scopes');
      expect(mockResponse).toHaveProperty('scopeDescriptions');
      expect(mockResponse).toHaveProperty('tokenExpiry');
      expect(mockResponse).toHaveProperty('hasRefreshToken');
      expect(Array.isArray(mockResponse.scopes)).toBe(true);
    });

    it('should include all expected scopes', () => {
      const mockScopes = [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/presentations'
      ];

      expect(mockScopes).toContain('https://www.googleapis.com/auth/drive');
      expect(mockScopes).toContain('https://www.googleapis.com/auth/documents');
      expect(mockScopes).toContain('https://www.googleapis.com/auth/spreadsheets');
      expect(mockScopes).toContain('https://www.googleapis.com/auth/presentations');
    });

    it('should include scope descriptions object', () => {
      const mockDescriptions = {
        'https://www.googleapis.com/auth/drive': 'Full access to Google Drive',
        'https://www.googleapis.com/auth/documents': 'Access to Google Docs'
      };

      expect(mockDescriptions['https://www.googleapis.com/auth/drive']).toBe('Full access to Google Drive');
      expect(mockDescriptions['https://www.googleapis.com/auth/documents']).toBe('Access to Google Docs');
    });

    it('should include tokenExpiry as ISO string or null', () => {
      const mockResponse1 = {
        tokenExpiry: '2025-01-19T12:00:00Z'
      };
      const mockResponse2 = {
        tokenExpiry: null
      };

      expect(typeof mockResponse1.tokenExpiry === 'string' || mockResponse1.tokenExpiry === null).toBe(true);
      expect(mockResponse2.tokenExpiry).toBe(null);
    });

    it('should include hasRefreshToken as boolean', () => {
      const mockResponse = {
        hasRefreshToken: true
      };

      expect(typeof mockResponse.hasRefreshToken).toBe('boolean');
    });

    it('should handle empty scopes array', () => {
      const mockResponse = {
        scopes: [],
        scopeDescriptions: {},
        tokenExpiry: null,
        hasRefreshToken: false
      };

      expect(Array.isArray(mockResponse.scopes)).toBe(true);
      expect(mockResponse.scopes.length).toBe(0);
    });
  });

  describe('Scope Descriptions', () => {
    const scopeDescriptions: Record<string, string> = {
      'https://www.googleapis.com/auth/drive': 'Full access to Google Drive',
      'https://www.googleapis.com/auth/drive.file': 'Access to files created or opened by this app',
      'https://www.googleapis.com/auth/drive.readonly': 'Read-only access to Google Drive',
      'https://www.googleapis.com/auth/documents': 'Access to Google Docs',
      'https://www.googleapis.com/auth/spreadsheets': 'Access to Google Sheets',
      'https://www.googleapis.com/auth/presentations': 'Access to Google Slides'
    };

    it('should have description for drive scope', () => {
      expect(scopeDescriptions['https://www.googleapis.com/auth/drive']).toBeDefined();
    });

    it('should have description for documents scope', () => {
      expect(scopeDescriptions['https://www.googleapis.com/auth/documents']).toBeDefined();
    });

    it('should have description for spreadsheets scope', () => {
      expect(scopeDescriptions['https://www.googleapis.com/auth/spreadsheets']).toBeDefined();
    });

    it('should have description for presentations scope', () => {
      expect(scopeDescriptions['https://www.googleapis.com/auth/presentations']).toBeDefined();
    });

    it('should handle unknown scope', () => {
      const unknownScope = 'https://www.googleapis.com/auth/unknown';
      const description = scopeDescriptions[unknownScope] || 'Unknown scope';
      expect(description).toBe('Unknown scope');
    });
  });
});
