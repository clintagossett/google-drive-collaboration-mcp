import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const DriveGetCommentSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
  commentId: z.string().min(1, "Comment ID is required"),
  includeDeleted: z.boolean().optional()
});

describe('drive_getComment - Unit Tests', () => {
  it('should validate minimal input', () => {
    const result = DriveGetCommentSchema.safeParse({
      fileId: 'file-123',
      commentId: 'comment-456'
    });
    expect(result.success).toBe(true);
  });

  it('should validate with includeDeleted', () => {
    const result = DriveGetCommentSchema.safeParse({
      fileId: 'file-123',
      commentId: 'comment-456',
      includeDeleted: true
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing fileId', () => {
    const result = DriveGetCommentSchema.safeParse({
      commentId: 'comment-456'
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing commentId', () => {
    const result = DriveGetCommentSchema.safeParse({
      fileId: 'file-123'
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty fileId', () => {
    const result = DriveGetCommentSchema.safeParse({
      fileId: '',
      commentId: 'comment-456'
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty commentId', () => {
    const result = DriveGetCommentSchema.safeParse({
      fileId: 'file-123',
      commentId: ''
    });
    expect(result.success).toBe(false);
  });
});
