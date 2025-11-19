#!/usr/bin/env ts-node
/**
 * TOC Index Bug Reproduction Script
 *
 * This script reproduces the bug where documents with Table of Contents
 * have an index offset between read and write operations.
 *
 * Run with: npx ts-node scripts/reproduce-toc-bug.ts
 */

import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

async function reproduceTOCBug() {
  console.log('=== TOC Index Bug Reproduction ===\n');

  // Initialize Google APIs
  const credentialsPath = path.join(
    process.env.HOME!,
    'Documents/Applied Frameworks/projects/af-product-marketing-claude/projects/google-drive-integration/.credentials/gcp-oauth.keys.json'
  );
  const tokensPath = path.join(process.env.HOME!, '.config/google-drive-mcp/tokens.json');

  if (!fs.existsSync(credentialsPath)) {
    console.error(`Error: Credentials not found at ${credentialsPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(tokensPath)) {
    console.error(`Error: Tokens not found at ${tokensPath}`);
    process.exit(1);
  }

  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));
  const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));

  const oauth2Client = new google.auth.OAuth2(
    credentials.installed.client_id,
    credentials.installed.client_secret,
    credentials.installed.redirect_uris[0]
  );

  oauth2Client.setCredentials(tokens);

  const docs = google.docs({ version: 'v1', auth: oauth2Client });
  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  let documentId: string | null = null;

  try {
    // Step 1: Create a new document with initial content
    console.log('Step 1: Creating test document with headings...');
    const createResponse = await docs.documents.create({
      requestBody: {
        title: 'TOC Bug Reproduction Test',
        body: {
          content: [
            {
              paragraph: {
                elements: [
                  {
                    textRun: {
                      content: 'Introduction\n',
                      textStyle: {}
                    }
                  }
                ],
                paragraphStyle: {
                  namedStyleType: 'HEADING_1'
                }
              }
            },
            {
              paragraph: {
                elements: [
                  {
                    textRun: {
                      content: 'This is the introduction section.\n\n'
                    }
                  }
                ]
              }
            },
            {
              paragraph: {
                elements: [
                  {
                    textRun: {
                      content: 'Background\n'
                    }
                  }
                ],
                paragraphStyle: {
                  namedStyleType: 'HEADING_1'
                }
              }
            },
            {
              paragraph: {
                elements: [
                  {
                    textRun: {
                      content: 'This is the background section.\n\n'
                    }
                  }
                ]
              }
            },
            {
              paragraph: {
                elements: [
                  {
                    textRun: {
                      content: 'Methodology\n'
                    }
                  }
                ],
                paragraphStyle: {
                  namedStyleType: 'HEADING_1'
                }
              }
            },
            {
              paragraph: {
                elements: [
                  {
                    textRun: {
                      content: 'This is the methodology section.\n\n'
                    }
                  }
                ]
              }
            },
            {
              paragraph: {
                elements: [
                  {
                    textRun: {
                      content: 'Results\n'
                    }
                  }
                ],
                paragraphStyle: {
                  namedStyleType: 'HEADING_1'
                }
              }
            },
            {
              paragraph: {
                elements: [
                  {
                    textRun: {
                      content: 'This is the results section.\n\n'
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    });

    documentId = createResponse.data.documentId!;
    console.log(`✓ Created document: ${documentId}\n`);

    // Step 2: Insert Table of Contents at the beginning
    console.log('Step 2: Inserting Table of Contents...');
    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [{ insertTableOfContents: { location: { index: 1 } } }]
      }
    });
    console.log('✓ Inserted TOC\n');

    // Step 3: Find where TOC ends
    console.log('Step 3: Finding TOC boundaries...');
    const docAfterTOC = await docs.documents.get({ documentId });

    let tocStartIndex = 0;
    let tocEndIndex = 1;
    if (docAfterTOC.data.body?.content) {
      for (const element of docAfterTOC.data.body.content) {
        if (element.tableOfContents) {
          tocStartIndex = element.startIndex || 0;
          tocEndIndex = element.endIndex || 1;
          console.log(`✓ TOC spans indices: ${tocStartIndex} - ${tocEndIndex}`);
          console.log(`  TOC size: ${tocEndIndex - tocStartIndex} characters\n`);
          break;
        }
      }
    }

    // Step 4: Insert TESTMARKER after the TOC
    console.log('Step 4: Inserting TESTMARKER...');
    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [{
          insertText: {
            location: { index: tocEndIndex },
            text: 'TESTMARKER\n\n'
          }
        }]
      }
    });
    console.log(`✓ Inserted TESTMARKER at index: ${tocEndIndex}\n`);

    // Step 5: Read with BUGGY logic (manual index counting)
    console.log('Step 5: Reading document with BUGGY logic (manual counting)...');
    const document = await docs.documents.get({ documentId });

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
                startIndex: currentIndex,
                endIndex: currentIndex + text.length
              });
              content += text;
              currentIndex += text.length;
            }
          }
        }
      }
    }

    const testMarkerSegment = segments.find(s => s.text.includes('TESTMARKER'));
    if (!testMarkerSegment) {
      console.error('Error: TESTMARKER not found in buggy read results!');
      process.exit(1);
    }

    const buggyStartIndex = testMarkerSegment.startIndex;
    const buggyEndIndex = testMarkerSegment.endIndex;

    console.log(`BUGGY READ: TESTMARKER at indices ${buggyStartIndex} - ${buggyEndIndex}\n`);

    // Step 6: Get ACTUAL indices from API
    console.log('Step 6: Getting ACTUAL indices from API...');
    let actualStartIndex = 0;
    let actualEndIndex = 0;

    if (document.data.body?.content) {
      for (const element of document.data.body.content) {
        if (element.paragraph?.elements) {
          for (const textElement of element.paragraph.elements) {
            if (textElement.textRun?.content?.includes('TESTMARKER')) {
              actualStartIndex = textElement.startIndex || 0;
              actualEndIndex = textElement.endIndex || 0;
              break;
            }
          }
        }
      }
    }

    console.log(`ACTUAL API: TESTMARKER at indices ${actualStartIndex} - ${actualEndIndex}\n`);

    // Step 7: Calculate offset
    const offset = actualStartIndex - buggyStartIndex;
    console.log(`\n${'='.repeat(60)}`);
    console.log('BUG DETECTED!');
    console.log(`${'='.repeat(60)}`);
    console.log(`TOC size:           ${tocEndIndex - tocStartIndex} characters`);
    console.log(`Buggy read indices: ${buggyStartIndex} - ${buggyEndIndex}`);
    console.log(`Actual API indices: ${actualStartIndex} - ${actualEndIndex}`);
    console.log(`INDEX OFFSET:       ${offset} characters`);
    console.log(`${'='.repeat(60)}\n`);

    // Step 8: Demonstrate the bug visually
    console.log('Step 8: Demonstrating bug with color formatting...');

    // Format at buggy indices (will hit WRONG location)
    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [{
          updateTextStyle: {
            range: { startIndex: buggyStartIndex, endIndex: buggyEndIndex },
            textStyle: { foregroundColor: { color: { rgbColor: { red: 1, green: 0, blue: 0 } } } },
            fields: 'foregroundColor'
          }
        }]
      }
    });
    console.log(`✓ Applied RED formatting at buggy indices (${buggyStartIndex}-${buggyEndIndex})`);

    // Format at correct indices (will hit RIGHT location)
    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [{
          updateTextStyle: {
            range: { startIndex: actualStartIndex, endIndex: actualEndIndex },
            textStyle: { foregroundColor: { color: { rgbColor: { red: 0, green: 1, blue: 0 } } } },
            fields: 'foregroundColor'
          }
        }]
      }
    });
    console.log(`✓ Applied GREEN formatting at correct indices (${actualStartIndex}-${actualEndIndex})\n`);

    // Final summary
    console.log(`\n${'='.repeat(60)}`);
    console.log('REPRODUCTION COMPLETE');
    console.log(`${'='.repeat(60)}`);
    console.log(`\nDocument created: ${documentId}`);
    console.log(`Document URL: https://docs.google.com/document/d/${documentId}/edit`);
    console.log(`\nOpen the document to see:`);
    console.log(`  🔴 RED text   = where buggy indices point (WRONG - probably in TOC)`);
    console.log(`  🟢 GREEN text = where TESTMARKER actually is (CORRECT)`);
    console.log(`\nThe ${offset}-character offset is the TOC bug!`);
    console.log(`\nDocument will NOT be deleted automatically - inspect it manually.`);
    console.log(`To delete: npx ts-node scripts/delete-doc.ts ${documentId}`);
    console.log(`${'='.repeat(60)}\n`);

  } catch (error) {
    console.error('\n❌ Error during reproduction:', error);
    if (documentId) {
      console.log(`\nDocument created: ${documentId}`);
      console.log(`Clean up with: npx ts-node scripts/delete-doc.ts ${documentId}`);
    }
    process.exit(1);
  }
}

// Run the reproduction
reproduceTOCBug().catch(console.error);
