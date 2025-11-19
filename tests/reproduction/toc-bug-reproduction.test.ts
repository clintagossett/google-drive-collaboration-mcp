import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

/**
 * TOC Index Bug Reproduction Test
 *
 * This test reproduces the bug where documents with Table of Contents
 * have a ~1235 character index offset between read and write operations.
 *
 * Steps:
 * 1. Create a document with headings
 * 2. Insert a Table of Contents
 * 3. Add a test marker ("TESTMARKER")
 * 4. Read the document using getGoogleDocContent logic
 * 5. Try to format "TESTMARKER" using the read indices
 * 6. Verify: formatting hits WRONG location (the bug)
 *
 * Expected Result (with bug):
 * - Read operation returns "TESTMARKER" at index ~50
 * - Write operation at index 50 hits TOC content (wrong!)
 * - Actual location of "TESTMARKER" is at index ~1200+
 *
 * Expected Result (after fix):
 * - Read operation returns "TESTMARKER" at index ~1200+
 * - Write operation at index ~1200+ hits "TESTMARKER" (correct!)
 */

describe('TOC Index Bug Reproduction', () => {
  let documentId: string | null = null;
  let docs: any;
  let drive: any;

  beforeAll(async () => {
    // Initialize Google APIs
    const credentialsPath = path.join(
      process.env.HOME!,
      'Documents/Applied Frameworks/projects/af-product-marketing-claude/projects/google-drive-integration/.credentials/gcp-oauth.keys.json'
    );
    const tokensPath = path.join(process.env.HOME!, '.config/google-drive-mcp/tokens.json');

    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));
    const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));

    const oauth2Client = new google.auth.OAuth2(
      credentials.web.client_id,
      credentials.web.client_secret,
      credentials.web.redirect_uris[0]
    );

    oauth2Client.setCredentials(tokens);

    docs = google.docs({ version: 'v1', auth: oauth2Client });
    drive = google.drive({ version: 'v3', auth: oauth2Client });
  });

  afterAll(async () => {
    // Clean up: delete test document
    if (documentId && drive) {
      try {
        await drive.files.delete({ fileId: documentId });
        console.log(`Deleted test document: ${documentId}`);
      } catch (error) {
        console.error('Failed to delete test document:', error);
      }
    }
  });

  it('should reproduce the TOC index offset bug', async () => {
    // Step 1: Create a new document
    const createResponse = await docs.documents.create({
      requestBody: {
        title: 'TOC Bug Reproduction Test'
      }
    });

    documentId = createResponse.data.documentId!;
    console.log(`Created test document: ${documentId}`);

    // Step 2: Insert content with multiple headings
    // We'll create content that will generate a TOC with multiple entries
    const insertRequests = [
      // Insert heading 1
      {
        insertText: {
          location: { index: 1 },
          text: 'Introduction\n'
        }
      },
      {
        updateParagraphStyle: {
          range: { startIndex: 1, endIndex: 14 },
          paragraphStyle: { namedStyleType: 'HEADING_1' },
          fields: 'namedStyleType'
        }
      },
      // Insert some content under heading 1
      {
        insertText: {
          location: { index: 14 },
          text: 'This is the introduction section.\n\n'
        }
      },
      // Insert heading 2
      {
        insertText: {
          location: { index: 48 },
          text: 'Background\n'
        }
      },
      {
        updateParagraphStyle: {
          range: { startIndex: 48, endIndex: 60 },
          paragraphStyle: { namedStyleType: 'HEADING_1' },
          fields: 'namedStyleType'
        }
      },
      // Insert content under heading 2
      {
        insertText: {
          location: { index: 60 },
          text: 'This is the background section.\n\n'
        }
      },
      // Insert heading 3
      {
        insertText: {
          location: { index: 93 },
          text: 'Methodology\n'
        }
      },
      {
        updateParagraphStyle: {
          range: { startIndex: 93, endIndex: 106 },
          paragraphStyle: { namedStyleType: 'HEADING_1' },
          fields: 'namedStyleType'
        }
      },
      // Insert content under heading 3
      {
        insertText: {
          location: { index: 106 },
          text: 'This is the methodology section.\n\n'
        }
      },
      // Insert heading 4
      {
        insertText: {
          location: { index: 140 },
          text: 'Results\n'
        }
      },
      {
        updateParagraphStyle: {
          range: { startIndex: 140, endIndex: 149 },
          paragraphStyle: { namedStyleType: 'HEADING_1' },
          fields: 'namedStyleType'
        }
      },
      // Insert content under heading 4
      {
        insertText: {
          location: { index: 149 },
          text: 'This is the results section.\n\n'
        }
      },
      // Insert heading 5
      {
        insertText: {
          location: { index: 179 },
          text: 'Discussion\n'
        }
      },
      {
        updateParagraphStyle: {
          range: { startIndex: 179, endIndex: 191 },
          paragraphStyle: { namedStyleType: 'HEADING_1' },
          fields: 'namedStyleType'
        }
      },
      // Insert content under heading 5
      {
        insertText: {
          location: { index: 191 },
          text: 'This is the discussion section.\n\n'
        }
      },
      // Insert heading 6
      {
        insertText: {
          location: { index: 224 },
          text: 'Conclusion\n'
        }
      },
      {
        updateParagraphStyle: {
          range: { startIndex: 224, endIndex: 236 },
          paragraphStyle: { namedStyleType: 'HEADING_1' },
          fields: 'namedStyleType'
        }
      },
      // Insert content under heading 6
      {
        insertText: {
          location: { index: 236 },
          text: 'This is the conclusion section.\n\n'
        }
      }
    ];

    await docs.documents.batchUpdate({
      documentId,
      requestBody: { requests: insertRequests }
    });

    console.log('Inserted headings and content');

    // Step 3: Insert Table of Contents at the beginning
    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            insertTableOfContents: {
              location: { index: 1 }
            }
          }
        ]
      }
    });

    console.log('Inserted Table of Contents');

    // Step 4: Insert a test marker AFTER the TOC
    // We need to get the document to see where the TOC ends
    const docAfterTOC = await docs.documents.get({ documentId });

    // Find the end of the TOC
    let tocEndIndex = 1;
    if (docAfterTOC.data.body?.content) {
      for (const element of docAfterTOC.data.body.content) {
        if (element.tableOfContents) {
          tocEndIndex = element.endIndex || 1;
          console.log(`TOC ends at index: ${tocEndIndex}`);
          break;
        }
      }
    }

    // Insert TESTMARKER after the TOC
    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: { index: tocEndIndex },
              text: 'TESTMARKER\n\n'
            }
          }
        ]
      }
    });

    console.log(`Inserted TESTMARKER at index: ${tocEndIndex}`);

    // Step 5: Read the document using getGoogleDocContent logic (BUGGY VERSION)
    const document = await docs.documents.get({ documentId });

    // Simulate the BUGGY getGoogleDocContent logic (manual index counting)
    let currentIndex = 1;
    let content = '';
    const segments: Array<{text: string, startIndex: number, endIndex: number}> = [];

    if (document.data.body?.content) {
      for (const element of document.data.body.content) {
        // BUGGY: Only processes paragraphs, skips TOC
        if (element.paragraph?.elements) {
          for (const textElement of element.paragraph.elements) {
            if (textElement.textRun?.content) {
              const text = textElement.textRun.content;
              segments.push({
                text,
                startIndex: currentIndex,  // BUGGY: manual counting
                endIndex: currentIndex + text.length
              });
              content += text;
              currentIndex += text.length;  // BUGGY: manual increment
            }
          }
        }
      }
    }

    // Find TESTMARKER in the buggy read results
    const testMarkerSegment = segments.find(s => s.text.includes('TESTMARKER'));
    expect(testMarkerSegment).toBeDefined();

    const buggyReadStartIndex = testMarkerSegment!.startIndex;
    const buggyReadEndIndex = testMarkerSegment!.endIndex;

    console.log(`\nBUGGY READ RESULTS:`);
    console.log(`TESTMARKER found at indices: ${buggyReadStartIndex}-${buggyReadEndIndex}`);

    // Step 6: Get the ACTUAL indices from the API (CORRECT)
    let actualStartIndex = 0;
    let actualEndIndex = 0;

    if (document.data.body?.content) {
      for (const element of document.data.body.content) {
        if (element.paragraph?.elements) {
          for (const textElement of element.paragraph.elements) {
            if (textElement.textRun?.content?.includes('TESTMARKER')) {
              actualStartIndex = textElement.startIndex || 0;
              actualEndIndex = textElement.endIndex || 0;
              console.log(`\nACTUAL API INDICES:`);
              console.log(`TESTMARKER actually at indices: ${actualStartIndex}-${actualEndIndex}`);
              break;
            }
          }
        }
      }
    }

    // Step 7: Calculate the offset (THE BUG)
    const offset = actualStartIndex - buggyReadStartIndex;
    console.log(`\nINDEX OFFSET (THE BUG): ${offset} characters`);

    // Step 8: Try to format using buggy indices
    // This will hit the WRONG location (in the TOC)
    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            updateTextStyle: {
              range: {
                startIndex: buggyReadStartIndex,
                endIndex: buggyReadEndIndex
              },
              textStyle: {
                foregroundColor: {
                  color: {
                    rgbColor: { red: 1, green: 0, blue: 0 }  // Red
                  }
                }
              },
              fields: 'foregroundColor'
            }
          }
        ]
      }
    });

    console.log(`\nFormatted at buggy indices ${buggyReadStartIndex}-${buggyReadEndIndex} (should hit WRONG location)`);

    // Step 9: Try to format using correct indices
    // This will hit the RIGHT location
    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            updateTextStyle: {
              range: {
                startIndex: actualStartIndex,
                endIndex: actualEndIndex
              },
              textStyle: {
                foregroundColor: {
                  color: {
                    rgbColor: { red: 0, green: 1, blue: 0 }  // Green
                  }
                }
              },
              fields: 'foregroundColor'
            }
          }
        ]
      }
    });

    console.log(`Formatted at correct indices ${actualStartIndex}-${actualEndIndex} (should hit TESTMARKER)`);

    // Step 10: Verify the bug
    console.log(`\n=== BUG REPRODUCED ===`);
    console.log(`TOC size: ~${tocEndIndex} characters`);
    console.log(`Read operation (buggy): TESTMARKER at ${buggyReadStartIndex}-${buggyReadEndIndex}`);
    console.log(`Write operation (API): TESTMARKER actually at ${actualStartIndex}-${actualEndIndex}`);
    console.log(`Offset: ${offset} characters`);
    console.log(`\nManually inspect document ${documentId}:`);
    console.log(`- Red text = where buggy read indices point (WRONG - probably in TOC)`);
    console.log(`- Green text = where TESTMARKER actually is (CORRECT)`);
    console.log(`\nDocument URL: https://docs.google.com/document/d/${documentId}/edit`);

    // Assertions to verify the bug
    expect(offset).toBeGreaterThan(0); // There should be an offset
    expect(offset).toBeGreaterThan(100); // Offset should be significant (TOC size)
    expect(buggyReadStartIndex).toBeLessThan(actualStartIndex); // Buggy index is lower
    expect(actualStartIndex).toBeGreaterThan(tocEndIndex); // TESTMARKER is after TOC

    // The document will remain for manual inspection
    // Check the URL printed above to see:
    // - Red formatting in TOC (wrong location, from buggy indices)
    // - Green formatting on TESTMARKER (correct location, from API indices)
  }, 60000); // 60 second timeout for API calls
});
