import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const SlidesUngroupObjectsSchema = z.object({
  presentationId: z.string().min(1, "Presentation ID is required"),
  objectIds: z.array(z.string()).min(1, "At least one group ID is required")
});

describe('slides_ungroupObjects Schema Validation', () => {
  it('should validate with single group', () => {
    const input = {
      presentationId: 'p123',
      objectIds: ['group1']
    };
    expect(() => SlidesUngroupObjectsSchema.parse(input)).not.toThrow();
  });

  it('should validate with multiple groups', () => {
    const input = {
      presentationId: 'p123',
      objectIds: ['group1', 'group2', 'group3']
    };
    expect(() => SlidesUngroupObjectsSchema.parse(input)).not.toThrow();
  });

  it('should reject empty array', () => {
    const input = {
      presentationId: 'p123',
      objectIds: []
    };
    expect(() => SlidesUngroupObjectsSchema.parse(input)).toThrow(/At least one group ID is required/);
  });

  it('should reject missing presentationId', () => {
    const input = { objectIds: ['group1'] };
    expect(() => SlidesUngroupObjectsSchema.parse(input)).toThrow(/Required/);
  });

  it('should reject empty presentationId', () => {
    const input = { presentationId: '', objectIds: ['group1'] };
    expect(() => SlidesUngroupObjectsSchema.parse(input)).toThrow(/Presentation ID is required/);
  });
});
