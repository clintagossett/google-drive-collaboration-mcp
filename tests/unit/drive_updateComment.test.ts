import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const DriveUpdateCommentSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
  commentId: z.string().min(1, "Comment ID is required"),
  content: z.string().min(1, "Comment content is required")
});

describe('drive_updateComment - Unit Tests', () => {
  it('should validate with all required parameters', () => {
    const result = DriveUpdateCommentSchema.safeParse({
      fileId: 'file-123',
      commentId: 'comment-456',
      content: 'Updated comment text'
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing fileId', () => {
    const result = DriveUpdateCommentSchema.safeParse({
      commentId: 'comment-456',
      content: 'Updated text'
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing commentId', () => {
    const result = DriveUpdateCommentSchema.safeParse({
      fileId: 'file-123',
      content: 'Updated text'
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing content', () => {
    const result = DriveUpdateCommentSchema.safeParse({
      fileId: 'file-123',
      commentId: 'comment-456'
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty content', () => {
    const result = DriveUpdateCommentSchema.safeParse({
      fileId: 'file-123',
      commentId: 'comment-456',
      content: ''
    });
    expect(result.success).toBe(false);
  });
});
