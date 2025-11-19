import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const DriveUpdateReplySchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
  commentId: z.string().min(1, "Comment ID is required"),
  replyId: z.string().min(1, "Reply ID is required"),
  content: z.string().min(1, "Reply content is required"),
  action: z.enum(["resolve", "reopen"]).optional()
});

describe('drive_updateReply - Unit Tests', () => {
  it('should validate minimal input', () => {
    const result = DriveUpdateReplySchema.safeParse({
      fileId: 'file-123',
      commentId: 'comment-456',
      replyId: 'reply-789',
      content: 'Updated reply text'
    });
    expect(result.success).toBe(true);
  });

  it('should validate with resolve action', () => {
    const result = DriveUpdateReplySchema.safeParse({
      fileId: 'file-123',
      commentId: 'comment-456',
      replyId: 'reply-789',
      content: 'Fixed and resolving',
      action: 'resolve'
    });
    expect(result.success).toBe(true);
  });

  it('should validate with reopen action', () => {
    const result = DriveUpdateReplySchema.safeParse({
      fileId: 'file-123',
      commentId: 'comment-456',
      replyId: 'reply-789',
      content: 'Reopening this issue',
      action: 'reopen'
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing content', () => {
    const result = DriveUpdateReplySchema.safeParse({
      fileId: 'file-123',
      commentId: 'comment-456',
      replyId: 'reply-789'
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty content', () => {
    const result = DriveUpdateReplySchema.safeParse({
      fileId: 'file-123',
      commentId: 'comment-456',
      replyId: 'reply-789',
      content: ''
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid action', () => {
    const result = DriveUpdateReplySchema.safeParse({
      fileId: 'file-123',
      commentId: 'comment-456',
      replyId: 'reply-789',
      content: 'Updated text',
      action: 'invalid'
    });
    expect(result.success).toBe(false);
  });
});
