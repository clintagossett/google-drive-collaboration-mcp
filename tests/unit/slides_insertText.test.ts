import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema definition for slides_insertText
const SlidesInsertTextSchema = z.object({
  presentationId: z.string().min(1, "Presentation ID is required"),
  objectId: z.string().min(1, "Object ID is required"),
  text: z.string(),
  insertionIndex: z.number().min(0, "Insertion index must be at least 0").optional(),
  cellLocation: z.object({
    rowIndex: z.number().min(0),
    columnIndex: z.number().min(0)
  }).optional()
});

describe('slides_insertText Schema Validation', () => {
  it('should validate minimal valid input (text box)', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'textbox456',
      text: 'Hello World'
    };
    expect(() => SlidesInsertTextSchema.parse(input)).not.toThrow();
  });

  it('should validate with insertion index', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'textbox456',
      text: 'Inserted text',
      insertionIndex: 5
    };
    expect(() => SlidesInsertTextSchema.parse(input)).not.toThrow();
  });

  it('should validate with table cell location', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'table789',
      text: 'Cell content',
      cellLocation: {
        rowIndex: 0,
        columnIndex: 1
      }
    };
    expect(() => SlidesInsertTextSchema.parse(input)).not.toThrow();
  });

  it('should validate empty text', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'textbox456',
      text: ''
    };
    expect(() => SlidesInsertTextSchema.parse(input)).not.toThrow();
  });

  it('should reject missing presentationId', () => {
    const input = {
      objectId: 'textbox456',
      text: 'Hello World'
    };
    expect(() => SlidesInsertTextSchema.parse(input)).toThrow(/Required/);
  });

  it('should reject empty presentationId', () => {
    const input = {
      presentationId: '',
      objectId: 'textbox456',
      text: 'Hello World'
    };
    expect(() => SlidesInsertTextSchema.parse(input)).toThrow(/Presentation ID is required/);
  });

  it('should reject missing objectId', () => {
    const input = {
      presentationId: 'presentation123',
      text: 'Hello World'
    };
    expect(() => SlidesInsertTextSchema.parse(input)).toThrow(/Required/);
  });

  it('should reject empty objectId', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: '',
      text: 'Hello World'
    };
    expect(() => SlidesInsertTextSchema.parse(input)).toThrow(/Object ID is required/);
  });

  it('should reject negative insertion index', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'textbox456',
      text: 'Hello World',
      insertionIndex: -1
    };
    expect(() => SlidesInsertTextSchema.parse(input)).toThrow(/Insertion index must be at least 0/);
  });

  it('should reject negative row index in cell location', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'table789',
      text: 'Cell content',
      cellLocation: {
        rowIndex: -1,
        columnIndex: 0
      }
    };
    expect(() => SlidesInsertTextSchema.parse(input)).toThrow();
  });

  it('should reject negative column index in cell location', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'table789',
      text: 'Cell content',
      cellLocation: {
        rowIndex: 0,
        columnIndex: -1
      }
    };
    expect(() => SlidesInsertTextSchema.parse(input)).toThrow();
  });

  it('should validate with both insertion index and cell location', () => {
    const input = {
      presentationId: 'presentation123',
      objectId: 'table789',
      text: 'Cell content',
      insertionIndex: 0,
      cellLocation: {
        rowIndex: 0,
        columnIndex: 0
      }
    };
    expect(() => SlidesInsertTextSchema.parse(input)).not.toThrow();
  });
});
