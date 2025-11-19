import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const DriveExportFileSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
  mimeType: z.string().min(1, "Export MIME type is required")
});

describe('drive_exportFile - Unit Tests', () => {
  it('should validate with fileId and mimeType', () => {
    const result = DriveExportFileSchema.safeParse({
      fileId: 'abc123',
      mimeType: 'application/pdf'
    });
    expect(result.success).toBe(true);
  });

  it('should validate export to PDF', () => {
    const result = DriveExportFileSchema.safeParse({
      fileId: 'doc-123',
      mimeType: 'application/pdf'
    });
    expect(result.success).toBe(true);
  });

  it('should validate export to DOCX', () => {
    const result = DriveExportFileSchema.safeParse({
      fileId: 'doc-123',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    expect(result.success).toBe(true);
  });

  it('should validate export to Excel', () => {
    const result = DriveExportFileSchema.safeParse({
      fileId: 'sheet-123',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing fileId', () => {
    const result = DriveExportFileSchema.safeParse({
      mimeType: 'application/pdf'
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing mimeType', () => {
    const result = DriveExportFileSchema.safeParse({
      fileId: 'abc123'
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty fileId', () => {
    const result = DriveExportFileSchema.safeParse({
      fileId: '',
      mimeType: 'application/pdf'
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('File ID is required');
    }
  });

  it('should reject empty mimeType', () => {
    const result = DriveExportFileSchema.safeParse({
      fileId: 'abc123',
      mimeType: ''
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Export MIME type is required');
    }
  });
});
