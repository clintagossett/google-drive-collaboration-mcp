import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const DriveCopyFileSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
  name: z.string().optional(),
  parents: z.array(z.string()).optional(),
  description: z.string().optional(),
  properties: z.record(z.string()).optional(),
  supportsAllDrives: z.boolean().optional()
});

describe('drive_copyFile - Unit Tests', () => {
  it('should validate minimal input', () => {
    const result = DriveCopyFileSchema.safeParse({ fileId: 'abc123' });
    expect(result.success).toBe(true);
  });

  it('should validate with new name', () => {
    const result = DriveCopyFileSchema.safeParse({
      fileId: 'abc123',
      name: 'Copy of Document'
    });
    expect(result.success).toBe(true);
  });

  it('should validate with parents', () => {
    const result = DriveCopyFileSchema.safeParse({
      fileId: 'abc123',
      parents: ['new-folder-id']
    });
    expect(result.success).toBe(true);
  });

  it('should validate with description and properties', () => {
    const result = DriveCopyFileSchema.safeParse({
      fileId: 'abc123',
      description: 'Backup copy',
      properties: { version: '2.0' }
    });
    expect(result.success).toBe(true);
  });

  it('should validate with supportsAllDrives', () => {
    const result = DriveCopyFileSchema.safeParse({
      fileId: 'abc123',
      supportsAllDrives: true
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing fileId', () => {
    const result = DriveCopyFileSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should reject empty fileId', () => {
    const result = DriveCopyFileSchema.safeParse({ fileId: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('File ID is required');
    }
  });
});
