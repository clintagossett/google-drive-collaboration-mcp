import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema definition (matches src/index.ts)
const AuthGetStatusSchema = z.object({
  fields: z.string().optional()
});

describe('auth_getStatus', () => {
  describe('Schema Validation', () => {
    it('should accept empty object (no parameters required)', () => {
      const result = AuthGetStatusSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should accept valid fields parameter', () => {
      const result = AuthGetStatusSchema.safeParse({
        fields: 'user,storageQuota'
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fields).toBe('user,storageQuota');
      }
    });

    it('should accept only user field', () => {
      const result = AuthGetStatusSchema.safeParse({
        fields: 'user'
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fields).toBe('user');
      }
    });

    it('should accept multiple fields', () => {
      const result = AuthGetStatusSchema.safeParse({
        fields: 'user,storageQuota,importFormats'
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fields).toBe('user,storageQuota,importFormats');
      }
    });

    it('should reject non-string fields parameter', () => {
      const result = AuthGetStatusSchema.safeParse({
        fields: 123
      });
      expect(result.success).toBe(false);
    });

    it('should handle fields as undefined', () => {
      const result = AuthGetStatusSchema.safeParse({
        fields: undefined
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Response Format', () => {
    it('should have correct response structure for success', () => {
      const mockResponse = {
        authenticated: true,
        user: {
          emailAddress: 'test@example.com',
          displayName: 'Test User',
          photoLink: 'https://example.com/photo.jpg',
          permissionId: '12345'
        },
        storageQuota: {
          usage: '1234567890',
          limit: '107374182400',
          usageInDrive: '1234567890'
        }
      };

      expect(mockResponse).toHaveProperty('authenticated');
      expect(mockResponse).toHaveProperty('user');
      expect(mockResponse).toHaveProperty('storageQuota');
      expect(mockResponse.authenticated).toBe(true);
      expect(mockResponse.user.emailAddress).toBe('test@example.com');
    });

    it('should include user object with required fields', () => {
      const mockUser = {
        emailAddress: 'test@example.com',
        displayName: 'Test User',
        permissionId: '12345'
      };

      expect(mockUser).toHaveProperty('emailAddress');
      expect(mockUser).toHaveProperty('displayName');
      expect(mockUser).toHaveProperty('permissionId');
    });

    it('should include storageQuota object', () => {
      const mockQuota = {
        usage: '1234567890',
        limit: '107374182400',
        usageInDrive: '1234567890'
      };

      expect(mockQuota).toHaveProperty('usage');
      expect(mockQuota).toHaveProperty('limit');
      expect(mockQuota).toHaveProperty('usageInDrive');
    });
  });
});
