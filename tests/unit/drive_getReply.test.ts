import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const DriveGetReplySchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
  commentId: z.string().min(1, "Comment ID is required"),
  replyId: z.string().min(1, "Reply ID is required"),
  includeDeleted: z.boolean().optional()
});

describe('drive_getReply - Unit Tests', () => {
  it('should validate minimal input', () => {
    const result = DriveGetReplySchema.safeParse({
      fileId: 'file-123',
      commentId: 'comment-456',
      replyId: 'reply-789'
    });
    expect(result.success).toBe(true);
  });

  it('should validate with includeDeleted', () => {
    const result = DriveGetReplySchema.safeParse({
      fileId: 'file-123',
      commentId: 'comment-456',
      replyId: 'reply-789',
      includeDeleted: true
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing fileId', () => {
    const result = DriveGetReplySchema.safeParse({
      commentId: 'comment-456',
      replyId: 'reply-789'
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing commentId', () => {
    const result = DriveGetReplySchema.safeParse({
      fileId: 'file-123',
      replyId: 'reply-789'
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing replyId', () => {
    const result = DriveGetReplySchema.safeParse({
      fileId: 'file-123',
      commentId: 'comment-456'
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty replyId', () => {
    const result = DriveGetReplySchema.safeParse({
      fileId: 'file-123',
      commentId: 'comment-456',
      replyId: ''
    });
    expect(result.success).toBe(false);
  });
});
