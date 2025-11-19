import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const SlidesDeleteParagraphBulletsSchema = z.object({
  presentationId: z.string().min(1, "Presentation ID is required"),
  objectId: z.string().min(1, "Object ID is required"),
  textRange: z.object({
    type: z.enum(['FIXED_RANGE', 'FROM_START_INDEX', 'ALL']).optional(),
    startIndex: z.number().min(0).optional(),
    endIndex: z.number().min(0).optional()
  }).optional(),
  cellLocation: z.object({
    rowIndex: z.number().min(0),
    columnIndex: z.number().min(0)
  }).optional()
});

describe('slides_deleteParagraphBullets Schema Validation', () => {
  it('should validate minimal valid input', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'shape456'
    };
    expect(() => SlidesDeleteParagraphBulletsSchema.parse(input)).not.toThrow();
  });

  it('should validate with FIXED_RANGE textRange', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'shape456',
      textRange: {
        type: 'FIXED_RANGE' as const,
        startIndex: 0,
        endIndex: 10
      }
    };
    expect(() => SlidesDeleteParagraphBulletsSchema.parse(input)).not.toThrow();
  });

  it('should validate with FROM_START_INDEX textRange', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'shape456',
      textRange: {
        type: 'FROM_START_INDEX' as const,
        startIndex: 5
      }
    };
    expect(() => SlidesDeleteParagraphBulletsSchema.parse(input)).not.toThrow();
  });

  it('should validate with ALL textRange type', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'shape456',
      textRange: {
        type: 'ALL' as const
      }
    };
    expect(() => SlidesDeleteParagraphBulletsSchema.parse(input)).not.toThrow();
  });

  it('should validate with cellLocation for table cells', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'table456',
      cellLocation: {
        rowIndex: 0,
        columnIndex: 1
      }
    };
    expect(() => SlidesDeleteParagraphBulletsSchema.parse(input)).not.toThrow();
  });

  it('should reject negative startIndex in textRange', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'shape456',
      textRange: {
        startIndex: -1
      }
    };
    expect(() => SlidesDeleteParagraphBulletsSchema.parse(input)).toThrow();
  });

  it('should reject negative rowIndex in cellLocation', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'table456',
      cellLocation: {
        rowIndex: -1,
        columnIndex: 0
      }
    };
    expect(() => SlidesDeleteParagraphBulletsSchema.parse(input)).toThrow();
  });

  it('should reject missing presentationId', () => {
    const input = {
      objectId: 'shape456'
    };
    expect(() => SlidesDeleteParagraphBulletsSchema.parse(input)).toThrow(/Required/);
  });

  it('should reject empty presentationId', () => {
    const input = {
      presentationId: '',
      objectId: 'shape456'
    };
    expect(() => SlidesDeleteParagraphBulletsSchema.parse(input)).toThrow(/Presentation ID is required/);
  });

  it('should reject missing objectId', () => {
    const input = {
      presentationId: 'presentation123'
    };
    expect(() => SlidesDeleteParagraphBulletsSchema.parse(input)).toThrow(/Required/);
  });

  it('should reject empty objectId', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: ''
    };
    expect(() => SlidesDeleteParagraphBulletsSchema.parse(input)).toThrow(/Object ID is required/);
  });
});
