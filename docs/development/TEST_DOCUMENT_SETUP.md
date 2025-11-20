# Test Document Setup Guide

## Overview

This project uses **two test documents** to support different authentication scenarios:

1. **OAuth-Protected Document** - For local development with user credentials
2. **Public/Service Account Document** - For CI/CD and automated testing

---

## 1. OAuth-Protected Test Document

### Current Setup
- **Document ID**: `1CIeAIWDqN_s1g9b7V2h79VpFjlrPM15VYuZ09zsNM9w`
- **Folder ID**: `1hPToIm_EVEbJIVufHgz3aC_8cL4aeMBq`
- **Access**: Private to your Google account
- **Authentication**: OAuth 2.0 user tokens

### Purpose
- Local development testing
- Manual testing with MCP Inspector
- User-specific operations testing
- Testing with real user permissions

### How to Use
```bash
# Already configured in .env.test
TEST_DOCUMENT_ID_OAUTH=1CIeAIWDqN_s1g9b7V2h79VpFjlrPM15VYuZ09zsNM9w
TEST_FOLDER_ID_OAUTH=1hPToIm_EVEbJIVufHgz3aC_8cL4aeMBq

# Run tests locally
npm run test:integration
```

### Maintenance
- Keep this document private
- Reset content between test runs if needed
- Can be modified/deleted safely (it's just for testing)

---

## 2. Public/Service Account Test Document

### Current Setup
- **Document ID**: `18iVsRPn2L49sJtbgyvE3sakRG3v3mY--s4z5nPkghaI`
- **Folder ID**: `1dy_gOwhrpgyKv_cGRO44a1AmXo45v4e3`
- **Access**: Public or shared with service account email
- **Authentication**: Service account OR public access

### Setup Complete ✅

The public test document has been created and configured.

#### Option A: Public Document (Simplest)

1. **Create a new Google Doc**
   ```
   Title: "Google Drive MCP - Public Test Document"
   ```

2. **Make it publicly editable**
   - Click "Share" button
   - Change to "Anyone with the link"
   - Set permission to "Editor" (so tests can write)
   - Copy the document ID from the URL

3. **Update documentation**
   - Document ID format: `https://docs.google.com/document/d/DOCUMENT_ID_HERE/edit`
   - Add to `.env.test`:
     ```bash
     TEST_DOCUMENT_ID_PUBLIC=your-new-document-id-here
     ```

4. **Update CLAUDE.md**
   - Replace `TBD` with the actual document ID

#### Option B: Service Account Access (More Secure)

1. **Create a Google Cloud Service Account**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Navigate to IAM & Admin → Service Accounts
   - Create service account (e.g., "google-drive-mcp-testing")
   - Note the service account email (e.g., `google-drive-mcp-testing@project-id.iam.gserviceaccount.com`)

2. **Enable APIs**
   - Enable Google Drive API
   - Enable Google Docs API
   - Enable Google Sheets API
   - Enable Google Slides API

3. **Create and download key**
   - Create new JSON key for the service account
   - Download and save securely (DO NOT COMMIT TO GIT)

4. **Create test document**
   ```
   Title: "Google Drive MCP - Service Account Test Document"
   ```

5. **Share document with service account**
   - Click "Share" button
   - Add the service account email
   - Set permission to "Editor"
   - Copy the document ID

6. **Configure environment**
   ```bash
   # Add to .env.test
   TEST_DOCUMENT_ID_PUBLIC=your-new-document-id-here
   GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/path/to/service-account-key.json
   ```

7. **Update CLAUDE.md**
   - Replace `TBD` with the actual document ID
   - Document the service account email for reference

---

## Test Document Comparison

| Aspect | OAuth Document | Public/Service Account Document |
|--------|----------------|----------------------------------|
| **Document ID** | `1CIeAIWDqN_s1g9b7V2h79VpFjlrPM15VYuZ09zsNM9w` | `18iVsRPn2L49sJtbgyvE3sakRG3v3mY--s4z5nPkghaI` |
| **Folder ID** | `1hPToIm_EVEbJIVufHgz3aC_8cL4aeMBq` | `1dy_gOwhrpgyKv_cGRO44a1AmXo45v4e3` |
| **Authentication** | OAuth 2.0 user tokens | Public link OR service account |
| **Used For** | Local development | CI/CD, automated testing |
| **Access Level** | Private to user | Public OR shared with SA |
| **Browser Required** | Yes (for OAuth flow) | No (can be fully automated) |
| **GitHub Actions** | ❌ Not suitable | ✅ Perfect fit |
| **Local Testing** | ✅ Primary method | ✅ Optional |

---

## Environment Variable Reference

### For Local Development (OAuth)
```bash
# .env.test or shell environment
export GOOGLE_DRIVE_OAUTH_CREDENTIALS="/Users/clintgossett/Documents/Applied Frameworks/projects/af-product-marketing-claude/projects/google-drive-integration/.credentials/gcp-oauth.keys.json"
export TEST_DOCUMENT_ID_OAUTH="1CIeAIWDqN_s1g9b7V2h79VpFjlrPM15VYuZ09zsNM9w"
export TEST_FOLDER_ID_OAUTH="1hPToIm_EVEbJIVufHgz3aC_8cL4aeMBq"
```

### For CI/CD (Service Account)
```bash
# GitHub Actions secrets
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
TEST_DOCUMENT_ID_PUBLIC="18iVsRPn2L49sJtbgyvE3sakRG3v3mY--s4z5nPkghaI"
TEST_FOLDER_ID_PUBLIC="1dy_gOwhrpgyKv_cGRO44a1AmXo45v4e3"
```

---

## Test Document Content

Both documents should start empty or with minimal content to ensure consistent test results.

### Recommended Initial State
```
(Empty document)
```

### Why Empty?
- Tests can verify exact content after operations
- No unexpected formatting to interfere with tests
- Easy to reset between test runs
- Clear before/after comparison

---

## Creating Additional Test Files

You may also want to create test files for Sheets and Slides:

### Google Sheets
```bash
# OAuth-protected
TEST_SPREADSHEET_ID_OAUTH="create-new-sheet-id-here"

# Public/Service Account
TEST_SPREADSHEET_ID_PUBLIC="create-new-public-sheet-id-here"
```

### Google Slides
```bash
# OAuth-protected
TEST_PRESENTATION_ID_OAUTH="create-new-slides-id-here"

# Public/Service Account
TEST_PRESENTATION_ID_PUBLIC="create-new-public-slides-id-here"
```

### Google Drive Folder
```bash
# OAuth-protected
TEST_FOLDER_ID_OAUTH="create-new-folder-id-here"

# Public/Service Account
TEST_FOLDER_ID_PUBLIC="create-new-public-folder-id-here"
```

---

## Security Best Practices

### ✅ DO
- Keep service account keys in `.credentials/` directory
- Add `.credentials/` to `.gitignore`
- Use GitHub Secrets for CI/CD credentials
- Rotate service account keys every 90 days
- Use minimal permissions (only required APIs)
- Make test documents clearly labeled as "TEST"

### ❌ DON'T
- Commit OAuth credentials to git
- Commit service account keys to git
- Use production documents for testing
- Share service account keys publicly
- Give service account access to personal files
- Use real user data in test documents

---

## GitHub Actions Secret Setup

When you create the service account, add it to GitHub:

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add these secrets:
   - `GOOGLE_SERVICE_ACCOUNT_KEY` - The entire JSON key file content
   - `TEST_DOCUMENT_ID_PUBLIC` - The public test document ID
   - `TEST_SPREADSHEET_ID_PUBLIC` - The public test spreadsheet ID (if created)
   - `TEST_PRESENTATION_ID_PUBLIC` - The public test presentation ID (if created)

---

## Troubleshooting

### "Document not found" error with public document
- Verify the document ID is correct
- Check sharing settings (must be "Anyone with the link" with "Editor" access)
- Ensure the link sharing is enabled, not just specific people

### "Insufficient permissions" error with service account
- Verify document is shared with service account email
- Check that service account has "Editor" permission (not "Viewer")
- Ensure APIs are enabled in Google Cloud Console

### OAuth tests work but service account tests fail
- Confirm service account key is valid and not expired
- Check that `GOOGLE_SERVICE_ACCOUNT_KEY` environment variable is set
- Verify service account has the necessary API scopes enabled

---

## Next Steps

After setting up test documents:

1. ✅ Create public test document (or configure service account)
2. ✅ Update `TEST_DOCUMENT_ID_PUBLIC` in `.env.test`
3. ✅ Update `CLAUDE.md` with actual document IDs
4. ✅ Test locally with both documents
5. ✅ Configure GitHub Actions secrets
6. ✅ Run full test suite in CI/CD

---

## Quick Setup Checklist

- [x] OAuth test document exists and is accessible: `1CIeAIWDqN_s1g9b7V2h79VpFjlrPM15VYuZ09zsNM9w`
- [x] OAuth test folder exists: `1hPToIm_EVEbJIVufHgz3aC_8cL4aeMBq`
- [x] Public test document created: `18iVsRPn2L49sJtbgyvE3sakRG3v3mY--s4z5nPkghaI`
- [x] Public test folder created: `1dy_gOwhrpgyKv_cGRO44a1AmXo45v4e3`
- [x] Public document ID updated in `.env.test`
- [x] Public document ID updated in `CLAUDE.md`
- [ ] Service account created (if using Option B)
- [ ] Service account key downloaded and secured
- [ ] Test document shared with service account
- [ ] GitHub secrets configured
- [ ] Local tests pass with OAuth document
- [ ] CI/CD tests pass with public/service account document
