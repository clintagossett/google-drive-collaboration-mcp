# Google Drive MCP Extension Plan

## Context from Previous Session

This document provides context for extending the forked `google-drive-mcp` server with Google Drive comments functionality developed in a previous project session.

## Source Project

- **Original repo**: https://github.com/piotr-agier/google-drive-mcp
- **Forked to**: (Your GitHub fork URL)
- **License**: MIT (permits modification and redistribution)
- **Current location**: `/Users/clintgossett/Documents/Applied Frameworks/projects/google-drive-mcp`

## Reference Implementation

Working Python implementations of the desired functionality exist at:
```
/Users/clintgossett/Documents/Applied Frameworks/projects/af-product-marketing-claude/projects/2025-11-engage-bafo/
```

### Key Reference Files:
1. **`check_comments.py`** - Lists comments from Google Docs using Drive API
2. **`reply_to_comment.py`** - Replies to specific comments by ID
3. **`fix_spacing.py`** - Demonstrates batch document updates with formatting

### Python Code Patterns Learned:

#### Authentication Pattern
```python
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

# Load MCP tokens + OAuth credentials
token_data = json.load(open('~/.config/google-drive-mcp/tokens.json'))
oauth_data = json.load(open('gcp-oauth.keys.json'))['installed']

creds = Credentials(
    token=token_data.get('access_token'),
    refresh_token=token_data.get('refresh_token'),
    token_uri='https://oauth2.googleapis.com/token',
    client_id=oauth_data['client_id'],
    client_secret=oauth_data['client_secret'],
    scopes=SCOPES
)

if creds.expired:
    creds.refresh(Request())

drive_service = build('drive', 'v3', credentials=creds)
```

#### List Comments
```python
results = drive_service.comments().list(
    fileId=file_id,
    fields='comments(id,content,author,createdTime,resolved,quotedFileContent,anchor)'
).execute()

comments = results.get('comments', [])
```

#### Reply to Comment
```python
reply = drive_service.replies().create(
    fileId=file_id,
    commentId=comment_id,
    body={'content': reply_text},
    fields='id,content,createdTime'
).execute()
```

#### Resolve Comment
```python
drive_service.comments().update(
    fileId=file_id,
    commentId=comment_id,
    body={'resolved': True}
).execute()
```

## Proposed New MCP Tools

### 1. `listComments`
**Purpose**: List all comments on a Google Doc/file

**Parameters**:
- `fileId` (required): File ID to get comments from
- `includeResolved` (optional, default: false): Include resolved comments
- `pageSize` (optional, max 100): Number of comments to return
- `pageToken` (optional): Pagination token

**Returns**:
```json
{
  "comments": [
    {
      "id": "comment_id",
      "content": "Comment text",
      "author": {
        "displayName": "Author Name",
        "emailAddress": "email@example.com"
      },
      "createdTime": "2025-11-18T12:00:00Z",
      "resolved": false,
      "quotedFileContent": "Text the comment is about",
      "anchor": "Anchor position info"
    }
  ],
  "nextPageToken": "token_for_next_page"
}
```

### 2. `replyToComment`
**Purpose**: Reply to a specific comment

**Parameters**:
- `fileId` (required): File ID containing the comment
- `commentId` (required): Comment ID to reply to
- `content` (required): Reply text

**Returns**:
```json
{
  "replyId": "reply_id",
  "content": "Reply text",
  "createdTime": "2025-11-18T12:05:00Z"
}
```

### 3. `resolveComment`
**Purpose**: Mark a comment as resolved

**Parameters**:
- `fileId` (required): File ID containing the comment
- `commentId` (required): Comment ID to resolve

**Returns**:
```json
{
  "success": true,
  "commentId": "comment_id",
  "resolved": true
}
```

### 4. `unresolveComment` (Optional)
**Purpose**: Reopen a resolved comment

**Parameters**:
- `fileId` (required): File ID containing the comment
- `commentId` (required): Comment ID to unresolve

## Implementation Plan

### Step 1: Update Package Metadata
Edit `package.json`:
```json
{
  "name": "@appliedframeworks/google-drive-mcp",
  "version": "1.0.0",
  "description": "Extended Google Drive MCP Server with comments support",
  "author": "Applied Frameworks (forked from Piotr Agier)",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/YOUR_ORG/google-drive-mcp.git"
  }
}
```

### Step 2: Add Comment Tools to index.ts

The existing code uses this pattern:
```typescript
case "toolName": {
  const argsSchema = z.object({
    param1: z.string(),
    param2: z.number().optional()
  });

  const args = argsSchema.parse(params.arguments);
  ensureDriveService();

  // API call using drive or other Google service
  const result = await drive.files.list({ ... });

  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
  };
}
```

Add new cases following this pattern for comment operations.

### Step 3: Register Tools in ListToolsRequest Handler

Add tool definitions around line ~1350 (in the tools array):
```typescript
{
  name: "listComments",
  description: "List comments on a Google Drive file (Doc, Sheet, Slides)",
  inputSchema: {
    type: "object",
    properties: {
      fileId: { type: "string", description: "File ID to get comments from" },
      includeResolved: { type: "boolean", description: "Include resolved comments" },
      pageSize: { type: "number", description: "Number of comments to return" },
      pageToken: { type: "string", description: "Pagination token" }
    },
    required: ["fileId"]
  }
}
```

### Step 4: Test Locally

```bash
cd /Users/clintgossett/Documents/Applied\ Frameworks/projects/google-drive-mcp
npm install
npm run build

# Test auth (should use existing tokens)
npm run auth

# Update ~/.claude.json to point to local version:
{
  "mcpServers": {
    "google-drive-extended": {
      "command": "node",
      "args": ["/Users/clintgossett/Documents/Applied Frameworks/projects/google-drive-mcp/dist/index.js"],
      "env": {
        "GOOGLE_DRIVE_OAUTH_CREDENTIALS": "/Users/clintgossett/Documents/Applied Frameworks/projects/af-product-marketing-claude/projects/google-drive-integration/.credentials/gcp-oauth.keys.json"
      }
    }
  }
}
```

### Step 5: Test with BaFO Document

Test document ID: `1VrZlvj1nCT8xwZXDZs9ZUzP6Pqc0UNlp0VX-AdBWEs4`

Try:
1. List comments
2. Reply to a test comment
3. Resolve a comment

## NodeJS/TypeScript Conversion Notes

### Authentication
The existing MCP server already handles OAuth properly. The token management is in `src/auth/tokenManager.ts`.

### Drive API v3 Client
Already imported and used extensively:
```typescript
import { google } from "googleapis";
const drive = google.drive({ version: 'v3', auth: authClient });
```

### Comment Operations in NodeJS
```typescript
// List comments
const response = await drive.comments.list({
  fileId: fileId,
  fields: 'comments(id,content,author,createdTime,resolved,quotedFileContent,anchor)',
  includeDeleted: false,
  pageSize: pageSize,
  pageToken: pageToken
});

// Reply to comment
const reply = await drive.replies.create({
  fileId: fileId,
  commentId: commentId,
  requestBody: { content: replyText },
  fields: 'id,content,createdTime'
});

// Resolve comment
await drive.comments.update({
  fileId: fileId,
  commentId: commentId,
  requestBody: { resolved: true }
});
```

## Why This Extension is Valuable

### Current Workflow (Python scripts):
1. User adds comment in Google Doc
2. Run Python script to check comments
3. Process comment and make changes
4. Run another script to reply

### With MCP Extension:
1. User adds comment in Google Doc
2. Claude automatically detects via MCP tool
3. Claude processes and responds via MCP tools
4. Seamless integration with Claude Desktop/Code

## Success Criteria

- [ ] All three comment tools (list, reply, resolve) implemented
- [ ] Tools registered and visible in Claude Desktop/Code
- [ ] Successfully tested with BaFO document
- [ ] README updated with new tools documentation
- [ ] Code follows existing patterns and conventions
- [ ] TypeScript builds without errors
- [ ] Local testing passes before publishing

## Future Enhancements (Out of Scope for Now)

- Create new comments via API (currently not well-supported)
- List replies to a specific comment
- Delete/edit existing comments
- Batch operations on multiple comments
- Comment notifications/webhooks

## Key Files to Modify

1. **`src/index.ts`** - Add tool cases and tool definitions (~200-300 lines of new code)
2. **`package.json`** - Update metadata
3. **`README.md`** - Document new tools
4. **`CHANGELOG.md`** - Create changelog noting fork and extensions

## Testing Checklist

- [ ] `npm run build` succeeds
- [ ] `npm run typecheck` passes
- [ ] Auth flow works with existing tokens
- [ ] `listComments` returns comments from test document
- [ ] `replyToComment` adds reply visible in Google Docs
- [ ] `resolveComment` marks comment as resolved in Google Docs
- [ ] Error handling works (invalid file ID, comment ID, etc.)
- [ ] MCP server starts successfully via Claude Desktop/Code

## Reference Links

- **Original MCP server**: https://github.com/piotr-agier/google-drive-mcp
- **MCP SDK docs**: https://modelcontextprotocol.io
- **Google Drive API - Comments**: https://developers.google.com/drive/api/v3/reference/comments
- **Google Drive API - Replies**: https://developers.google.com/drive/api/v3/reference/replies
- **googleapis npm package**: https://github.com/googleapis/google-api-nodejs-client
