import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const SlidesUpdatePageElementAltTextSchema = z.object({
  presentationId: z.string().min(1, "Presentation ID is required"),
  objectId: z.string().min(1, "Object ID is required"),
  title: z.string().optional(),
  description: z.string().optional()
});

describe('slides_updatePageElementAltText Schema Validation', () => {
  it('should validate minimal input', () => {
    const input = {
      presentationId: 'p123',
      objectId: 'obj456'
    };
    expect(() => SlidesUpdatePageElementAltTextSchema.parse(input)).not.toThrow();
  });

  it('should validate with title', () => {
    const input = {
      presentationId: 'p123',
      objectId: 'obj456',
      title: 'Image Title'
    };
    expect(() => SlidesUpdatePageElementAltTextSchema.parse(input)).not.toThrow();
  });

  it('should validate with description', () => {
    const input = {
      presentationId: 'p123',
      objectId: 'obj456',
      description: 'Detailed description'
    };
    expect(() => SlidesUpdatePageElementAltTextSchema.parse(input)).not.toThrow();
  });

  it('should validate with both', () => {
    const input = {
      presentationId: 'p123',
      objectId: 'obj456',
      title: 'Title',
      description: 'Description'
    };
    expect(() => SlidesUpdatePageElementAltTextSchema.parse(input)).not.toThrow();
  });

  it('should reject missing presentationId', () => {
    const input = { objectId: 'obj456' };
    expect(() => SlidesUpdatePageElementAltTextSchema.parse(input)).toThrow(/Required/);
  });

  it('should reject empty presentationId', () => {
    const input = { presentationId: '', objectId: 'obj456' };
    expect(() => SlidesUpdatePageElementAltTextSchema.parse(input)).toThrow(/Presentation ID is required/);
  });

  it('should reject missing objectId', () => {
    const input = { presentationId: 'p123' };
    expect(() => SlidesUpdatePageElementAltTextSchema.parse(input)).toThrow(/Required/);
  });
});
