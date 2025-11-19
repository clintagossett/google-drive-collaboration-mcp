# Known Issues - Now Tracked in GitHub Issues

**As of 2025-11-18**, all bugs, issues, and feature requests are now tracked in GitHub Issues.

**Repository**: https://github.com/clintagossett/google-drive-mcp/issues

---

## How to Report Issues

### 🐛 Bug Reports
Use the **Bug Report** template: https://github.com/clintagossett/google-drive-mcp/issues/new/choose

Required information:
- Severity (Critical/High/Medium/Low)
- Affected API and tool(s)
- Steps to reproduce
- Expected vs actual behavior
- Version and authentication method

### ✨ Feature Requests
Use the **Feature Request** template: https://github.com/clintagossett/google-drive-mcp/issues/new/choose

Required information:
- Feature type (new tool, enhancement, etc.)
- Target Google API
- Problem statement and proposed solution
- Use case and priority

### 💬 Questions & Discussions
For questions or general discussions, use **GitHub Discussions**:
https://github.com/clintagossett/google-drive-mcp/discussions

---

## Issue Labels

- `bug` - Something isn't working correctly
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `needs-triage` - Needs initial review and priority assignment
- `high-priority` - Should be addressed soon
- `good-first-issue` - Good for newcomers
- `help-wanted` - Community contributions welcome

---

## Historical Issues (Resolved)

Below are issues that were previously tracked in this file and have been resolved:

### ✅ RESOLVED: Index Offset Bug with Table of Contents

**Issue**: TOC Bug - Index offset in documents with Table of Contents
**Status**: RESOLVED (2025-11-18)
**Resolution**: Removed `getGoogleDocContent` tool, implemented `docs_get` (proper 1:1 API mapping)
**Commits**:
- bd80163 - Remove getGoogleDocContent tool
- ba4b2f3 - Add docs_get tool (1:1 API mapping)

**Problem**:
`getGoogleDocContent` used custom manual index counting instead of API-provided indices, causing ~1236 character offset in documents with TOC.

**Root Cause**:
- Tool violated 1:1 API design principles
- Added custom processing/filtering instead of returning raw API response
- Manually counted indices, skipping TOC/tables

**Solution**:
- Removed `getGoogleDocContent` (design principle violation)
- Implemented `docs_get` as proper 1:1 API mapping
- Returns complete raw document structure with correct API indices

**References**:
- Investigation: `docs/development/TOC_BUG_INVESTIGATION.md`
- Analysis: `docs/development/GETGOOGLEDOCCONTENT_ANALYSIS.md`
- Comparison: `docs/development/DOCS_GET_COMPARISON.md`

---

## Migration Note

This file previously tracked all bugs and issues. Going forward:

- ✅ **New issues**: Report via GitHub Issues
- ✅ **Bug reports**: Use Bug Report template
- ✅ **Feature requests**: Use Feature Request template
- ✅ **Questions**: Use GitHub Discussions
- ✅ **Historical reference**: This file remains for resolved issues

**Last Updated**: 2025-11-18
