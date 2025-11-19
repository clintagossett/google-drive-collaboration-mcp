import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const SlidesCreateTableSchema = z.object({
  presentationId: z.string().min(1, "Presentation ID is required"),
  pageObjectId: z.string().min(1, "Page object ID is required"),
  rows: z.number().min(1, "Must have at least 1 row"),
  columns: z.number().min(1, "Must have at least 1 column"),
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

describe('slides_createTable Schema Validation', () => {
  it('should validate minimal valid input', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      rows: 3,
      columns: 4
    };
    expect(() => SlidesCreateTableSchema.parse(input)).not.toThrow();
  });

  it('should validate 1x1 table', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      rows: 1,
      columns: 1
    };
    expect(() => SlidesCreateTableSchema.parse(input)).not.toThrow();
  });

  it('should validate large table', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      rows: 20,
      columns: 10
    };
    expect(() => SlidesCreateTableSchema.parse(input)).not.toThrow();
  });

  it('should validate with size', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      rows: 3,
      columns: 4,
      elementProperties: {
        size: {
          width: { magnitude: 600, unit: 'PT' as const },
          height: { magnitude: 400, unit: 'PT' as const }
        }
      }
    };
    expect(() => SlidesCreateTableSchema.parse(input)).not.toThrow();
  });

  it('should validate with transform', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      rows: 3,
      columns: 4,
      elementProperties: {
        transform: {
          translateX: 100,
          translateY: 100,
          unit: 'PT' as const
        }
      }
    };
    expect(() => SlidesCreateTableSchema.parse(input)).not.toThrow();
  });

  it('should reject missing presentationId', () => {
    const input = {
      pageObjectId: 'slide456',
      rows: 3,
      columns: 4
    };
    expect(() => SlidesCreateTableSchema.parse(input)).toThrow(/Required/);
  });

  it('should reject empty presentationId', () => {
    const input = {
      presentationId: '',
      pageObjectId: 'slide456',
      rows: 3,
      columns: 4
    };
    expect(() => SlidesCreateTableSchema.parse(input)).toThrow(/Presentation ID is required/);
  });

  it('should reject missing pageObjectId', () => {
    const input = {
      presentationId: 'presentation123',
      rows: 3,
      columns: 4
    };
    expect(() => SlidesCreateTableSchema.parse(input)).toThrow(/Required/);
  });

  it('should reject missing rows', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      columns: 4
    };
    expect(() => SlidesCreateTableSchema.parse(input)).toThrow(/Required/);
  });

  it('should reject zero rows', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      rows: 0,
      columns: 4
    };
    expect(() => SlidesCreateTableSchema.parse(input)).toThrow(/Must have at least 1 row/);
  });

  it('should reject negative rows', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      rows: -1,
      columns: 4
    };
    expect(() => SlidesCreateTableSchema.parse(input)).toThrow(/Must have at least 1 row/);
  });

  it('should reject zero columns', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      rows: 3,
      columns: 0
    };
    expect(() => SlidesCreateTableSchema.parse(input)).toThrow(/Must have at least 1 column/);
  });

  it('should reject negative columns', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      rows: 3,
      columns: -1
    };
    expect(() => SlidesCreateTableSchema.parse(input)).toThrow(/Must have at least 1 column/);
  });
});
