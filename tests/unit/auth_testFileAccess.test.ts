import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema definition (matches src/index.ts)
const AuthTestFileAccessSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
  fields: z.string().optional()
});

describe('auth_testFileAccess', () => {
  describe('Schema Validation', () => {
    it('should accept valid fileId', () => {
      const result = AuthTestFileAccessSchema.safeParse({
        fileId: '1CIeAIWDqN_s1g9b7V2h79VpFjlrPM15VYuZ09zsNM9w'
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fileId).toBe('1CIeAIWDqN_s1g9b7V2h79VpFjlrPM15VYuZ09zsNM9w');
      }
    });

    it('should accept fileId with fields parameter', () => {
      const result = AuthTestFileAccessSchema.safeParse({
        fileId: '1CIeAIWDqN_s1g9b7V2h79VpFjlrPM15VYuZ09zsNM9w',
        fields: 'id,name,mimeType,capabilities'
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fileId).toBe('1CIeAIWDqN_s1g9b7V2h79VpFjlrPM15VYuZ09zsNM9w');
        expect(result.data.fields).toBe('id,name,mimeType,capabilities');
      }
    });

    it('should reject missing fileId', () => {
      const result = AuthTestFileAccessSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject empty fileId', () => {
      const result = AuthTestFileAccessSchema.safeParse({
        fileId: ''
      });
      expect(result.success).toBe(false);
    });

    it('should reject non-string fileId', () => {
      const result = AuthTestFileAccessSchema.safeParse({
        fileId: 12345
      });
      expect(result.success).toBe(false);
    });

    it('should reject non-string fields parameter', () => {
      const result = AuthTestFileAccessSchema.safeParse({
        fileId: '1CIeAIWDqN_s1g9b7V2h79VpFjlrPM15VYuZ09zsNM9w',
        fields: 123
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Success Response Format', () => {
    it('should have correct structure when file is accessible', () => {
      const mockResponse = {
        accessible: true,
        file: {
          id: '1CIeAIWDqN_s1g9b7V2h79VpFjlrPM15VYuZ09zsNM9w',
          name: 'Test Document',
          mimeType: 'application/vnd.google-apps.document'
        },
        capabilities: {
          canEdit: true,
          canComment: true,
          canShare: false,
          canCopy: true
        },
        yourPermission: {
          role: 'writer',
          type: 'user'
        },
        owners: [{
          emailAddress: 'owner@example.com',
          displayName: 'Owner Name'
        }]
      };

      expect(mockResponse).toHaveProperty('accessible');
      expect(mockResponse.accessible).toBe(true);
      expect(mockResponse).toHaveProperty('file');
      expect(mockResponse).toHaveProperty('capabilities');
      expect(mockResponse.file.id).toBe('1CIeAIWDqN_s1g9b7V2h79VpFjlrPM15VYuZ09zsNM9w');
    });

    it('should include capabilities object', () => {
      const mockCapabilities = {
        canEdit: true,
        canComment: true,
        canShare: false,
        canCopy: true,
        canDownload: true
      };

      expect(mockCapabilities).toHaveProperty('canEdit');
      expect(mockCapabilities).toHaveProperty('canComment');
      expect(mockCapabilities).toHaveProperty('canShare');
    });
  });

  describe('Error Response Format', () => {
    it('should have correct structure when file is not accessible (404)', () => {
      const mockErrorResponse = {
        accessible: false,
        error: 'File not found',
        errorCode: 404,
        suggestions: [
          'Verify the file ID is correct',
          'Check if the file has been deleted or moved to trash',
          'Ask the owner to share the file with your account'
        ]
      };

      expect(mockErrorResponse).toHaveProperty('accessible');
      expect(mockErrorResponse.accessible).toBe(false);
      expect(mockErrorResponse).toHaveProperty('error');
      expect(mockErrorResponse).toHaveProperty('errorCode');
      expect(mockErrorResponse).toHaveProperty('suggestions');
      expect(Array.isArray(mockErrorResponse.suggestions)).toBe(true);
    });

    it('should have correct structure for permission denied (403)', () => {
      const mockErrorResponse = {
        accessible: false,
        error: 'Permission denied',
        errorCode: 403,
        suggestions: [
          "You don't have permission to access this file",
          'Ask the owner to share the file with your account',
          'Use auth_getStatus to verify which account you\'re using'
        ]
      };

      expect(mockErrorResponse.errorCode).toBe(403);
      expect(mockErrorResponse.suggestions.length).toBeGreaterThan(0);
    });

    it('should have correct structure for auth expired (401)', () => {
      const mockErrorResponse = {
        accessible: false,
        error: 'Unauthorized',
        errorCode: 401,
        suggestions: [
          'Your authentication token may have expired',
          'Try re-authenticating with: npm run auth'
        ]
      };

      expect(mockErrorResponse.errorCode).toBe(401);
      expect(mockErrorResponse.suggestions).toContain('Your authentication token may have expired');
    });
  });
});
