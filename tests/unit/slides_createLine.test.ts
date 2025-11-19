import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const SlidesCreateLineSchema = z.object({
  presentationId: z.string().min(1, "Presentation ID is required"),
  pageObjectId: z.string().min(1, "Page object ID is required"),
  lineCategory: z.enum(['STRAIGHT', 'BENT', 'CURVED']).optional(),
  elementProperties: z.object({
    pageObjectId: z.string().optional(),
    size: z.object({
      width: z.object({ magnitude: z.number(), unit: z.enum(['EMU', 'PT']) }),
      height: z.object({ magnitude: z.number(), unit: z.enum(['EMU', 'PT']) })
    }).optional(),
    transform: z.object({
      scaleX: z.number().optional(),
      scaleY: z.number().optional(),
      translateX: z.number().optional(),
      translateY: z.number().optional(),
      unit: z.enum(['EMU', 'PT']).optional()
    }).optional()
  }).optional()
});

describe('slides_createLine Schema Validation', () => {
  it('should validate minimal valid input', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456'
    };
    expect(() => SlidesCreateLineSchema.parse(input)).not.toThrow();
  });

  it('should validate with straight line category', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      lineCategory: 'STRAIGHT' as const
    };
    expect(() => SlidesCreateLineSchema.parse(input)).not.toThrow();
  });

  it('should validate with bent line category', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      lineCategory: 'BENT' as const
    };
    expect(() => SlidesCreateLineSchema.parse(input)).not.toThrow();
  });

  it('should validate with curved line category', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      lineCategory: 'CURVED' as const
    };
    expect(() => SlidesCreateLineSchema.parse(input)).not.toThrow();
  });

  it('should validate with size', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      elementProperties: {
        size: {
          width: { magnitude: 200, unit: 'PT' as const },
          height: { magnitude: 2, unit: 'PT' as const }
        }
      }
    };
    expect(() => SlidesCreateLineSchema.parse(input)).not.toThrow();
  });

  it('should validate with transform', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      elementProperties: {
        transform: {
          translateX: 50,
          translateY: 50,
          unit: 'PT' as const
        }
      }
    };
    expect(() => SlidesCreateLineSchema.parse(input)).not.toThrow();
  });

  it('should reject missing presentationId', () => {
    const input = {
      pageObjectId: 'slide456'
    };
    expect(() => SlidesCreateLineSchema.parse(input)).toThrow(/Required/);
  });

  it('should reject empty presentationId', () => {
    const input = {
      presentationId: '',
      pageObjectId: 'slide456'
    };
    expect(() => SlidesCreateLineSchema.parse(input)).toThrow(/Presentation ID is required/);
  });

  it('should reject missing pageObjectId', () => {
    const input = {
      presentationId: 'presentation123'
    };
    expect(() => SlidesCreateLineSchema.parse(input)).toThrow(/Required/);
  });

  it('should reject invalid line category', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      lineCategory: 'ZIGZAG'
    };
    expect(() => SlidesCreateLineSchema.parse(input)).toThrow();
  });
});
