import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const DriveDeleteFileSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
  supportsAllDrives: z.boolean().optional()
});

describe('drive_deleteFile - Unit Tests', () => {
  it('should validate minimal input', () => {
    const result = DriveDeleteFileSchema.safeParse({ fileId: 'abc123' });
    expect(result.success).toBe(true);
  });

  it('should validate with supportsAllDrives', () => {
    const result = DriveDeleteFileSchema.safeParse({
      fileId: 'abc123',
      supportsAllDrives: true
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing fileId', () => {
    const result = DriveDeleteFileSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should reject empty fileId', () => {
    const result = DriveDeleteFileSchema.safeParse({ fileId: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('File ID is required');
    }
  });
});
