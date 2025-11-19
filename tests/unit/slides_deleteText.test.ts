import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema definition for slides_deleteText
const SlidesDeleteTextSchema = z.object({
  presentationId: z.string().min(1, "Presentation ID is required"),
  objectId: z.string().min(1, "Object ID is required"),
  textRange: z.object({
    startIndex: z.number().min(0, "Start index must be at least 0").optional(),
    endIndex: z.number().min(0, "End index must be at least 0").optional(),
    type: z.enum(['FIXED_RANGE', 'FROM_START_INDEX', 'ALL']).optional()
  }).optional(),
  cellLocation: z.object({
    rowIndex: z.number().min(0),
    columnIndex: z.number().min(0)
  }).optional()
});

describe('slides_deleteText Schema Validation', () => {
  it('should validate minimal valid input (delete all text)', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'textbox456'
    };
    expect(() => SlidesDeleteTextSchema.parse(input)).not.toThrow();
  });

  it('should validate with fixed range', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'textbox456',
      textRange: {
        startIndex: 5,
        endIndex: 10,
        type: 'FIXED_RANGE' as const
      }
    };
    expect(() => SlidesDeleteTextSchema.parse(input)).not.toThrow();
  });

  it('should validate with FROM_START_INDEX type', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'textbox456',
      textRange: {
        startIndex: 5,
        type: 'FROM_START_INDEX' as const
      }
    };
    expect(() => SlidesDeleteTextSchema.parse(input)).not.toThrow();
  });

  it('should validate with ALL type', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'textbox456',
      textRange: {
        type: 'ALL' as const
      }
    };
    expect(() => SlidesDeleteTextSchema.parse(input)).not.toThrow();
  });

  it('should validate with table cell location', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'table789',
      cellLocation: {
        rowIndex: 0,
        columnIndex: 1
      }
    };
    expect(() => SlidesDeleteTextSchema.parse(input)).not.toThrow();
  });

  it('should reject missing presentationId', () => {
    const input = {
      objectId: 'textbox456'
    };
    expect(() => SlidesDeleteTextSchema.parse(input)).toThrow(/Required/);
  });

  it('should reject empty presentationId', () => {
    const input = {
      presentationId: '',
      objectId: 'textbox456'
    };
    expect(() => SlidesDeleteTextSchema.parse(input)).toThrow(/Presentation ID is required/);
  });

  it('should reject missing objectId', () => {
    const input = {
      presentationId: 'presentation123'
    };
    expect(() => SlidesDeleteTextSchema.parse(input)).toThrow(/Required/);
  });

  it('should reject empty objectId', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: ''
    };
    expect(() => SlidesDeleteTextSchema.parse(input)).toThrow(/Object ID is required/);
  });

  it('should reject negative start index', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'textbox456',
      textRange: {
        startIndex: -1
      }
    };
    expect(() => SlidesDeleteTextSchema.parse(input)).toThrow(/Start index must be at least 0/);
  });

  it('should reject negative end index', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'textbox456',
      textRange: {
        endIndex: -1
      }
    };
    expect(() => SlidesDeleteTextSchema.parse(input)).toThrow(/End index must be at least 0/);
  });

  it('should reject invalid range type', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'textbox456',
      textRange: {
        type: 'INVALID_TYPE'
      }
    };
    expect(() => SlidesDeleteTextSchema.parse(input)).toThrow();
  });

  it('should reject negative row index in cell location', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'table789',
      cellLocation: {
        rowIndex: -1,
        columnIndex: 0
      }
    };
    expect(() => SlidesDeleteTextSchema.parse(input)).toThrow();
  });

  it('should reject negative column index in cell location', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'table789',
      cellLocation: {
        rowIndex: 0,
        columnIndex: -1
      }
    };
    expect(() => SlidesDeleteTextSchema.parse(input)).toThrow();
  });
});
