import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema definition for slides_createParagraphBullets
const SlidesCreateParagraphBulletsSchema = z.object({
  presentationId: z.string().min(1, "Presentation ID is required"),
  objectId: z.string().min(1, "Object ID is required"),
  textRange: z.object({
    startIndex: z.number().min(0, "Start index must be at least 0").optional(),
    endIndex: z.number().min(0, "End index must be at least 0").optional(),
    type: z.enum(['FIXED_RANGE', 'FROM_START_INDEX', 'ALL']).optional()
  }).optional(),
  bulletPreset: z.enum([
    'BULLET_DISC_CIRCLE_SQUARE',
    'BULLET_DIAMONDX_ARROW3D_SQUARE',
    'BULLET_CHECKBOX',
    'BULLET_ARROW_DIAMOND_DISC',
    'BULLET_STAR_CIRCLE_SQUARE',
    'BULLET_ARROW3D_CIRCLE_SQUARE',
    'BULLET_LEFTTRIANGLE_DIAMOND_DISC',
    'BULLET_DIAMONDX_HOLLOWDIAMOND_SQUARE',
    'BULLET_DIAMOND_CIRCLE_SQUARE',
    'NUMBERED_DIGIT_ALPHA_ROMAN',
    'NUMBERED_DIGIT_ALPHA_ROMAN_PARENS',
    'NUMBERED_DIGIT_NESTED',
    'NUMBERED_UPPERALPHA_ALPHA_ROMAN',
    'NUMBERED_UPPERROMAN_UPPERALPHA_DIGIT',
    'NUMBERED_ZERODECIMAL_ALPHA_ROMAN'
  ]).optional(),
  cellLocation: z.object({
    rowIndex: z.number().min(0),
    columnIndex: z.number().min(0)
  }).optional()
});

describe('slides_createParagraphBullets Schema Validation', () => {
  it('should validate minimal valid input', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'textbox456'
    };
    expect(() => SlidesCreateParagraphBulletsSchema.parse(input)).not.toThrow();
  });

  it('should validate with fixed range', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'textbox456',
      textRange: {
        startIndex: 0,
        endIndex: 10,
        type: 'FIXED_RANGE' as const
      }
    };
    expect(() => SlidesCreateParagraphBulletsSchema.parse(input)).not.toThrow();
  });

  it('should validate with bullet disc preset', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'textbox456',
      bulletPreset: 'BULLET_DISC_CIRCLE_SQUARE' as const
    };
    expect(() => SlidesCreateParagraphBulletsSchema.parse(input)).not.toThrow();
  });

  it('should validate with numbered preset', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'textbox456',
      bulletPreset: 'NUMBERED_DIGIT_ALPHA_ROMAN' as const
    };
    expect(() => SlidesCreateParagraphBulletsSchema.parse(input)).not.toThrow();
  });

  it('should validate with checkbox preset', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'textbox456',
      bulletPreset: 'BULLET_CHECKBOX' as const
    };
    expect(() => SlidesCreateParagraphBulletsSchema.parse(input)).not.toThrow();
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
    expect(() => SlidesCreateParagraphBulletsSchema.parse(input)).not.toThrow();
  });

  it('should validate with all options', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'table789',
      textRange: {
        startIndex: 0,
        endIndex: 50,
        type: 'FIXED_RANGE' as const
      },
      bulletPreset: 'BULLET_STAR_CIRCLE_SQUARE' as const,
      cellLocation: {
        rowIndex: 1,
        columnIndex: 2
      }
    };
    expect(() => SlidesCreateParagraphBulletsSchema.parse(input)).not.toThrow();
  });

  it('should reject missing presentationId', () => {
    const input = {
      objectId: 'textbox456'
    };
    expect(() => SlidesCreateParagraphBulletsSchema.parse(input)).toThrow(/Required/);
  });

  it('should reject empty presentationId', () => {
    const input = {
      presentationId: '',
      objectId: 'textbox456'
    };
    expect(() => SlidesCreateParagraphBulletsSchema.parse(input)).toThrow(/Presentation ID is required/);
  });

  it('should reject missing objectId', () => {
    const input = {
      presentationId: 'presentation123'
    };
    expect(() => SlidesCreateParagraphBulletsSchema.parse(input)).toThrow(/Required/);
  });

  it('should reject empty objectId', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: ''
    };
    expect(() => SlidesCreateParagraphBulletsSchema.parse(input)).toThrow(/Object ID is required/);
  });

  it('should reject invalid bullet preset', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'textbox456',
      bulletPreset: 'INVALID_PRESET'
    };
    expect(() => SlidesCreateParagraphBulletsSchema.parse(input)).toThrow();
  });

  it('should reject negative start index', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'textbox456',
      textRange: {
        startIndex: -1
      }
    };
    expect(() => SlidesCreateParagraphBulletsSchema.parse(input)).toThrow(/Start index must be at least 0/);
  });

  it('should reject negative end index', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'textbox456',
      textRange: {
        endIndex: -1
      }
    };
    expect(() => SlidesCreateParagraphBulletsSchema.parse(input)).toThrow(/End index must be at least 0/);
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
    expect(() => SlidesCreateParagraphBulletsSchema.parse(input)).toThrow();
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
    expect(() => SlidesCreateParagraphBulletsSchema.parse(input)).toThrow();
  });
});
