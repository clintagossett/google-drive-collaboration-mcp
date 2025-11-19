#!/usr/bin/env ts-node
/**
 * Delete a Google Doc by ID
 *
 * Usage: npx ts-node scripts/delete-doc.ts <documentId>
 */

import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

async function deleteDocument(documentId: string) {
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
  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  try {
    await drive.files.delete({ fileId: documentId });
    console.log(`✓ Deleted document: ${documentId}`);
  } catch (error) {
    console.error(`✗ Failed to delete document: ${error}`);
    process.exit(1);
  }
}

const docId = process.argv[2];
if (!docId) {
  console.error('Usage: npx ts-node scripts/delete-doc.ts <documentId>');
  process.exit(1);
}

deleteDocument(docId).catch(console.error);
