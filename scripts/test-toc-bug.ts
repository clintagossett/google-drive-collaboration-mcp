#!/usr/bin/env ts-node
/**
 * Test TOC Index Bug
 *
 * This script tests an existing document that has a Table of Contents
 * to demonstrate the index offset bug.
 *
 * Usage: npx ts-node scripts/test-toc-bug.ts <documentId>
 *
 * Or use the known bug document:
 * npx ts-node scripts/test-toc-bug.ts 130QyNt_6z8TJNp04gBqDciiI8MNTf4E7oW0U3S-IB_0
 */

import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

async function testTOCBug(documentId: string) {
  console.log('=== TOC Index Bug Test ===\n');
  console.log(`Testing document: ${documentId}\n`);

  const credentialsPath = path.join(
    process.env.HOME!,
    'Documents/Applied Frameworks/projects/af-product-marketing-claude/projects/google-drive-integration/.credentials/gcp-oauth.keys.json'
  );
  const tokensPath = path.join(process.env.HOME!, '.config/google-drive-mcp/tokens.json');

  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));
  const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));

  const oauth2Client = new google.auth.OAuth2(
    credentials.installed.client_id,
    credentials.installed.client_secret,
    credentials.installed.redirect_uris[0]
  );

  oauth2Client.setCredentials(tokens);
  const docs = google.docs({ version: 'v1', auth: oauth2Client });

  try {
    // Step 1: Get the document
    console.log('Step 1: Reading document...');
    const document = await docs.documents.get({ documentId });
    console.log(`✓ Retrieved document: "${document.data.title}"\n`);

    // Step 2: Check for TOC
    console.log('Step 2: Checking for Table of Contents...');
    let hasTOC = false;
    let tocStartIndex = 0;
    let tocEndIndex = 0;

    if (document.data.body?.content) {
      for (const element of document.data.body.content) {
        if (element.tableOfContents) {
          hasTOC = true;
          tocStartIndex = element.startIndex || 0;
          tocEndIndex = element.endIndex || 0;
          console.log(`✓ Found TOC at indices: ${tocStartIndex} - ${tocEndIndex}`);
          console.log(`  TOC size: ${tocEndIndex - tocStartIndex} characters\n`);
          break;
        }
      }
    }

    if (!hasTOC) {
      console.error('❌ No Table of Contents found in this document!');
      console.error('Please use a document with a TOC, or create one with:');
      console.error('  npx ts-node scripts/create-toc-test-doc.ts');
      process.exit(1);
    }

    // Step 3: Read with BUGGY logic (current getGoogleDocContent implementation)
    console.log('Step 3: Reading with BUGGY logic (manual index counting)...');
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

    console.log(`✓ Read ${segments.length} text segments using buggy logic\n`);

    // Step 4: Insert a TESTMARKER if it doesn't exist
    console.log('Step 4: Looking for TESTMARKER...');
    let testMarkerSegment = segments.find(s => s.text.includes('TESTMARKER'));

    if (!testMarkerSegment) {
      console.log('TESTMARKER not found, inserting it after TOC...');
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
      console.log('✓ Inserted TESTMARKER, re-reading document...\n');

      // Re-read the document
      const updatedDoc = await docs.documents.get({ documentId });

      currentIndex = 1;
      content = '';
      segments.length = 0;

      if (updatedDoc.data.body?.content) {
        for (const element of updatedDoc.data.body.content) {
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

      testMarkerSegment = segments.find(s => s.text.includes('TESTMARKER'));
    } else {
      console.log('✓ Found existing TESTMARKER\n');
    }

    if (!testMarkerSegment) {
      console.error('❌ Failed to find or insert TESTMARKER!');
      process.exit(1);
    }

    const buggyStartIndex = testMarkerSegment.startIndex;
    const buggyEndIndex = testMarkerSegment.endIndex;

    console.log(`BUGGY READ: TESTMARKER at indices ${buggyStartIndex} - ${buggyEndIndex}\n`);

    // Step 5: Get ACTUAL indices from API
    console.log('Step 5: Getting ACTUAL indices from API...');
    const finalDoc = await docs.documents.get({ documentId });
    let actualStartIndex = 0;
    let actualEndIndex = 0;

    if (finalDoc.data.body?.content) {
      for (const element of finalDoc.data.body.content) {
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

    // Step 6: Calculate and display the offset
    const offset = actualStartIndex - buggyStartIndex;

    console.log('='.repeat(60));
    console.log('BUG DEMONSTRATION');
    console.log('='.repeat(60));
    console.log(`TOC size:           ${tocEndIndex - tocStartIndex} characters`);
    console.log(`Buggy read indices: ${buggyStartIndex} - ${buggyEndIndex}`);
    console.log(`Actual API indices: ${actualStartIndex} - ${actualEndIndex}`);
    console.log(`INDEX OFFSET:       ${offset} characters`);
    console.log('='.repeat(60) + '\n');

    if (offset > 0) {
      console.log('✓ BUG CONFIRMED! There is an index offset.\n');

      // Step 7: Demonstrate visually
      console.log('Step 7: Demonstrating bug visually...');

      // Format at buggy indices (will hit WRONG location)
      console.log(`Formatting at BUGGY indices (${buggyStartIndex}-${buggyEndIndex}) → RED`);
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

      // Format at correct indices (will hit RIGHT location)
      console.log(`Formatting at CORRECT indices (${actualStartIndex}-${actualEndIndex}) → GREEN`);
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

      console.log('\n' + '='.repeat(60));
      console.log('OPEN THE DOCUMENT TO SEE THE BUG:');
      console.log('='.repeat(60));
      console.log(`\nDocument URL: https://docs.google.com/document/d/${documentId}/edit`);
      console.log(`\n🔴 RED text   = where buggy indices point (WRONG - likely in TOC)`);
      console.log(`🟢 GREEN text = where TESTMARKER actually is (CORRECT)`);
      console.log(`\nThe ${offset}-character offset proves the bug exists!`);
      console.log('=' + '='.repeat(60) + '\n');
    } else {
      console.log('✗ No offset detected - this document may not exhibit the bug.\n');
    }

  } catch (error) {
    console.error('\n❌ Error during test:', error);
    process.exit(1);
  }
}

const docId = process.argv[2];
if (!docId) {
  console.error('Usage: npx ts-node scripts/test-toc-bug.ts <documentId>');
  console.error('\nKnown bug document:');
  console.error('  npx ts-node scripts/test-toc-bug.ts 130QyNt_6z8TJNp04gBqDciiI8MNTf4E7oW0U3S-IB_0');
  process.exit(1);
}

testTOCBug(docId).catch(console.error);
