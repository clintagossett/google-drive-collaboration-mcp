import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const SlidesUpdatePageElementsZOrderSchema = z.object({
  presentationId: z.string().min(1, "Presentation ID is required"),
  pageElementObjectIds: z.array(z.string()).min(1, "At least one element ID is required"),
  operation: z.enum(['BRING_TO_FRONT', 'SEND_TO_BACK', 'BRING_FORWARD', 'SEND_BACKWARD'])
});

describe('slides_updatePageElementsZOrder Schema Validation', () => {
  it('should validate BRING_TO_FRONT', () => {
    const input = {
      presentationId: 'p123',
      pageElementObjectIds: ['obj1'],
      operation: 'BRING_TO_FRONT' as const
    };
    expect(() => SlidesUpdatePageElementsZOrderSchema.parse(input)).not.toThrow();
  });

  it('should validate with multiple elements', () => {
    const input = {
      presentationId: 'p123',
      pageElementObjectIds: ['obj1', 'obj2', 'obj3'],
      operation: 'SEND_TO_BACK' as const
    };
    expect(() => SlidesUpdatePageElementsZOrderSchema.parse(input)).not.toThrow();
  });

  it('should validate all operations', () => {
    const operations = ['BRING_TO_FRONT', 'SEND_TO_BACK', 'BRING_FORWARD', 'SEND_BACKWARD'] as const;
    operations.forEach(op => {
      const input = { presentationId: 'p123', pageElementObjectIds: ['obj1'], operation: op };
      expect(() => SlidesUpdatePageElementsZOrderSchema.parse(input)).not.toThrow();
    });
  });

  it('should reject empty array', () => {
    const input = { presentationId: 'p123', pageElementObjectIds: [], operation: 'BRING_TO_FRONT' };
    expect(() => SlidesUpdatePageElementsZOrderSchema.parse(input)).toThrow(/At least one element ID is required/);
  });

  it('should reject invalid operation', () => {
    const input = { presentationId: 'p123', pageElementObjectIds: ['obj1'], operation: 'INVALID' };
    expect(() => SlidesUpdatePageElementsZOrderSchema.parse(input)).toThrow();
  });

  it('should reject missing presentationId', () => {
    const input = { pageElementObjectIds: ['obj1'], operation: 'BRING_TO_FRONT' };
    expect(() => SlidesUpdatePageElementsZOrderSchema.parse(input)).toThrow(/Required/);
  });
});
