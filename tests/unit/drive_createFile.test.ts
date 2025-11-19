import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema definition (matches src/index.ts)
const DriveCreateFileSchema = z.object({
  name: z.string().min(1, "File name is required"),
  mimeType: z.string().min(1, "MIME type is required"),
  parents: z.array(z.string()).optional(),
  description: z.string().optional(),
  properties: z.record(z.string()).optional()
});

describe('drive_createFile - Unit Tests', () => {
  describe('Schema Validation', () => {
    it('should validate correct parameters with minimal input', () => {
      const validInput = {
        name: 'My Document',
        mimeType: 'application/vnd.google-apps.document'
      };

      const result = DriveCreateFileSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate folder creation', () => {
      const validInput = {
        name: 'My Folder',
        mimeType: 'application/vnd.google-apps.folder'
      };

      const result = DriveCreateFileSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate with parents array', () => {
      const validInput = {
        name: 'My Document',
        mimeType: 'application/vnd.google-apps.document',
        parents: ['folder-id-123']
      };

      const result = DriveCreateFileSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.parents).toEqual(['folder-id-123']);
      }
    });

    it('should validate with description', () => {
      const validInput = {
        name: 'My Document',
        mimeType: 'application/vnd.google-apps.document',
        description: 'This is a test document'
      };

      const result = DriveCreateFileSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate with custom properties', () => {
      const validInput = {
        name: 'My Document',
        mimeType: 'application/vnd.google-apps.document',
        properties: {
          department: 'Engineering',
          project: 'MCP'
        }
      };

      const result = DriveCreateFileSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.properties).toEqual({
          department: 'Engineering',
          project: 'MCP'
        });
      }
    });

    it('should reject missing name', () => {
      const invalidInput = {
        mimeType: 'application/vnd.google-apps.document'
      };

      const result = DriveCreateFileSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Required');
      }
    });

    it('should reject empty name', () => {
      const invalidInput = {
        name: '',
        mimeType: 'application/vnd.google-apps.document'
      };

      const result = DriveCreateFileSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('File name is required');
      }
    });

    it('should reject missing mimeType', () => {
      const invalidInput = {
        name: 'My Document'
      };

      const result = DriveCreateFileSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Required');
      }
    });

    it('should reject empty mimeType', () => {
      const invalidInput = {
        name: 'My Document',
        mimeType: ''
      };

      const result = DriveCreateFileSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('MIME type is required');
      }
    });
  });

  describe('API Request Formation', () => {
    it('should form correct files.create request structure', () => {
      const input = {
        name: 'My Document',
        mimeType: 'application/vnd.google-apps.document',
        parents: ['folder-123'],
        description: 'Test document',
        properties: { key: 'value' }
      };

      const result = DriveCreateFileSchema.safeParse(input);
      expect(result.success).toBe(true);

      if (result.success) {
        // Verify structure matches Drive API v3 files.create
        expect(result.data).toHaveProperty('name');
        expect(result.data).toHaveProperty('mimeType');
        expect(result.data).toHaveProperty('parents');
        expect(result.data).toHaveProperty('description');
        expect(result.data).toHaveProperty('properties');
      }
    });

    it('should support Google Docs MIME type', () => {
      const input = {
        name: 'My Document',
        mimeType: 'application/vnd.google-apps.document'
      };

      const result = DriveCreateFileSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should support Google Sheets MIME type', () => {
      const input = {
        name: 'My Spreadsheet',
        mimeType: 'application/vnd.google-apps.spreadsheet'
      };

      const result = DriveCreateFileSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should support Google Slides MIME type', () => {
      const input = {
        name: 'My Presentation',
        mimeType: 'application/vnd.google-apps.presentation'
      };

      const result = DriveCreateFileSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });
});
