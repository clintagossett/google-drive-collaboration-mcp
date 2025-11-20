# Authentication & Permission Diagnostic Tools

## Problem Statement

Users frequently encounter authentication and permission issues when using the MCP server:
- "Why can't I access this file?"
- "Am I authenticated correctly?"
- "What user am I authenticated as?"
- "Do I have the right OAuth scopes?"
- "What permissions do I have on this file?"

Currently, there's no easy way for users to diagnose these issues without diving into logs or error messages.

## Proposed Diagnostic Tools

### 1. `auth_getStatus` - Check Authentication Status

**Purpose**: Verify authentication is working and show current user info

**Maps to**: `drive.about.get` API
**Reference**: https://developers.google.com/drive/api/reference/rest/v3/about/get

**Input Schema**:
```typescript
{
  fields: string (optional) // Fields to include (default: 'user,storageQuota')
}
```

**Returns**:
```json
{
  "authenticated": true,
  "user": {
    "emailAddress": "user@example.com",
    "displayName": "John Doe",
    "photoLink": "https://...",
    "permissionId": "12345"
  },
  "storageQuota": {
    "usage": "1234567890",
    "limit": "107374182400",
    "usageInDrive": "1234567890"
  }
}
```

**Use Cases**:
- Verify authentication is working
- Confirm which Google account is authenticated
- Check available storage quota
- First step in debugging any access issues

---

### 2. `auth_testFileAccess` - Test Access to Specific File/Folder

**Purpose**: Test if user can access a specific file and show what permissions they have

**Maps to**: `drive.files.get` with specific error handling
**Reference**: https://developers.google.com/drive/api/reference/rest/v3/files/get

**Input Schema**:
```typescript
{
  fileId: string,
  fields: string (optional) // Default: 'id,name,mimeType,capabilities,permissions'
}
```

**Returns** (on success):
```json
{
  "accessible": true,
  "file": {
    "id": "abc123",
    "name": "My Document",
    "mimeType": "application/vnd.google-apps.document"
  },
  "capabilities": {
    "canEdit": true,
    "canComment": true,
    "canShare": false,
    "canCopy": true,
    "canDownload": true
  },
  "yourPermission": {
    "role": "writer",
    "type": "user"
  }
}
```

**Returns** (on access denied):
```json
{
  "accessible": false,
  "error": "File not found or you don't have permission to access it",
  "errorCode": 404,
  "suggestions": [
    "Verify the file ID is correct",
    "Ask the owner to share the file with your account (user@example.com)",
    "Check if the file has been deleted or moved to trash"
  ]
}
```

**Use Cases**:
- Quick test: "Can I access this file?"
- Show what actions user can perform (edit, comment, share, etc.)
- Provide actionable suggestions when access fails
- Help debug permission issues

---

### 3. `auth_listScopes` - Show Granted OAuth Scopes

**Purpose**: Display what OAuth scopes the current token has

**Implementation**: Parse token scopes from OAuth2Client credentials

**Input Schema**: (none)

**Returns**:
```json
{
  "scopes": [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/presentations"
  ],
  "scopeDescriptions": {
    "https://www.googleapis.com/auth/drive": "Full access to Google Drive",
    "https://www.googleapis.com/auth/documents": "Access to Google Docs",
    "https://www.googleapis.com/auth/spreadsheets": "Access to Google Sheets",
    "https://www.googleapis.com/auth/presentations": "Access to Google Slides"
  },
  "tokenExpiry": "2025-01-19T12:00:00Z",
  "hasRefreshToken": true
}
```

**Use Cases**:
- Verify required scopes are granted
- Debug scope-related permission errors
- Check if token needs refresh

---

### 4. `auth_diagnoseError` - Analyze and Explain API Errors

**Purpose**: Helper tool that analyzes Google API error responses and provides actionable guidance

**Input Schema**:
```typescript
{
  errorCode: number,      // HTTP status code (404, 403, 401, etc.)
  errorMessage: string,   // Error message from API
  fileId: string (optional), // File that caused the error
  operation: string (optional) // What operation was attempted
}
```

**Returns**:
```json
{
  "errorType": "Permission Denied",
  "explanation": "You don't have permission to access this file",
  "possibleCauses": [
    "The file hasn't been shared with your account (user@example.com)",
    "You need 'writer' or 'owner' role for this operation",
    "The file owner needs to grant you access"
  ],
  "suggestedActions": [
    "Ask the file owner to share it with user@example.com",
    "Verify you're authenticated with the correct Google account",
    "Use auth_getStatus to confirm your current account"
  ],
  "relatedTools": [
    "auth_getStatus - Check which account you're using",
    "auth_testFileAccess - Test access to this specific file",
    "drive_listPermissions - See who has access to the file"
  ]
}
```

**Common Error Patterns**:

| Error Code | Error Type | Common Causes | Suggested Actions |
|------------|-----------|---------------|-------------------|
| 401 | Unauthorized | Token expired or invalid | Re-authenticate with `npm run auth` |
| 403 | Forbidden | Missing OAuth scope or rate limit | Check scopes with `auth_listScopes`, wait if rate limited |
| 404 | Not Found | File doesn't exist or no access | Verify file ID, check if file is shared with you |
| 429 | Rate Limit | Too many requests | Wait and retry, implement exponential backoff |

---

## Implementation Priority

1. **`auth_getStatus`** (HIGHEST) - Essential first diagnostic step
2. **`auth_testFileAccess`** (HIGH) - Most common issue users face
3. **`auth_listScopes`** (MEDIUM) - Useful for scope-related issues
4. **`auth_diagnoseError`** (LOW) - Nice to have, could be client-side

## Design Principles Compliance

✅ **1:1 API Mapping**: Each tool maps to a specific Google API endpoint
✅ **Thin Layer**: Minimal logic, mostly pass-through with helpful formatting
✅ **Error Handling**: Provide clear, actionable error messages
✅ **Documentation**: Each tool documents the Google API it maps to

## Testing Strategy

For each tool:
- Unit tests for schema validation (5+ tests per tool)
- Unit tests for success response formatting
- Unit tests for error response formatting
- Integration test with actual API (optional, requires auth)

## User Documentation

Add to README:

```markdown
### Troubleshooting Authentication

If you're having issues accessing files or folders:

1. **Check authentication status**:
   ```
   auth_getStatus
   ```
   Verifies you're authenticated and shows which Google account you're using.

2. **Test access to a specific file**:
   ```
   auth_testFileAccess { "fileId": "YOUR_FILE_ID" }
   ```
   Shows if you can access the file and what permissions you have.

3. **Check OAuth scopes**:
   ```
   auth_listScopes
   ```
   Lists what Google APIs you have access to.

4. **Re-authenticate**:
   ```bash
   npm run auth
   ```
   If tokens are expired or invalid.
```

## Related Issues

This addresses common user questions:
- "Why can't I access this file?"
- "What user am I authenticated as?"
- "Do I have the right permissions?"
- "How do I debug 403/404 errors?"

## Future Enhancements

- `auth_listRecentErrors` - Show recent API errors with explanations
- `auth_validateSetup` - Check credentials file, token file, scopes, etc.
- Interactive troubleshooting wizard in CLI
