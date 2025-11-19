#!/usr/bin/env ts-node
/**
 * Create TOC Test Document
 *
 * This script creates a document with headings that you can then manually
 * add a Table of Contents to via the Google Docs UI.
 *
 * Steps:
 * 1. Run this script to create the document
 * 2. Open the URL it prints
 * 3. In Google Docs, click Insert → Table of contents
 * 4. Note the document ID for use in the bug test
 *
 * Run with: npx ts-node scripts/create-toc-test-doc.ts
 */

import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

async function createTestDoc() {
  console.log('=== Creating TOC Test Document ===\n');

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
    console.log('Creating document with headings...');
    const createResponse = await docs.documents.create({
      requestBody: {
        title: 'TOC Bug Test Document',
        body: {
          content: [
            {
              paragraph: {
                elements: [{ textRun: { content: 'Introduction\n' } }],
                paragraphStyle: { namedStyleType: 'HEADING_1' }
              }
            },
            {
              paragraph: {
                elements: [{ textRun: { content: 'This is the introduction section.\n\n' } }]
              }
            },
            {
              paragraph: {
                elements: [{ textRun: { content: 'Background\n' } }],
                paragraphStyle: { namedStyleType: 'HEADING_1' }
              }
            },
            {
              paragraph: {
                elements: [{ textRun: { content: 'Background information goes here.\n\n' } }]
              }
            },
            {
              paragraph: {
                elements: [{ textRun: { content: 'Methodology\n' } }],
                paragraphStyle: { namedStyleType: 'HEADING_1' }
              }
            },
            {
              paragraph: {
                elements: [{ textRun: { content: 'Methodology details.\n\n' } }]
              }
            },
            {
              paragraph: {
                elements: [{ textRun: { content: 'Results\n' } }],
                paragraphStyle: { namedStyleType: 'HEADING_1' }
              }
            },
            {
              paragraph: {
                elements: [{ textRun: { content: 'Results go here.\n\n' } }]
              }
            },
            {
              paragraph: {
                elements: [{ textRun: { content: 'Discussion\n' } }],
                paragraphStyle: { namedStyleType: 'HEADING_1' }
              }
            },
            {
              paragraph: {
                elements: [{ textRun: { content: 'Discussion goes here.\n\n' } }]
              }
            },
            {
              paragraph: {
                elements: [{ textRun: { content: 'Conclusion\n' } }],
                paragraphStyle: { namedStyleType: 'HEADING_1' }
              }
            },
            {
              paragraph: {
                elements: [{ textRun: { content: 'Conclusion goes here.\n\n' } }]
              }
            }
          ]
        }
      }
    });

    const documentId = createResponse.data.documentId!;

    console.log('✓ Document created successfully!\n');
    console.log('='.repeat(60));
    console.log('NEXT STEPS:');
    console.log('='.repeat(60));
    console.log(`\n1. Open this URL:`);
    console.log(`   https://docs.google.com/document/d/${documentId}/edit`);
    console.log(`\n2. Click: Insert → Table of contents → choose a style`);
    console.log(`\n3. Save the document ID for testing:`);
    console.log(`   ${documentId}`);
    console.log(`\n4. Run the bug test:`);
    console.log(`   npx ts-node scripts/test-toc-bug.ts ${documentId}`);
    console.log('\n' + '='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error creating document:', error);
    process.exit(1);
  }
}

createTestDoc().catch(console.error);
