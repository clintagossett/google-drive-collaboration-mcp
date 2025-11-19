import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const SlidesUpdateLineCategorySchema = z.object({
  presentationId: z.string().min(1, "Presentation ID is required"),
  objectId: z.string().min(1, "Object ID is required"),
  lineCategory: z.enum(['STRAIGHT', 'BENT', 'CURVED'])
});

describe('slides_updateLineCategory Schema Validation', () => {
  it('should validate with STRAIGHT category', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'line456',
      lineCategory: 'STRAIGHT' as const
    };
    expect(() => SlidesUpdateLineCategorySchema.parse(input)).not.toThrow();
  });

  it('should validate with BENT category', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'line456',
      lineCategory: 'BENT' as const
    };
    expect(() => SlidesUpdateLineCategorySchema.parse(input)).not.toThrow();
  });

  it('should validate with CURVED category', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'line456',
      lineCategory: 'CURVED' as const
    };
    expect(() => SlidesUpdateLineCategorySchema.parse(input)).not.toThrow();
  });

  it('should reject invalid line category', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'line456',
      lineCategory: 'INVALID'
    };
    expect(() => SlidesUpdateLineCategorySchema.parse(input)).toThrow();
  });

  it('should reject missing presentationId', () => {
    const input = {
      objectId: 'line456',
      lineCategory: 'STRAIGHT'
    };
    expect(() => SlidesUpdateLineCategorySchema.parse(input)).toThrow(/Required/);
  });

  it('should reject empty presentationId', () => {
    const input = {
      presentationId: '',
      objectId: 'line456',
      lineCategory: 'STRAIGHT'
    };
    expect(() => SlidesUpdateLineCategorySchema.parse(input)).toThrow(/Presentation ID is required/);
  });

  it('should reject missing objectId', () => {
    const input = {
      presentationId: 'presentation123',
      lineCategory: 'STRAIGHT'
    };
    expect(() => SlidesUpdateLineCategorySchema.parse(input)).toThrow(/Required/);
  });

  it('should reject empty objectId', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: '',
      lineCategory: 'STRAIGHT'
    };
    expect(() => SlidesUpdateLineCategorySchema.parse(input)).toThrow(/Object ID is required/);
  });

  it('should reject missing lineCategory', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'line456'
    };
    expect(() => SlidesUpdateLineCategorySchema.parse(input)).toThrow(/Required/);
  });
});
