import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const DriveUpdateFileSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
  name: z.string().optional(),
  mimeType: z.string().optional(),
  parents: z.array(z.string()).optional(),
  trashed: z.boolean().optional(),
  description: z.string().optional(),
  properties: z.record(z.string()).optional()
});

describe('drive_updateFile - Unit Tests', () => {
  it('should validate with only fileId', () => {
    const result = DriveUpdateFileSchema.safeParse({ fileId: 'abc123' });
    expect(result.success).toBe(true);
  });

  it('should validate name update', () => {
    const result = DriveUpdateFileSchema.safeParse({
      fileId: 'abc123',
      name: 'New Name'
    });
    expect(result.success).toBe(true);
  });

  it('should validate trash operation', () => {
    const result = DriveUpdateFileSchema.safeParse({
      fileId: 'abc123',
      trashed: true
    });
    expect(result.success).toBe(true);
  });

  it('should validate untrash operation', () => {
    const result = DriveUpdateFileSchema.safeParse({
      fileId: 'abc123',
      trashed: false
    });
    expect(result.success).toBe(true);
  });

  it('should validate parents update', () => {
    const result = DriveUpdateFileSchema.safeParse({
      fileId: 'abc123',
      parents: ['new-parent-id']
    });
    expect(result.success).toBe(true);
  });

  it('should validate properties update', () => {
    const result = DriveUpdateFileSchema.safeParse({
      fileId: 'abc123',
      properties: { key: 'value' }
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing fileId', () => {
    const result = DriveUpdateFileSchema.safeParse({ name: 'New Name' });
    expect(result.success).toBe(false);
  });

  it('should reject empty fileId', () => {
    const result = DriveUpdateFileSchema.safeParse({ fileId: '' });
    expect(result.success).toBe(false);
  });
});
