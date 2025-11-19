import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const DriveListCommentsSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
  pageSize: z.number().min(1).max(100).optional(),
  pageToken: z.string().optional(),
  includeDeleted: z.boolean().optional(),
  startModifiedTime: z.string().optional()
});

describe('drive_listComments - Unit Tests', () => {
  it('should validate minimal input', () => {
    const result = DriveListCommentsSchema.safeParse({ fileId: 'file-123' });
    expect(result.success).toBe(true);
  });

  it('should validate with pageSize', () => {
    const result = DriveListCommentsSchema.safeParse({
      fileId: 'file-123',
      pageSize: 50
    });
    expect(result.success).toBe(true);
  });

  it('should validate with pageToken', () => {
    const result = DriveListCommentsSchema.safeParse({
      fileId: 'file-123',
      pageToken: 'token-abc'
    });
    expect(result.success).toBe(true);
  });

  it('should validate with includeDeleted', () => {
    const result = DriveListCommentsSchema.safeParse({
      fileId: 'file-123',
      includeDeleted: true
    });
    expect(result.success).toBe(true);
  });

  it('should validate with startModifiedTime', () => {
    const result = DriveListCommentsSchema.safeParse({
      fileId: 'file-123',
      startModifiedTime: '2024-01-01T00:00:00Z'
    });
    expect(result.success).toBe(true);
  });

  it('should reject pageSize below 1', () => {
    const result = DriveListCommentsSchema.safeParse({
      fileId: 'file-123',
      pageSize: 0
    });
    expect(result.success).toBe(false);
  });

  it('should reject pageSize above 100', () => {
    const result = DriveListCommentsSchema.safeParse({
      fileId: 'file-123',
      pageSize: 101
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing fileId', () => {
    const result = DriveListCommentsSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
