import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const SlidesUpdateVideoPropertiesSchema = z.object({
  presentationId: z.string().min(1, "Presentation ID is required"),
  objectId: z.string().min(1, "Object ID is required"),
  videoProperties: z.object({
    autoPlay: z.boolean().optional(),
    start: z.number().min(0).optional(),
    end: z.number().min(0).optional(),
    mute: z.boolean().optional()
  }).optional()
});

describe('slides_updateVideoProperties Schema Validation', () => {
  it('should validate minimal valid input', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'video456'
    };
    expect(() => SlidesUpdateVideoPropertiesSchema.parse(input)).not.toThrow();
  });

  it('should validate with autoPlay', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'video456',
      videoProperties: {
        autoPlay: true
      }
    };
    expect(() => SlidesUpdateVideoPropertiesSchema.parse(input)).not.toThrow();
  });

  it('should validate with start and end times', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'video456',
      videoProperties: {
        start: 10,
        end: 60
      }
    };
    expect(() => SlidesUpdateVideoPropertiesSchema.parse(input)).not.toThrow();
  });

  it('should validate with mute', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'video456',
      videoProperties: {
        mute: true
      }
    };
    expect(() => SlidesUpdateVideoPropertiesSchema.parse(input)).not.toThrow();
  });

  it('should reject negative start time', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'video456',
      videoProperties: {
        start: -5
      }
    };
    expect(() => SlidesUpdateVideoPropertiesSchema.parse(input)).toThrow();
  });

  it('should reject negative end time', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'video456',
      videoProperties: {
        end: -5
      }
    };
    expect(() => SlidesUpdateVideoPropertiesSchema.parse(input)).toThrow();
  });

  it('should reject missing presentationId', () => {
    const input = {
      objectId: 'video456'
    };
    expect(() => SlidesUpdateVideoPropertiesSchema.parse(input)).toThrow(/Required/);
  });

  it('should reject missing objectId', () => {
    const input = {
      presentationId: 'presentation123'
    };
    expect(() => SlidesUpdateVideoPropertiesSchema.parse(input)).toThrow(/Required/);
  });
});
