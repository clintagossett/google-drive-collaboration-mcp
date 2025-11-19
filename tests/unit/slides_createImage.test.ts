import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema definition for slides_createImage
const SlidesCreateImageSchema = z.object({
  presentationId: z.string().min(1, "Presentation ID is required"),
  pageObjectId: z.string().min(1, "Page object ID is required"),
  url: z.string().url("Valid image URL is required"),
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

describe('slides_createImage Schema Validation', () => {
  it('should validate minimal valid input', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      url: 'https://example.com/image.png'
    };
    expect(() => SlidesCreateImageSchema.parse(input)).not.toThrow();
  });

  it('should validate with size in EMU', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      url: 'https://example.com/image.png',
      elementProperties: {
        size: {
          width: { magnitude: 3048000, unit: 'EMU' as const },
          height: { magnitude: 3048000, unit: 'EMU' as const }
        }
      }
    };
    expect(() => SlidesCreateImageSchema.parse(input)).not.toThrow();
  });

  it('should validate with size in PT', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      url: 'https://example.com/image.png',
      elementProperties: {
        size: {
          width: { magnitude: 300, unit: 'PT' as const },
          height: { magnitude: 200, unit: 'PT' as const }
        }
      }
    };
    expect(() => SlidesCreateImageSchema.parse(input)).not.toThrow();
  });

  it('should validate with transform', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      url: 'https://example.com/image.png',
      elementProperties: {
        transform: {
          scaleX: 1.5,
          scaleY: 1.5,
          translateX: 100,
          translateY: 100,
          unit: 'PT' as const
        }
      }
    };
    expect(() => SlidesCreateImageSchema.parse(input)).not.toThrow();
  });

  it('should validate with all properties', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      url: 'https://example.com/image.png',
      elementProperties: {
        pageObjectId: 'customId',
        size: {
          width: { magnitude: 400, unit: 'PT' as const },
          height: { magnitude: 300, unit: 'PT' as const }
        },
        transform: {
          scaleX: 2.0,
          scaleY: 2.0,
          translateX: 50,
          translateY: 50,
          unit: 'PT' as const
        }
      }
    };
    expect(() => SlidesCreateImageSchema.parse(input)).not.toThrow();
  });

  it('should reject missing presentationId', () => {
    const input = {
      pageObjectId: 'slide456',
      url: 'https://example.com/image.png'
    };
    expect(() => SlidesCreateImageSchema.parse(input)).toThrow(/Required/);
  });

  it('should reject empty presentationId', () => {
    const input = {
      presentationId: '',
      pageObjectId: 'slide456',
      url: 'https://example.com/image.png'
    };
    expect(() => SlidesCreateImageSchema.parse(input)).toThrow(/Presentation ID is required/);
  });

  it('should reject missing pageObjectId', () => {
    const input = {
      presentationId: 'presentation123',
      url: 'https://example.com/image.png'
    };
    expect(() => SlidesCreateImageSchema.parse(input)).toThrow(/Required/);
  });

  it('should reject empty pageObjectId', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: '',
      url: 'https://example.com/image.png'
    };
    expect(() => SlidesCreateImageSchema.parse(input)).toThrow(/Page object ID is required/);
  });

  it('should reject missing url', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456'
    };
    expect(() => SlidesCreateImageSchema.parse(input)).toThrow(/Required/);
  });

  it('should reject invalid url', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      url: 'not-a-valid-url'
    };
    expect(() => SlidesCreateImageSchema.parse(input)).toThrow(/Valid image URL is required/);
  });

  it('should reject invalid size unit', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      url: 'https://example.com/image.png',
      elementProperties: {
        size: {
          width: { magnitude: 300, unit: 'INVALID' },
          height: { magnitude: 200, unit: 'PT' }
        }
      }
    };
    expect(() => SlidesCreateImageSchema.parse(input)).toThrow();
  });

  it('should reject invalid transform unit', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      url: 'https://example.com/image.png',
      elementProperties: {
        transform: {
          translateX: 100,
          unit: 'INVALID'
        }
      }
    };
    expect(() => SlidesCreateImageSchema.parse(input)).toThrow();
  });
});
