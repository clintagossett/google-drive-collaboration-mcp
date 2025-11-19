import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const SlidesRerouteLineSchema = z.object({
  presentationId: z.string().min(1, "Presentation ID is required"),
  objectId: z.string().min(1, "Object ID is required")
});

describe('slides_rerouteLine Schema Validation', () => {
  it('should validate valid input', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'line456'
    };
    expect(() => SlidesRerouteLineSchema.parse(input)).not.toThrow();
  });

  it('should reject missing presentationId', () => {
    const input = {
      objectId: 'line456'
    };
    expect(() => SlidesRerouteLineSchema.parse(input)).toThrow(/Required/);
  });

  it('should reject empty presentationId', () => {
    const input = {
      presentationId: '',
      objectId: 'line456'
    };
    expect(() => SlidesRerouteLineSchema.parse(input)).toThrow(/Presentation ID is required/);
  });

  it('should reject missing objectId', () => {
    const input = {
      presentationId: 'presentation123'
    };
    expect(() => SlidesRerouteLineSchema.parse(input)).toThrow(/Required/);
  });

  it('should reject empty objectId', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: ''
    };
    expect(() => SlidesRerouteLineSchema.parse(input)).toThrow(/Object ID is required/);
  });
});
