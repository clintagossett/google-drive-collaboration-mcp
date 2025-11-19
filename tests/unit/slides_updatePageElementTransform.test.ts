import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema definition for slides_updatePageElementTransform
const SlidesUpdatePageElementTransformSchema = z.object({
  presentationId: z.string().min(1, "Presentation ID is required"),
  objectId: z.string().min(1, "Object ID is required"),
  transform: z.object({
    scaleX: z.number().optional(),
    scaleY: z.number().optional(),
    shearX: z.number().optional(),
    shearY: z.number().optional(),
    translateX: z.number().optional(),
    translateY: z.number().optional(),
    unit: z.enum(['EMU', 'PT']).optional()
  }),
  applyMode: z.enum(['RELATIVE', 'ABSOLUTE']).optional()
});

describe('slides_updatePageElementTransform Schema Validation', () => {
  it('should validate minimal valid input with scale', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'shape456',
      transform: {
        scaleX: 2.0,
        scaleY: 2.0
      }
    };
    expect(() => SlidesUpdatePageElementTransformSchema.parse(input)).not.toThrow();
  });

  it('should validate with translation in EMU', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'shape456',
      transform: {
        translateX: 914400,
        translateY: 914400,
        unit: 'EMU' as const
      }
    };
    expect(() => SlidesUpdatePageElementTransformSchema.parse(input)).not.toThrow();
  });

  it('should validate with translation in PT', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'shape456',
      transform: {
        translateX: 72,
        translateY: 72,
        unit: 'PT' as const
      }
    };
    expect(() => SlidesUpdatePageElementTransformSchema.parse(input)).not.toThrow();
  });

  it('should validate with shear transformation', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'shape456',
      transform: {
        shearX: 0.5,
        shearY: 0.3
      }
    };
    expect(() => SlidesUpdatePageElementTransformSchema.parse(input)).not.toThrow();
  });

  it('should validate with relative apply mode', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'shape456',
      transform: {
        scaleX: 1.5,
        scaleY: 1.5
      },
      applyMode: 'RELATIVE' as const
    };
    expect(() => SlidesUpdatePageElementTransformSchema.parse(input)).not.toThrow();
  });

  it('should validate with absolute apply mode', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'shape456',
      transform: {
        translateX: 100,
        translateY: 100,
        unit: 'PT' as const
      },
      applyMode: 'ABSOLUTE' as const
    };
    expect(() => SlidesUpdatePageElementTransformSchema.parse(input)).not.toThrow();
  });

  it('should validate with all transform properties', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'shape456',
      transform: {
        scaleX: 2.0,
        scaleY: 1.5,
        shearX: 0.1,
        shearY: 0.2,
        translateX: 100,
        translateY: 200,
        unit: 'PT' as const
      },
      applyMode: 'RELATIVE' as const
    };
    expect(() => SlidesUpdatePageElementTransformSchema.parse(input)).not.toThrow();
  });

  it('should validate empty transform object', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'shape456',
      transform: {}
    };
    expect(() => SlidesUpdatePageElementTransformSchema.parse(input)).not.toThrow();
  });

  it('should reject missing presentationId', () => {
    const input = {
      objectId: 'shape456',
      transform: {
        scaleX: 2.0
      }
    };
    expect(() => SlidesUpdatePageElementTransformSchema.parse(input)).toThrow(/Required/);
  });

  it('should reject empty presentationId', () => {
    const input = {
      presentationId: '',
      objectId: 'shape456',
      transform: {
        scaleX: 2.0
      }
    };
    expect(() => SlidesUpdatePageElementTransformSchema.parse(input)).toThrow(/Presentation ID is required/);
  });

  it('should reject missing objectId', () => {
    const input = {
      presentationId: 'presentation123',
      transform: {
        scaleX: 2.0
      }
    };
    expect(() => SlidesUpdatePageElementTransformSchema.parse(input)).toThrow(/Required/);
  });

  it('should reject empty objectId', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: '',
      transform: {
        scaleX: 2.0
      }
    };
    expect(() => SlidesUpdatePageElementTransformSchema.parse(input)).toThrow(/Object ID is required/);
  });

  it('should reject missing transform', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'shape456'
    };
    expect(() => SlidesUpdatePageElementTransformSchema.parse(input)).toThrow(/Required/);
  });

  it('should reject invalid unit', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'shape456',
      transform: {
        translateX: 100,
        unit: 'INVALID'
      }
    };
    expect(() => SlidesUpdatePageElementTransformSchema.parse(input)).toThrow();
  });

  it('should reject invalid applyMode', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'shape456',
      transform: {
        scaleX: 2.0
      },
      applyMode: 'INVALID'
    };
    expect(() => SlidesUpdatePageElementTransformSchema.parse(input)).toThrow();
  });
});
