import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const DriveGetFileSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
  fields: z.string().optional(),
  supportsAllDrives: z.boolean().optional(),
  includeTrashed: z.boolean().optional()
});

describe('drive_getFile - Unit Tests', () => {
  it('should validate minimal input', () => {
    const result = DriveGetFileSchema.safeParse({ fileId: 'abc123' });
    expect(result.success).toBe(true);
  });

  it('should validate with fields parameter', () => {
    const result = DriveGetFileSchema.safeParse({
      fileId: 'abc123',
      fields: 'id,name,mimeType,parents'
    });
    expect(result.success).toBe(true);
  });

  it('should validate with supportsAllDrives', () => {
    const result = DriveGetFileSchema.safeParse({
      fileId: 'abc123',
      supportsAllDrives: true
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing fileId', () => {
    const result = DriveGetFileSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should reject empty fileId', () => {
    const result = DriveGetFileSchema.safeParse({ fileId: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('File ID is required');
    }
  });

  it('should validate with includeTrashed parameter', () => {
    const result = DriveGetFileSchema.safeParse({
      fileId: 'abc123',
      includeTrashed: true
    });
    expect(result.success).toBe(true);
  });
});
