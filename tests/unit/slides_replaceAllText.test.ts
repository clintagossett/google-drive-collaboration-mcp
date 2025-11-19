import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema definition for slides_replaceAllText
const SlidesReplaceAllTextSchema = z.object({
  presentationId: z.string().min(1, "Presentation ID is required"),
  containsText: z.object({
    text: z.string().min(1, "Search text is required"),
    matchCase: z.boolean().optional()
  }),
  replaceText: z.string(),
  pageObjectIds: z.array(z.string()).optional()
});

describe('slides_replaceAllText Schema Validation', () => {
  it('should validate minimal valid input', () => {
    const input = {
      presentationId: 'presentation123',
      containsText: {
        text: 'oldText'
      },
      replaceText: 'newText'
    };
    expect(() => SlidesReplaceAllTextSchema.parse(input)).not.toThrow();
  });

  it('should validate with case-sensitive search', () => {
    const input = {
      presentationId: 'presentation123',
      containsText: {
        text: 'oldText',
        matchCase: true
      },
      replaceText: 'newText'
    };
    expect(() => SlidesReplaceAllTextSchema.parse(input)).not.toThrow();
  });

  it('should validate with case-insensitive search', () => {
    const input = {
      presentationId: 'presentation123',
      containsText: {
        text: 'oldText',
        matchCase: false
      },
      replaceText: 'newText'
    };
    expect(() => SlidesReplaceAllTextSchema.parse(input)).not.toThrow();
  });

  it('should validate with specific page object IDs', () => {
    const input = {
      presentationId: 'presentation123',
      containsText: {
        text: 'oldText'
      },
      replaceText: 'newText',
      pageObjectIds: ['slide1', 'slide2', 'slide3']
    };
    expect(() => SlidesReplaceAllTextSchema.parse(input)).not.toThrow();
  });

  it('should validate with empty replacement text', () => {
    const input = {
      presentationId: 'presentation123',
      containsText: {
        text: 'oldText'
      },
      replaceText: ''
    };
    expect(() => SlidesReplaceAllTextSchema.parse(input)).not.toThrow();
  });

  it('should reject missing presentationId', () => {
    const input = {
      containsText: {
        text: 'oldText'
      },
      replaceText: 'newText'
    };
    expect(() => SlidesReplaceAllTextSchema.parse(input)).toThrow(/Required/);
  });

  it('should reject empty presentationId', () => {
    const input = {
      presentationId: '',
      containsText: {
        text: 'oldText'
      },
      replaceText: 'newText'
    };
    expect(() => SlidesReplaceAllTextSchema.parse(input)).toThrow(/Presentation ID is required/);
  });

  it('should reject missing containsText', () => {
    const input = {
      presentationId: 'presentation123',
      replaceText: 'newText'
    };
    expect(() => SlidesReplaceAllTextSchema.parse(input)).toThrow(/Required/);
  });

  it('should reject empty search text', () => {
    const input = {
      presentationId: 'presentation123',
      containsText: {
        text: ''
      },
      replaceText: 'newText'
    };
    expect(() => SlidesReplaceAllTextSchema.parse(input)).toThrow(/Search text is required/);
  });

  it('should reject missing replaceText', () => {
    const input = {
      presentationId: 'presentation123',
      containsText: {
        text: 'oldText'
      }
    };
    expect(() => SlidesReplaceAllTextSchema.parse(input)).toThrow(/Required/);
  });

  it('should reject invalid pageObjectIds type', () => {
    const input = {
      presentationId: 'presentation123',
      containsText: {
        text: 'oldText'
      },
      replaceText: 'newText',
      pageObjectIds: 'not-an-array'
    };
    expect(() => SlidesReplaceAllTextSchema.parse(input)).toThrow();
  });
});
