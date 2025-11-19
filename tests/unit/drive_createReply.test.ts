import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const DriveCreateReplySchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
  commentId: z.string().min(1, "Comment ID is required"),
  content: z.string().min(1, "Reply content is required"),
  action: z.enum(["resolve", "reopen"]).optional()
});

describe('drive_createReply - Unit Tests', () => {
  it('should validate minimal input', () => {
    const result = DriveCreateReplySchema.safeParse({
      fileId: 'file-123',
      commentId: 'comment-456',
      content: 'Thanks for the feedback!'
    });
    expect(result.success).toBe(true);
  });

  it('should validate with resolve action', () => {
    const result = DriveCreateReplySchema.safeParse({
      fileId: 'file-123',
      commentId: 'comment-456',
      content: 'Fixed!',
      action: 'resolve'
    });
    expect(result.success).toBe(true);
  });

  it('should validate with reopen action', () => {
    const result = DriveCreateReplySchema.safeParse({
      fileId: 'file-123',
      commentId: 'comment-456',
      content: 'Still needs work',
      action: 'reopen'
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing fileId', () => {
    const result = DriveCreateReplySchema.safeParse({
      commentId: 'comment-456',
      content: 'Reply text'
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing commentId', () => {
    const result = DriveCreateReplySchema.safeParse({
      fileId: 'file-123',
      content: 'Reply text'
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing content', () => {
    const result = DriveCreateReplySchema.safeParse({
      fileId: 'file-123',
      commentId: 'comment-456'
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid action', () => {
    const result = DriveCreateReplySchema.safeParse({
      fileId: 'file-123',
      commentId: 'comment-456',
      content: 'Reply text',
      action: 'invalid'
    });
    expect(result.success).toBe(false);
  });
});
