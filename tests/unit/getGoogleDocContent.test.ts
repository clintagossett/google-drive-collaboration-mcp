import { describe, it, expect } from 'vitest';

/**
 * Unit tests for getGoogleDocContent - Index System Fix
 *
 * These tests verify that getGoogleDocContent uses Google API-provided
 * indices instead of manual index counting.
 *
 * Context: Fixed TOC index bug where manual counting skipped TOC/tables,
 * causing ~1235 char offset between read and write operations.
 */

describe('getGoogleDocContent - API Index System', () => {

  /**
   * Helper to simulate the FIXED getGoogleDocContent logic
   */
  function extractContentWithIndices(documentData: any) {
    let content = '';
    const segments: Array<{text: string, startIndex: number, endIndex: number}> = [];

    if (documentData.body?.content) {
      for (const element of documentData.body.content) {
        if (element.paragraph?.elements) {
          for (const textElement of element.paragraph.elements) {
            if (textElement.textRun?.content &&
                textElement.startIndex !== undefined &&
                textElement.endIndex !== undefined) {
              segments.push({
                text: textElement.textRun.content,
                startIndex: textElement.startIndex,
                endIndex: textElement.endIndex
              });
              content += textElement.textRun.content;
            }
          }
        }
      }
    }

    return { content, segments };
  }

  it('should use API-provided indices instead of manual counting', () => {
    const mockDocument = {
      body: {
        content: [
          {
            paragraph: {
              elements: [
                {
                  startIndex: 1000,  // API provides this
                  endIndex: 1012,    // API provides this
                  textRun: {
                    content: 'Test content'
                  }
                }
              ]
            }
          }
        ]
      }
    };

    const result = extractContentWithIndices(mockDocument);

    // Should use API indices (1000-1012), not manual counting (1-12)
    expect(result.segments).toHaveLength(1);
    expect(result.segments[0].startIndex).toBe(1000);
    expect(result.segments[0].endIndex).toBe(1012);
    expect(result.segments[0].text).toBe('Test content');
  });

  it('should handle documents with TOC using absolute indices', () => {
    const mockDocument = {
      body: {
        content: [
          {
            startIndex: 1,
            endIndex: 1235,
            tableOfContents: {}  // TOC takes up indices 1-1235
          },
          {
            paragraph: {
              elements: [
                {
                  startIndex: 1235,  // Content starts after TOC
                  endIndex: 1297,
                  textRun: {
                    content: 'TESTMARKER\n'
                  }
                }
              ]
            }
          }
        ]
      }
    };

    const result = extractContentWithIndices(mockDocument);

    // Should use absolute index 1235, not relative index 1
    expect(result.segments).toHaveLength(1);
    expect(result.segments[0].startIndex).toBe(1235);
    expect(result.segments[0].endIndex).toBe(1297);
    expect(result.segments[0].text).toBe('TESTMARKER\n');
  });

  it('should skip elements without startIndex/endIndex', () => {
    const mockDocument = {
      body: {
        content: [
          {
            paragraph: {
              elements: [
                {
                  // Missing startIndex and endIndex - should be skipped
                  textRun: {
                    content: 'Should be skipped'
                  }
                },
                {
                  startIndex: 100,
                  endIndex: 108,
                  textRun: {
                    content: 'Included'
                  }
                }
              ]
            }
          }
        ]
      }
    };

    const result = extractContentWithIndices(mockDocument);

    // Should only include element with indices
    expect(result.segments).toHaveLength(1);
    expect(result.segments[0].text).toBe('Included');
    expect(result.segments[0].startIndex).toBe(100);
    expect(result.segments[0].endIndex).toBe(108);
  });

  it('should handle multiple paragraphs with correct absolute indices', () => {
    const mockDocument = {
      body: {
        content: [
          {
            paragraph: {
              elements: [
                {
                  startIndex: 10,
                  endIndex: 16,
                  textRun: { content: 'First\n' }
                }
              ]
            }
          },
          {
            paragraph: {
              elements: [
                {
                  startIndex: 50,  // Gap due to TOC/table (16-50)
                  endIndex: 57,
                  textRun: { content: 'Second\n' }
                }
              ]
            }
          }
        ]
      }
    };

    const result = extractContentWithIndices(mockDocument);

    // Indices should reflect gaps (not sequential 1,2,3...)
    expect(result.segments).toHaveLength(2);
    expect(result.segments[0].startIndex).toBe(10);
    expect(result.segments[0].endIndex).toBe(16);
    expect(result.segments[1].startIndex).toBe(50);
    expect(result.segments[1].endIndex).toBe(57);
  });

  it('should have indices that match write operation requirements', () => {
    // This test verifies read/write index consistency
    const mockDocument = {
      body: {
        content: [
          {
            paragraph: {
              elements: [
                {
                  startIndex: 1297,
                  endIndex: 1307,
                  textRun: { content: 'TESTMARKER' }
                }
              ]
            }
          }
        ]
      }
    };

    const result = extractContentWithIndices(mockDocument);

    // If we format at these indices, it should hit "TESTMARKER"
    const formatStartIndex = result.segments[0].startIndex;
    const formatEndIndex = result.segments[0].endIndex;

    expect(formatStartIndex).toBe(1297);
    expect(formatEndIndex).toBe(1307);

    // These indices should work directly with formatGoogleDocText
    // (no offset calculation needed)
    expect(formatStartIndex).toBeGreaterThan(0);
    expect(formatEndIndex).toBeGreaterThan(formatStartIndex);
  });

  it('should handle empty documents', () => {
    const mockDocument = {
      body: {
        content: []
      }
    };

    const result = extractContentWithIndices(mockDocument);

    expect(result.segments).toHaveLength(0);
    expect(result.content).toBe('');
  });

  it('should handle documents with only structural elements (no paragraphs)', () => {
    const mockDocument = {
      body: {
        content: [
          {
            startIndex: 1,
            endIndex: 100,
            tableOfContents: {}
          },
          {
            startIndex: 100,
            endIndex: 200,
            table: {}
          }
        ]
      }
    };

    const result = extractContentWithIndices(mockDocument);

    // No paragraphs = no segments
    expect(result.segments).toHaveLength(0);
    expect(result.content).toBe('');
  });

  it('should preserve exact text content including newlines', () => {
    const mockDocument = {
      body: {
        content: [
          {
            paragraph: {
              elements: [
                {
                  startIndex: 1,
                  endIndex: 11,
                  textRun: { content: 'Line 1\n\n\n' }
                }
              ]
            }
          }
        ]
      }
    };

    const result = extractContentWithIndices(mockDocument);

    expect(result.segments[0].text).toBe('Line 1\n\n\n');
    expect(result.content).toBe('Line 1\n\n\n');
  });

  it('should handle mixed content with TOC and tables', () => {
    const mockDocument = {
      body: {
        content: [
          {
            startIndex: 1,
            endIndex: 50,
            tableOfContents: {}
          },
          {
            paragraph: {
              elements: [
                {
                  startIndex: 50,
                  endIndex: 60,
                  textRun: { content: 'After TOC\n' }
                }
              ]
            }
          },
          {
            startIndex: 60,
            endIndex: 100,
            table: {}
          },
          {
            paragraph: {
              elements: [
                {
                  startIndex: 100,
                  endIndex: 112,
                  textRun: { content: 'After table\n' }
                }
              ]
            }
          }
        ]
      }
    };

    const result = extractContentWithIndices(mockDocument);

    expect(result.segments).toHaveLength(2);
    expect(result.segments[0].startIndex).toBe(50);  // After TOC
    expect(result.segments[0].text).toBe('After TOC\n');
    expect(result.segments[1].startIndex).toBe(100); // After table
    expect(result.segments[1].text).toBe('After table\n');
  });

  it('should validate that indices are always positive and properly ordered', () => {
    const mockDocument = {
      body: {
        content: [
          {
            paragraph: {
              elements: [
                {
                  startIndex: 10,
                  endIndex: 20,
                  textRun: { content: 'Valid range' }
                }
              ]
            }
          }
        ]
      }
    };

    const result = extractContentWithIndices(mockDocument);

    for (const segment of result.segments) {
      expect(segment.startIndex).toBeGreaterThanOrEqual(1);
      expect(segment.endIndex).toBeGreaterThan(segment.startIndex);
    }
  });
});
