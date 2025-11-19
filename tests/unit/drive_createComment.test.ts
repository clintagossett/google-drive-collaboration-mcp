import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const DriveCreateCommentSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
  content: z.string().min(1, "Comment content is required"),
  anchor: z.string().optional(),
  quotedFileContent: z.object({
    mimeType: z.string(),
    value: z.string()
  }).optional()
});

describe('drive_createComment - Unit Tests', () => {
  it('should validate minimal input', () => {
    const result = DriveCreateCommentSchema.safeParse({
      fileId: 'file-123',
      content: 'Great work!'
    });
    expect(result.success).toBe(true);
  });

  it('should validate with anchor', () => {
    const result = DriveCreateCommentSchema.safeParse({
      fileId: 'file-123',
      content: 'Please review this section',
      anchor: 'kix.anchor1'
    });
    expect(result.success).toBe(true);
  });

  it('should validate with quotedFileContent', () => {
    const result = DriveCreateCommentSchema.safeParse({
      fileId: 'file-123',
      content: 'Typo here',
      quotedFileContent: {
        mimeType: 'text/html',
        value: '<p>The quick brown fox</p>'
      }
    });
    expect(result.success).toBe(true);
  });

  it('should validate with all optional parameters', () => {
    const result = DriveCreateCommentSchema.safeParse({
      fileId: 'file-123',
      content: 'Please fix this',
      anchor: 'kix.anchor1',
      quotedFileContent: {
        mimeType: 'text/html',
        value: '<p>Selected text</p>'
      }
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing fileId', () => {
    const result = DriveCreateCommentSchema.safeParse({
      content: 'Great work!'
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing content', () => {
    const result = DriveCreateCommentSchema.safeParse({
      fileId: 'file-123'
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty fileId', () => {
    const result = DriveCreateCommentSchema.safeParse({
      fileId: '',
      content: 'Great work!'
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('File ID is required');
    }
  });

  it('should reject empty content', () => {
    const result = DriveCreateCommentSchema.safeParse({
      fileId: 'file-123',
      content: ''
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Comment content is required');
    }
  });
});
