import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const SlidesGroupObjectsSchema = z.object({
  presentationId: z.string().min(1, "Presentation ID is required"),
  childrenObjectIds: z.array(z.string()).min(2, "At least two objects are required to group"),
  groupObjectId: z.string().optional()
});

describe('slides_groupObjects Schema Validation', () => {
  it('should validate with two objects', () => {
    const input = {
      presentationId: 'p123',
      childrenObjectIds: ['obj1', 'obj2']
    };
    expect(() => SlidesGroupObjectsSchema.parse(input)).not.toThrow();
  });

  it('should validate with many objects', () => {
    const input = {
      presentationId: 'p123',
      childrenObjectIds: ['obj1', 'obj2', 'obj3', 'obj4', 'obj5']
    };
    expect(() => SlidesGroupObjectsSchema.parse(input)).not.toThrow();
  });

  it('should validate with groupObjectId', () => {
    const input = {
      presentationId: 'p123',
      childrenObjectIds: ['obj1', 'obj2'],
      groupObjectId: 'customGroup1'
    };
    expect(() => SlidesGroupObjectsSchema.parse(input)).not.toThrow();
  });

  it('should reject single object', () => {
    const input = {
      presentationId: 'p123',
      childrenObjectIds: ['obj1']
    };
    expect(() => SlidesGroupObjectsSchema.parse(input)).toThrow(/At least two objects are required to group/);
  });

  it('should reject empty array', () => {
    const input = {
      presentationId: 'p123',
      childrenObjectIds: []
    };
    expect(() => SlidesGroupObjectsSchema.parse(input)).toThrow(/At least two objects are required to group/);
  });

  it('should reject missing presentationId', () => {
    const input = { childrenObjectIds: ['obj1', 'obj2'] };
    expect(() => SlidesGroupObjectsSchema.parse(input)).toThrow(/Required/);
  });
});
