import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const SlidesCreateVideoSchema = z.object({
  presentationId: z.string().min(1, "Presentation ID is required"),
  pageObjectId: z.string().min(1, "Page object ID is required"),
  source: z.enum(['YOUTUBE', 'DRIVE']),
  id: z.string().min(1, "Video ID is required"),
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

describe('slides_createVideo Schema Validation', () => {
  it('should validate YouTube video', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      source: 'YOUTUBE' as const,
      id: 'dQw4w9WgXcQ'
    };
    expect(() => SlidesCreateVideoSchema.parse(input)).not.toThrow();
  });

  it('should validate Google Drive video', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      source: 'DRIVE' as const,
      id: '1abc123def456'
    };
    expect(() => SlidesCreateVideoSchema.parse(input)).not.toThrow();
  });

  it('should validate with size', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      source: 'YOUTUBE' as const,
      id: 'dQw4w9WgXcQ',
      elementProperties: {
        size: {
          width: { magnitude: 500, unit: 'PT' as const },
          height: { magnitude: 300, unit: 'PT' as const }
        }
      }
    };
    expect(() => SlidesCreateVideoSchema.parse(input)).not.toThrow();
  });

  it('should validate with transform', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      source: 'YOUTUBE' as const,
      id: 'dQw4w9WgXcQ',
      elementProperties: {
        transform: {
          translateX: 100,
          translateY: 100,
          unit: 'PT' as const
        }
      }
    };
    expect(() => SlidesCreateVideoSchema.parse(input)).not.toThrow();
  });

  it('should reject missing presentationId', () => {
    const input = {
      pageObjectId: 'slide456',
      source: 'YOUTUBE',
      id: 'dQw4w9WgXcQ'
    };
    expect(() => SlidesCreateVideoSchema.parse(input)).toThrow(/Required/);
  });

  it('should reject empty presentationId', () => {
    const input = {
      presentationId: '',
      pageObjectId: 'slide456',
      source: 'YOUTUBE' as const,
      id: 'dQw4w9WgXcQ'
    };
    expect(() => SlidesCreateVideoSchema.parse(input)).toThrow(/Presentation ID is required/);
  });

  it('should reject missing pageObjectId', () => {
    const input = {
      presentationId: 'presentation123',
      source: 'YOUTUBE',
      id: 'dQw4w9WgXcQ'
    };
    expect(() => SlidesCreateVideoSchema.parse(input)).toThrow(/Required/);
  });

  it('should reject invalid source', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      source: 'VIMEO',
      id: 'dQw4w9WgXcQ'
    };
    expect(() => SlidesCreateVideoSchema.parse(input)).toThrow();
  });

  it('should reject missing video id', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      source: 'YOUTUBE'
    };
    expect(() => SlidesCreateVideoSchema.parse(input)).toThrow(/Required/);
  });

  it('should reject empty video id', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      source: 'YOUTUBE' as const,
      id: ''
    };
    expect(() => SlidesCreateVideoSchema.parse(input)).toThrow(/Video ID is required/);
  });
});
