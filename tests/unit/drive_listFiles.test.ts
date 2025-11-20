import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const DriveListFilesSchema = z.object({
  q: z.string().optional(),
  pageSize: z.number().min(1).max(1000).optional(),
  pageToken: z.string().optional(),
  orderBy: z.string().optional(),
  fields: z.string().optional(),
  spaces: z.string().optional(),
  corpora: z.string().optional(),
  includeItemsFromAllDrives: z.boolean().optional(),
  supportsAllDrives: z.boolean().optional(),
  includeTrashed: z.boolean().optional()
});

describe('drive_listFiles - Unit Tests', () => {
  it('should validate with no parameters', () => {
    const result = DriveListFilesSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should validate with query string', () => {
    const result = DriveListFilesSchema.safeParse({
      q: "name contains 'report'"
    });
    expect(result.success).toBe(true);
  });

  it('should validate with pageSize', () => {
    const result = DriveListFilesSchema.safeParse({ pageSize: 100 });
    expect(result.success).toBe(true);
  });

  it('should validate with pageToken', () => {
    const result = DriveListFilesSchema.safeParse({ pageToken: 'token123' });
    expect(result.success).toBe(true);
  });

  it('should validate with orderBy', () => {
    const result = DriveListFilesSchema.safeParse({ orderBy: 'modifiedTime desc' });
    expect(result.success).toBe(true);
  });

  it('should reject pageSize below 1', () => {
    const result = DriveListFilesSchema.safeParse({ pageSize: 0 });
    expect(result.success).toBe(false);
  });

  it('should reject pageSize above 1000', () => {
    const result = DriveListFilesSchema.safeParse({ pageSize: 1001 });
    expect(result.success).toBe(false);
  });

  it('should accept pageSize of 1000', () => {
    const result = DriveListFilesSchema.safeParse({ pageSize: 1000 });
    expect(result.success).toBe(true);
  });

  it('should validate with includeTrashed parameter', () => {
    const result = DriveListFilesSchema.safeParse({
      includeTrashed: true
    });
    expect(result.success).toBe(true);
  });

  it('should validate with includeItemsFromAllDrives parameter', () => {
    const result = DriveListFilesSchema.safeParse({
      includeItemsFromAllDrives: true
    });
    expect(result.success).toBe(true);
  });

  it('should validate with supportsAllDrives parameter', () => {
    const result = DriveListFilesSchema.safeParse({
      supportsAllDrives: true
    });
    expect(result.success).toBe(true);
  });
});
