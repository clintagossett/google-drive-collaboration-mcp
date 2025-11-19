import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const SlidesRefreshSheetsChartSchema = z.object({
  presentationId: z.string().min(1, "Presentation ID is required"),
  objectId: z.string().min(1, "Object ID is required")
});

describe('slides_refreshSheetsChart Schema Validation', () => {
  it('should validate valid input', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'chart456'
    };
    expect(() => SlidesRefreshSheetsChartSchema.parse(input)).not.toThrow();
  });

  it('should reject missing presentationId', () => {
    const input = {
      objectId: 'chart456'
    };
    expect(() => SlidesRefreshSheetsChartSchema.parse(input)).toThrow(/Required/);
  });

  it('should reject empty presentationId', () => {
    const input = {
      presentationId: '',
      objectId: 'chart456'
    };
    expect(() => SlidesRefreshSheetsChartSchema.parse(input)).toThrow(/Presentation ID is required/);
  });

  it('should reject missing objectId', () => {
    const input = {
      presentationId: 'presentation123'
    };
    expect(() => SlidesRefreshSheetsChartSchema.parse(input)).toThrow(/Required/);
  });

  it('should reject empty objectId', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: ''
    };
    expect(() => SlidesRefreshSheetsChartSchema.parse(input)).toThrow(/Object ID is required/);
  });
});
