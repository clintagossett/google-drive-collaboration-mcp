import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const SlidesCreateSheetsChartSchema = z.object({
  presentationId: z.string().min(1, "Presentation ID is required"),
  pageObjectId: z.string().min(1, "Page object ID is required"),
  spreadsheetId: z.string().min(1, "Spreadsheet ID is required"),
  chartId: z.number().min(0, "Chart ID must be non-negative"),
  linkingMode: z.enum(['LINKED', 'NOT_LINKED_IMAGE']).optional(),
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

describe('slides_createSheetsChart Schema Validation', () => {
  it('should validate minimal valid input', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      spreadsheetId: 'spreadsheet789',
      chartId: 0
    };
    expect(() => SlidesCreateSheetsChartSchema.parse(input)).not.toThrow();
  });

  it('should validate with LINKED mode', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      spreadsheetId: 'spreadsheet789',
      chartId: 123,
      linkingMode: 'LINKED' as const
    };
    expect(() => SlidesCreateSheetsChartSchema.parse(input)).not.toThrow();
  });

  it('should validate with NOT_LINKED_IMAGE mode', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      spreadsheetId: 'spreadsheet789',
      chartId: 123,
      linkingMode: 'NOT_LINKED_IMAGE' as const
    };
    expect(() => SlidesCreateSheetsChartSchema.parse(input)).not.toThrow();
  });

  it('should reject missing presentationId', () => {
    const input = {
      pageObjectId: 'slide456',
      spreadsheetId: 'spreadsheet789',
      chartId: 123
    };
    expect(() => SlidesCreateSheetsChartSchema.parse(input)).toThrow(/Required/);
  });

  it('should reject missing spreadsheetId', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      chartId: 123
    };
    expect(() => SlidesCreateSheetsChartSchema.parse(input)).toThrow(/Required/);
  });

  it('should reject negative chartId', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      spreadsheetId: 'spreadsheet789',
      chartId: -1
    };
    expect(() => SlidesCreateSheetsChartSchema.parse(input)).toThrow(/Chart ID must be non-negative/);
  });

  it('should reject invalid linking mode', () => {
    const input = {
      presentationId: 'presentation123',
      pageObjectId: 'slide456',
      spreadsheetId: 'spreadsheet789',
      chartId: 123,
      linkingMode: 'INVALID'
    };
    expect(() => SlidesCreateSheetsChartSchema.parse(input)).toThrow();
  });
});
