# Feature: Authentication & Permission Diagnostic Tools

## Description

Add diagnostic tools to help users troubleshoot authentication and permission issues when accessing Google Drive files and folders.

## Proposed Tools

### 1. `auth_getStatus` - Check Authentication Status
- Verify authentication is working
- Show current Google account (email, display name)
- Show storage quota
- Maps to `drive.about.get` API

### 2. `auth_testFileAccess` - Test File/Folder Access
- Test if user can access a specific file/folder
- Show what permissions they have (canEdit, canComment, canShare, etc.)
- Provide helpful error messages and actionable suggestions when access fails
- Maps to `drive.files.get` with enhanced error handling

### 3. `auth_listScopes` - Show Granted OAuth Scopes
- Display what OAuth scopes are currently granted
- Show token expiry time
- Help debug scope-related errors

## Use Cases

Common user questions these tools will solve:
- "Why can't I access this file?"
- "What user am I authenticated as?"
- "Do I have the right permissions?"
- "How do I debug 403/404 errors?"
- "Are my OAuth scopes correct?"

## Design Document

See `design/AUTH_DIAGNOSTIC_TOOLS.md` for complete specification.

## Implementation Plan

- [ ] Implement `auth_getStatus` (code + tests)
- [ ] Implement `auth_testFileAccess` (code + tests)
- [ ] Implement `auth_listScopes` (code + tests)
- [ ] Update README with troubleshooting guide
- [ ] Update CHANGELOG

## Priority

High - These tools are essential for users to self-diagnose common authentication and permission issues.
