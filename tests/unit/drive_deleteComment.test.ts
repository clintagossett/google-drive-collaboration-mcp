import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const DriveDeleteCommentSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
  commentId: z.string().min(1, "Comment ID is required")
});

describe('drive_deleteComment - Unit Tests', () => {
  it('should validate with all required parameters', () => {
    const result = DriveDeleteCommentSchema.safeParse({
      fileId: 'file-123',
      commentId: 'comment-456'
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing fileId', () => {
    const result = DriveDeleteCommentSchema.safeParse({
      commentId: 'comment-456'
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing commentId', () => {
    const result = DriveDeleteCommentSchema.safeParse({
      fileId: 'file-123'
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty fileId', () => {
    const result = DriveDeleteCommentSchema.safeParse({
      fileId: '',
      commentId: 'comment-456'
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty commentId', () => {
    const result = DriveDeleteCommentSchema.safeParse({
      fileId: 'file-123',
      commentId: ''
    });
    expect(result.success).toBe(false);
  });
});
