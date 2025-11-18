# Google Drive MCP Extension Project

## Project Overview

This is a fork of [@piotr-agier/google-drive-mcp](https://github.com/piotr-agier/google-drive-mcp) extended with Google Drive comments functionality for Applied Frameworks.

## Important Context Documents

1. **EXTENSION_PLAN.md** - Complete implementation plan with context from previous session
   - Reference Python implementations
   - Proposed MCP tools
   - Step-by-step implementation guide
   - Testing checklist

2. **README.md** - Original project documentation (will be updated as we add features)

## Related Projects

- **Parent project**: `/Users/clintgossett/Documents/Applied Frameworks/projects/af-product-marketing-claude`
- **Reference implementation**: `../af-product-marketing-claude/projects/2025-11-engage-bafo/*.py`

## Key Information

- **License**: MIT (permits modification and redistribution)
- **Original Author**: Piotr Agier
- **Extended By**: Applied Frameworks
- **New Package Name**: `@appliedframeworks/google-drive-mcp` (to be published)

## OAuth Credentials Location

```bash
/Users/clintgossett/Documents/Applied Frameworks/projects/af-product-marketing-claude/projects/google-drive-integration/.credentials/gcp-oauth.keys.json
```

Tokens stored at:
```bash
~/.config/google-drive-mcp/tokens.json
```

## Test Documents

We maintain two test documents for different authentication scenarios:

### 1. OAuth-Protected Test Document
- **Document ID**: `1CIeAIWDqN_s1g9b7V2h79VpFjlrPM15VYuZ09zsNM9w`
- **Folder ID**: `1hPToIm_EVEbJIVufHgz3aC_8cL4aeMBq`
- **Access**: Requires OAuth authentication
- **Purpose**: Test user-specific operations, local development
- **Sharing**: Private to your Google account

### 2. Public Test Document (Service Account)
- **Document ID**: `18iVsRPn2L49sJtbgyvE3sakRG3v3mY--s4z5nPkghaI`
- **Folder ID**: `1dy_gOwhrpgyKv_cGRO44a1AmXo45v4e3`
- **Access**: Public or shared with service account email
- **Purpose**: CI/CD testing, automated testing without OAuth
- **Sharing**: "Anyone with the link can view/edit" OR shared with service account

## Development Workflow

1. Make changes in TypeScript (`src/*.ts`)
2. Build: `npm run build`
3. Test locally by updating `~/.claude.json` to point to `dist/index.js`
4. Test with OAuth document: `1CIeAIWDqN_s1g9b7V2h79VpFjlrPM15VYuZ09zsNM9w`
5. Test with public/service account document: `18iVsRPn2L49sJtbgyvE3sakRG3v3mY--s4z5nPkghaI`

## What We're Adding

Three new MCP tools for Google Drive comments:
- `listComments` - List comments on a file
- `replyToComment` - Reply to a specific comment
- `resolveComment` - Mark comment as resolved

See **EXTENSION_PLAN.md** for complete implementation details.
