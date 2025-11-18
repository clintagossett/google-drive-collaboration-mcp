#!/usr/bin/env node

/**
 * Automated MCP Tool Testing Script
 *
 * This script connects to the MCP server and tests tools programmatically
 * using the MCP SDK Client.
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

// Test configuration
const TEST_CONFIG = {
  oauthDocument: '1CIeAIWDqN_s1g9b7V2h79VpFjlrPM15VYuZ09zsNM9w',
  publicDocument: '18iVsRPn2L49sJtbgyvE3sakRG3v3mY--s4z5nPkghaI',
  oauthFolder: '1hPToIm_EVEbJIVufHgz3aC_8cL4aeMBq',
  publicFolder: '1dy_gOwhrpgyKv_cGRO44a1AmXo45v4e3',
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  console.log(`\n${colors.cyan}🧪 Testing: ${testName}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

/**
 * Connect to MCP server
 */
async function connectToServer() {
  logInfo('Starting MCP server...');

  const transport = new StdioClientTransport({
    command: 'node',
    args: ['dist/index.js'],
    env: {
      ...process.env,
      GOOGLE_DRIVE_OAUTH_CREDENTIALS: '/Users/clintgossett/Documents/Applied Frameworks/projects/af-product-marketing-claude/projects/google-drive-integration/.credentials/gcp-oauth.keys.json',
    },
  });

  const client = new Client(
    {
      name: 'test-client',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  await client.connect(transport);
  logSuccess('Connected to MCP server');

  return { client, transport };
}

/**
 * Test: List available tools
 */
async function testListTools(client) {
  logTest('List Available Tools');

  try {
    const response = await client.listTools();
    const toolNames = response.tools.map(t => t.name);

    logSuccess(`Found ${toolNames.length} tools`);

    // Check for expected tools
    const expectedTools = [
      'getGoogleDocContent',
      'updateGoogleDoc',
      'createGoogleDoc',
      'listFolder',
      'search',
    ];

    for (const toolName of expectedTools) {
      if (toolNames.includes(toolName)) {
        logSuccess(`  ✓ ${toolName}`);
      } else {
        logError(`  ✗ ${toolName} - NOT FOUND`);
      }
    }

    return true;
  } catch (error) {
    logError(`Failed to list tools: ${error.message}`);
    return false;
  }
}

/**
 * Test: Get document content
 */
async function testGetDocumentContent(client, documentId, documentLabel) {
  logTest(`Get Document Content - ${documentLabel}`);

  try {
    const response = await client.callTool({
      name: 'getGoogleDocContent',
      arguments: {
        documentId: documentId,
      },
    });

    if (response.isError) {
      logError(`Tool returned error: ${response.content[0]?.text || 'Unknown error'}`);
      return false;
    }

    logSuccess('Retrieved document content');

    // Validate response structure
    if (!response.content || !Array.isArray(response.content)) {
      logError('Response missing content array');
      return false;
    }

    if (response.content.length === 0) {
      logError('Response content array is empty');
      return false;
    }

    if (!response.content[0].type) {
      logError('Response content missing type field');
      return false;
    }

    if (!response.content[0].text) {
      logError('Response content missing text field');
      return false;
    }

    logSuccess('Response structure is valid');
    logInfo(`Content preview: ${response.content[0].text.substring(0, 100)}...`);

    return true;
  } catch (error) {
    logError(`Failed to get document content: ${error.message}`);
    return false;
  }
}

/**
 * Test: Update document
 */
async function testUpdateDocument(client, documentId, documentLabel) {
  logTest(`Update Document - ${documentLabel}`);

  const testContent = `Automated Test - ${new Date().toISOString()}\\n\\nThis content was written by the automated test script.`;

  try {
    const response = await client.callTool({
      name: 'updateGoogleDoc',
      arguments: {
        documentId: documentId,
        content: testContent,
      },
    });

    if (response.isError) {
      logError(`Tool returned error: ${response.content[0]?.text || 'Unknown error'}`);
      return false;
    }

    logSuccess('Updated document successfully');
    logInfo(`Response: ${response.content[0].text}`);

    // Verify the update by reading back
    logInfo('Verifying update by reading document...');

    const verifyResponse = await client.callTool({
      name: 'getGoogleDocContent',
      arguments: {
        documentId: documentId,
      },
    });

    if (verifyResponse.isError) {
      logError('Failed to verify update');
      return false;
    }

    const content = verifyResponse.content[0].text;
    if (content.includes(testContent)) {
      logSuccess('Verified: Document contains the updated content');
      return true;
    } else {
      logError('Verification failed: Document does not contain expected content');
      logInfo(`Expected to find: "${testContent}"`);
      logInfo(`Got: "${content.substring(0, 200)}..."`);
      return false;
    }
  } catch (error) {
    logError(`Failed to update document: ${error.message}`);
    return false;
  }
}

/**
 * Test: List folder contents
 */
async function testListFolder(client, folderId, folderLabel) {
  logTest(`List Folder Contents - ${folderLabel}`);

  try {
    const response = await client.callTool({
      name: 'listFolder',
      arguments: {
        folderId: folderId,
      },
    });

    if (response.isError) {
      logError(`Tool returned error: ${response.content[0]?.text || 'Unknown error'}`);
      return false;
    }

    logSuccess('Listed folder contents');
    logInfo(`Response: ${response.content[0].text.substring(0, 200)}...`);

    return true;
  } catch (error) {
    logError(`Failed to list folder: ${error.message}`);
    return false;
  }
}

/**
 * Test: Error handling with invalid document ID
 */
async function testErrorHandling(client) {
  logTest('Error Handling - Invalid Document ID');

  try {
    const response = await client.callTool({
      name: 'getGoogleDocContent',
      arguments: {
        documentId: 'invalid-document-id-12345',
      },
    });

    if (response.isError) {
      logSuccess('Correctly returned error for invalid document ID');
      logInfo(`Error message: ${response.content[0].text}`);
      return true;
    } else {
      logError('Should have returned error but succeeded instead');
      return false;
    }
  } catch (error) {
    logSuccess('Correctly threw error for invalid document ID');
    logInfo(`Error: ${error.message}`);
    return true;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║   Google Drive MCP - Automated Tool Testing Suite     ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝\n', 'cyan');

  let client, transport;
  const results = {
    passed: 0,
    failed: 0,
    total: 0,
  };

  try {
    // Connect to server
    ({ client, transport } = await connectToServer());

    // Run tests
    const tests = [
      { name: 'List Tools', fn: () => testListTools(client) },
      { name: 'Get OAuth Document Content', fn: () => testGetDocumentContent(client, TEST_CONFIG.oauthDocument, 'OAuth') },
      { name: 'Get Public Document Content', fn: () => testGetDocumentContent(client, TEST_CONFIG.publicDocument, 'Public') },
      { name: 'Update OAuth Document', fn: () => testUpdateDocument(client, TEST_CONFIG.oauthDocument, 'OAuth') },
      { name: 'List OAuth Folder', fn: () => testListFolder(client, TEST_CONFIG.oauthFolder, 'OAuth') },
      { name: 'List Public Folder', fn: () => testListFolder(client, TEST_CONFIG.publicFolder, 'Public') },
      { name: 'Error Handling', fn: () => testErrorHandling(client) },
    ];

    for (const test of tests) {
      results.total++;
      const passed = await test.fn();
      if (passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    }

  } catch (error) {
    logError(`\nFatal error: ${error.message}`);
    console.error(error);
  } finally {
    // Cleanup
    if (client) {
      logInfo('\nDisconnecting from server...');
      await client.close();
    }
  }

  // Print summary
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║                    Test Summary                        ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝\n', 'cyan');

  log(`Total Tests:  ${results.total}`, 'blue');
  log(`Passed:       ${results.passed}`, results.passed === results.total ? 'green' : 'yellow');
  log(`Failed:       ${results.failed}`, results.failed === 0 ? 'green' : 'red');

  if (results.failed === 0) {
    log('\n🎉 All tests passed!', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Some tests failed', 'red');
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  logError(`Unhandled error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
