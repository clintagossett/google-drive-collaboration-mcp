# Service Account Implementation Plan

## Current State
The Google Drive MCP server only supports **OAuth 2.0 user authentication** (browser-based flow). Service account authentication is needed for:
- GitHub Actions CI/CD testing
- Automated deployments
- Headless environments (no browser)

## What's Already Available
✅ `google-auth-library@^9.15.0` - Already installed, supports service accounts via JWT
✅ `googleapis@^144.0.0` - Works with both OAuth2Client and JWT auth

## Implementation Required

### 1. Add Service Account Authentication Support

Create a new auth module for service accounts:

**File: `src/auth/serviceAccount.ts`**

```typescript
import { JWT } from 'google-auth-library';
import * as fs from 'fs/promises';

const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/presentations'
];

export interface ServiceAccountCredentials {
  type: 'service_account';
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

/**
 * Load service account credentials from file or environment
 */
async function loadServiceAccountCredentials(): Promise<ServiceAccountCredentials> {
  // Try environment variable first (for CI/CD)
  const envKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (envKey) {
    try {
      return JSON.parse(envKey);
    } catch (error) {
      throw new Error('Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY environment variable as JSON');
    }
  }

  // Try file path from environment
  const keyFilePath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
  if (keyFilePath) {
    try {
      const content = await fs.readFile(keyFilePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to load service account key from ${keyFilePath}: ${error}`);
    }
  }

  // Try default location
  const defaultPath = '.credentials/service-account.json';
  try {
    const content = await fs.readFile(defaultPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(
      'No service account credentials found. Set GOOGLE_SERVICE_ACCOUNT_KEY or ' +
      'GOOGLE_SERVICE_ACCOUNT_KEY_PATH environment variable, or place credentials at ' +
      '.credentials/service-account.json'
    );
  }
}

/**
 * Initialize JWT client with service account credentials
 */
export async function initializeServiceAccountClient(): Promise<JWT> {
  const credentials = await loadServiceAccountCredentials();

  const jwtClient = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: SCOPES,
  });

  // Authorize immediately
  await jwtClient.authorize();

  console.error('✅ Service account authentication successful');
  console.error(`   Account: ${credentials.client_email}`);
  console.error(`   Project: ${credentials.project_id}`);

  return jwtClient;
}

/**
 * Check if service account credentials are available
 */
export function hasServiceAccountCredentials(): boolean {
  return !!(
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY ||
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH
  );
}
```

### 2. Update Main Auth Module

Modify `src/auth.ts` to support both auth methods:

```typescript
// Main authentication module that re-exports and orchestrates the modular components
import { OAuth2Client } from 'google-auth-library';
import { JWT } from 'google-auth-library';
import { initializeOAuth2Client } from './auth/client.js';
import { AuthServer } from './auth/server.js';
import { TokenManager } from './auth/tokenManager.js';
import { initializeServiceAccountClient, hasServiceAccountCredentials } from './auth/serviceAccount.js';

export { TokenManager } from './auth/tokenManager.js';
export { initializeOAuth2Client } from './auth/client.js';
export { AuthServer } from './auth/server.js';
export { initializeServiceAccountClient, hasServiceAccountCredentials } from './auth/serviceAccount.js';

export type AuthClient = OAuth2Client | JWT;

/**
 * Authenticate and return auth client (OAuth2 or Service Account)
 * This is the main entry point for authentication in the MCP server
 */
export async function authenticate(): Promise<AuthClient> {
  console.error('Initializing authentication...');

  // Check if service account credentials are available
  if (hasServiceAccountCredentials()) {
    console.error('🔧 Service account credentials detected, using service account auth');
    return await initializeServiceAccountClient();
  }

  console.error('🔐 Using OAuth 2.0 user authentication');

  // Initialize OAuth2 client
  const oauth2Client = await initializeOAuth2Client();
  const tokenManager = new TokenManager(oauth2Client);

  // Try to validate existing tokens
  if (await tokenManager.validateTokens()) {
    console.error('Authentication successful - using existing tokens');
    console.error('OAuth2Client credentials:', {
      hasAccessToken: !!oauth2Client.credentials?.access_token,
      hasRefreshToken: !!oauth2Client.credentials?.refresh_token,
      expiryDate: oauth2Client.credentials?.expiry_date
    });
    return oauth2Client;
  }

  // No valid tokens, need to authenticate
  console.error('\n🔐 No valid authentication tokens found.');
  console.error('Starting authentication flow...\n');

  const authServer = new AuthServer(oauth2Client);
  const authSuccess = await authServer.start(true);

  if (!authSuccess) {
    throw new Error('Authentication failed. Please check your credentials and try again.');
  }

  // Wait for authentication to complete
  await new Promise<void>((resolve) => {
    const checkInterval = setInterval(async () => {
      if (authServer.authCompletedSuccessfully) {
        clearInterval(checkInterval);
        await authServer.stop();
        resolve();
      }
    }, 1000);
  });

  return oauth2Client;
}

// ... rest of existing runAuthCommand function
```

### 3. Update Main Server

Update `src/index.ts` to use the new `AuthClient` type:

```typescript
import { authenticate, AuthClient } from './auth.js';

// Change from:
let authClient: any;

// To:
let authClient: AuthClient | null = null;

// Rest of the code remains the same - both OAuth2Client and JWT
// work with googleapis because they both implement the auth interface
```

### 4. Environment Variables

Add support for these environment variables:

```bash
# Option 1: Inline JSON (for GitHub Actions secrets)
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...","private_key":"..."}'

# Option 2: File path
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/path/to/service-account.json

# Existing OAuth variables (unchanged)
GOOGLE_DRIVE_OAUTH_CREDENTIALS=/path/to/gcp-oauth.keys.json
GOOGLE_DRIVE_MCP_TOKEN_PATH=/path/to/tokens.json
```

### 5. Update Documentation

Update `README.md` to document service account setup:

```markdown
## Authentication Methods

### Method 1: OAuth 2.0 (User Authentication) - For Local Use

Best for local development and personal use.

1. Create OAuth credentials in Google Cloud Console
2. Download and save as `gcp-oauth.keys.json`
3. Run `npm run auth` to authenticate
4. Tokens stored in `~/.config/google-drive-mcp/tokens.json`

### Method 2: Service Account - For CI/CD and Automation

Best for GitHub Actions, automated testing, headless environments.

1. Create a service account in Google Cloud Console
2. Grant it access to Google Drive API
3. Download the JSON key file
4. Set environment variable:
   ```bash
   export GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/path/to/service-account.json
   # OR
   export GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
   ```
5. Server automatically detects and uses service account auth

**Note**: Service accounts have their own isolated Google Drive. To access your
personal files, you must explicitly share them with the service account email.
```

### 6. Testing Setup

Create test-specific service account authentication:

**File: `tests/integration/setup/service-account-auth.ts`**

```typescript
import { authenticate } from '../../../src/auth.js';

/**
 * Get authenticated client for integration tests
 * Uses service account if available, falls back to OAuth
 */
export async function getTestAuthClient() {
  // In CI/CD, GOOGLE_SERVICE_ACCOUNT_KEY will be set
  // Locally, will use OAuth tokens
  return await authenticate();
}
```

### 7. GitHub Actions Setup

Add service account credentials to GitHub Secrets:

**.github/workflows/test.yml**

```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  integration-tests:
    runs-on: ubuntu-latest
    env:
      # Service account key stored as GitHub Secret
      GOOGLE_SERVICE_ACCOUNT_KEY: ${{ secrets.GOOGLE_SERVICE_ACCOUNT_KEY }}

      # Test file IDs (these should exist in the service account's Drive)
      TEST_DOCUMENT_ID: ${{ secrets.TEST_DOCUMENT_ID }}
      TEST_SPREADSHEET_ID: ${{ secrets.TEST_SPREADSHEET_ID }}
      TEST_PRESENTATION_ID: ${{ secrets.TEST_PRESENTATION_ID }}

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run test:integration
```

## Implementation Checklist

- [ ] Create `src/auth/serviceAccount.ts` with JWT authentication
- [ ] Update `src/auth.ts` to support both auth methods
- [ ] Update `src/index.ts` to use `AuthClient` type
- [ ] Add environment variable documentation
- [ ] Update README.md with service account setup instructions
- [ ] Create test utilities for service account auth
- [ ] Set up GitHub Actions with service account secrets
- [ ] Create test documents in service account's Drive
- [ ] Test locally with service account
- [ ] Test in GitHub Actions

## Benefits After Implementation

✅ **CI/CD Ready** - Fully automated testing in GitHub Actions
✅ **No Browser Required** - Headless authentication for automation
✅ **Isolated Testing** - Service account has separate Drive from personal
✅ **Secure** - Credentials stored in GitHub Secrets
✅ **Backward Compatible** - OAuth 2.0 still works for local development
✅ **Flexible** - Auto-detects which auth method to use

## Security Considerations

1. **Never commit service account keys** - Add to `.gitignore`
2. **Use GitHub Secrets** - Store credentials securely in repository settings
3. **Rotate keys periodically** - Create new service account keys every 90 days
4. **Least privilege** - Only grant necessary API scopes
5. **Monitor usage** - Review service account activity in GCP Console

## Estimated Implementation Time

- Core implementation: ~2 hours
- Testing and validation: ~1 hour
- Documentation: ~30 minutes
- **Total: ~3.5 hours**

## Alternative: Quick Hack for Testing Only

If you only need service account auth for testing and not production, you can create a simpler version:

**File: `tests/helpers/service-account-only.ts`**

```typescript
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

export async function getServiceAccountAuth(): Promise<JWT> {
  const key = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!);

  const jwtClient = new JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/documents',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/presentations',
    ],
  });

  await jwtClient.authorize();
  return jwtClient;
}
```

This works for tests but doesn't integrate with the main server.

## Recommendation

**Implement the full solution** - It's not much more work than the hack, and you get:
- Proper integration with the server
- Flexibility for both local dev and CI/CD
- Better architecture for future features
- Production-ready service account support
