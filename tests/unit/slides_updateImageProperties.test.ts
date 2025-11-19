import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const SlidesUpdateImagePropertiesSchema = z.object({
  presentationId: z.string().min(1, "Presentation ID is required"),
  objectId: z.string().min(1, "Object ID is required"),
  imageProperties: z.object({
    brightness: z.number().min(-1).max(1).optional(),
    contrast: z.number().min(-1).max(1).optional(),
    transparency: z.number().min(0).max(1).optional()
  }).optional()
});

describe('slides_updateImageProperties Schema Validation', () => {
  it('should validate minimal valid input', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'image456'
    };
    expect(() => SlidesUpdateImagePropertiesSchema.parse(input)).not.toThrow();
  });

  it('should validate with brightness', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'image456',
      imageProperties: {
        brightness: 0.5
      }
    };
    expect(() => SlidesUpdateImagePropertiesSchema.parse(input)).not.toThrow();
  });

  it('should validate with contrast', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'image456',
      imageProperties: {
        contrast: -0.3
      }
    };
    expect(() => SlidesUpdateImagePropertiesSchema.parse(input)).not.toThrow();
  });

  it('should validate with transparency', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'image456',
      imageProperties: {
        transparency: 0.25
      }
    };
    expect(() => SlidesUpdateImagePropertiesSchema.parse(input)).not.toThrow();
  });

  it('should reject brightness out of range', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'image456',
      imageProperties: {
        brightness: 1.5
      }
    };
    expect(() => SlidesUpdateImagePropertiesSchema.parse(input)).toThrow();
  });

  it('should reject contrast out of range', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'image456',
      imageProperties: {
        contrast: -2.0
      }
    };
    expect(() => SlidesUpdateImagePropertiesSchema.parse(input)).toThrow();
  });

  it('should reject missing presentationId', () => {
    const input = {
      objectId: 'image456'
    };
    expect(() => SlidesUpdateImagePropertiesSchema.parse(input)).toThrow(/Required/);
  });

  it('should reject missing objectId', () => {
    const input = {
      presentationId: 'presentation123'
    };
    expect(() => SlidesUpdateImagePropertiesSchema.parse(input)).toThrow(/Required/);
  });
});
