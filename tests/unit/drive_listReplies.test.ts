import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const DriveListRepliesSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
  commentId: z.string().min(1, "Comment ID is required"),
  pageSize: z.number().min(1).max(100).optional(),
  pageToken: z.string().optional(),
  includeDeleted: z.boolean().optional()
});

describe('drive_listReplies - Unit Tests', () => {
  it('should validate minimal input', () => {
    const result = DriveListRepliesSchema.safeParse({
      fileId: 'file-123',
      commentId: 'comment-456'
    });
    expect(result.success).toBe(true);
  });

  it('should validate with pageSize', () => {
    const result = DriveListRepliesSchema.safeParse({
      fileId: 'file-123',
      commentId: 'comment-456',
      pageSize: 50
    });
    expect(result.success).toBe(true);
  });

  it('should validate with pageToken', () => {
    const result = DriveListRepliesSchema.safeParse({
      fileId: 'file-123',
      commentId: 'comment-456',
      pageToken: 'token-abc'
    });
    expect(result.success).toBe(true);
  });

  it('should validate with includeDeleted', () => {
    const result = DriveListRepliesSchema.safeParse({
      fileId: 'file-123',
      commentId: 'comment-456',
      includeDeleted: true
    });
    expect(result.success).toBe(true);
  });

  it('should reject pageSize below 1', () => {
    const result = DriveListRepliesSchema.safeParse({
      fileId: 'file-123',
      commentId: 'comment-456',
      pageSize: 0
    });
    expect(result.success).toBe(false);
  });

  it('should reject pageSize above 100', () => {
    const result = DriveListRepliesSchema.safeParse({
      fileId: 'file-123',
      commentId: 'comment-456',
      pageSize: 101
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing fileId', () => {
    const result = DriveListRepliesSchema.safeParse({
      commentId: 'comment-456'
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing commentId', () => {
    const result = DriveListRepliesSchema.safeParse({
      fileId: 'file-123'
    });
    expect(result.success).toBe(false);
  });
});
