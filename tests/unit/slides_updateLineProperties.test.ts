import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const SlidesUpdateLinePropertiesSchema = z.object({
  presentationId: z.string().min(1, "Presentation ID is required"),
  objectId: z.string().min(1, "Object ID is required"),
  lineProperties: z.object({
    weight: z.object({
      magnitude: z.number().min(0),
      unit: z.enum(['EMU', 'PT'])
    }).optional(),
    dashStyle: z.enum(['SOLID', 'DOT', 'DASH', 'DASH_DOT', 'LONG_DASH', 'LONG_DASH_DOT']).optional(),
    startArrow: z.enum([
      'ARROW_NONE', 'ARROW', 'STEALTH_ARROW', 'FILL_ARROW', 'FILL_CIRCLE', 'FILL_SQUARE', 'FILL_DIAMOND', 'OPEN_ARROW', 'OPEN_CIRCLE', 'OPEN_SQUARE', 'OPEN_DIAMOND'
    ]).optional(),
    endArrow: z.enum([
      'ARROW_NONE', 'ARROW', 'STEALTH_ARROW', 'FILL_ARROW', 'FILL_CIRCLE', 'FILL_SQUARE', 'FILL_DIAMOND', 'OPEN_ARROW', 'OPEN_CIRCLE', 'OPEN_SQUARE', 'OPEN_DIAMOND'
    ]).optional(),
    lineFill: z.object({
      solidFill: z.object({
        color: z.object({
          red: z.number().min(0).max(1).optional(),
          green: z.number().min(0).max(1).optional(),
          blue: z.number().min(0).max(1).optional()
        }),
        alpha: z.number().min(0).max(1).optional()
      }).optional()
    }).optional(),
    link: z.object({
      url: z.string().url().optional(),
      relativeLink: z.enum(['NEXT_SLIDE', 'PREVIOUS_SLIDE', 'FIRST_SLIDE', 'LAST_SLIDE']).optional(),
      slideIndex: z.number().min(0).optional(),
      pageObjectId: z.string().optional()
    }).optional()
  }).optional()
});

describe('slides_updateLineProperties Schema Validation', () => {
  it('should validate minimal valid input', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'line456'
    };
    expect(() => SlidesUpdateLinePropertiesSchema.parse(input)).not.toThrow();
  });

  it('should validate with weight in EMU', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'line456',
      lineProperties: {
        weight: {
          magnitude: 10000,
          unit: 'EMU' as const
        }
      }
    };
    expect(() => SlidesUpdateLinePropertiesSchema.parse(input)).not.toThrow();
  });

  it('should validate with weight in PT', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'line456',
      lineProperties: {
        weight: {
          magnitude: 2.5,
          unit: 'PT' as const
        }
      }
    };
    expect(() => SlidesUpdateLinePropertiesSchema.parse(input)).not.toThrow();
  });

  it('should validate with dashStyle', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'line456',
      lineProperties: {
        dashStyle: 'DASH' as const
      }
    };
    expect(() => SlidesUpdateLinePropertiesSchema.parse(input)).not.toThrow();
  });

  it('should validate with arrow styles', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'line456',
      lineProperties: {
        startArrow: 'ARROW' as const,
        endArrow: 'FILL_CIRCLE' as const
      }
    };
    expect(() => SlidesUpdateLinePropertiesSchema.parse(input)).not.toThrow();
  });

  it('should validate with lineFill color', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'line456',
      lineProperties: {
        lineFill: {
          solidFill: {
            color: {
              red: 0.5,
              green: 0.2,
              blue: 0.8
            },
            alpha: 0.9
          }
        }
      }
    };
    expect(() => SlidesUpdateLinePropertiesSchema.parse(input)).not.toThrow();
  });

  it('should validate with URL link', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'line456',
      lineProperties: {
        link: {
          url: 'https://example.com'
        }
      }
    };
    expect(() => SlidesUpdateLinePropertiesSchema.parse(input)).not.toThrow();
  });

  it('should validate with relative link', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'line456',
      lineProperties: {
        link: {
          relativeLink: 'NEXT_SLIDE' as const
        }
      }
    };
    expect(() => SlidesUpdateLinePropertiesSchema.parse(input)).not.toThrow();
  });

  it('should reject negative weight', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'line456',
      lineProperties: {
        weight: {
          magnitude: -1,
          unit: 'PT' as const
        }
      }
    };
    expect(() => SlidesUpdateLinePropertiesSchema.parse(input)).toThrow();
  });

  it('should reject invalid dashStyle', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'line456',
      lineProperties: {
        dashStyle: 'INVALID'
      }
    };
    expect(() => SlidesUpdateLinePropertiesSchema.parse(input)).toThrow();
  });

  it('should reject missing presentationId', () => {
    const input = {
      objectId: 'line456'
    };
    expect(() => SlidesUpdateLinePropertiesSchema.parse(input)).toThrow(/Required/);
  });

  it('should reject missing objectId', () => {
    const input = {
      presentationId: 'presentation123'
    };
    expect(() => SlidesUpdateLinePropertiesSchema.parse(input)).toThrow(/Required/);
  });
});
