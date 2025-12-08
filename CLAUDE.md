# Google Drive MCP Extension Project

## Project Overview

This is a fork of [@piotr-agier/google-drive-mcp](https://github.com/piotr-agier/google-drive-mcp) extended with comprehensive Google Sheets API thin-layer implementation and Google Drive comments functionality for Applied Frameworks.

## ⚠️ CRITICAL: READ BEFORE ANY IMPLEMENTATION

**MANDATORY Reading Order for ALL New Work**:
1. **docs/development/design/DESIGN_PRINCIPLES.md** - MUST read first, especially the warning at the top
2. **docs/development/design/LESSONS_LEARNED.md** - Learn from past mistakes (DO NOT SKIP!)
3. **docs/development/design/api_reference_sheets.md** OR **docs/development/design/api_reference_docs.md** - API reference
4. **Current phase plan** - Step-by-step implementation guide

**Key Rule**: TESTS ARE PART OF IMPLEMENTATION
- ❌ NEVER implement code without tests
- ❌ NEVER defer tests to "later" or "end of phase"
- ✅ ALWAYS write tests per-tool (5+ unit tests minimum)
- ✅ ALWAYS run `npm test` after each tool
- ✅ ONLY mark tool complete when tests pass

**Lesson from Phase 1 (2025-01-18)**: Implemented 10 Sheets tools without tests, had to write 91 tests retroactively. Never again.

## Important Context Documents

### Core Design Documents (READ THESE FIRST)
1. **docs/development/design/DESIGN_PRINCIPLES.md** - Master reference for all implementation decisions
2. **docs/development/design/LESSONS_LEARNED.md** - Documented mistakes and how to avoid them
3. **docs/development/design/API_MAPPING_STRATEGY.md** - How to map APIs to MCP tools

### API References
1. **docs/development/design/api_reference_sheets.md** - Complete Google Sheets API audit (50+ operations)
2. **docs/development/design/api_reference_docs.md** - Complete Google Docs API audit (34 operations, 100% implemented)

### Implementation Plans
1. **docs/development/design/SHEETS_PHASE_1_COMPLETE.md** - Phase 1 summary (10 core data tools implemented)

### Other Documentation
1. **README.md** - Original project documentation (will be updated as we add features)

## Related Projects

- **Parent project**: `/Users/clintgossett/Documents/Applied Frameworks/projects/af-product-marketing-claude`
- **Reference implementation**: `../af-product-marketing-claude/projects/2025-11-engage-bafo/*.py`

## Key Information

- **License**: MIT (permits modification and redistribution)
- **Original Author**: Piotr Agier
- **Extended By**: Clint Gossett
- **Package Name**: `@clintagossett/google-drive-collaboration-mcp`
- **MCP Server Name**: `google-drive-collaboration-mcp`
- **Repository**: https://github.com/clintagossett/google-drive-mcp

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

## Development Workflow (PER TOOL, NOT PER PHASE!)

**CORRECT Workflow** (follow this exactly):
```
For each tool:
1. Read API documentation for specific request type
2. Write Zod schema with validation (src/index.ts ~line 410+)
3. Write 5+ unit tests for schema (tests/unit/[toolname].test.ts)
4. Run `npm test` - verify tests pass
5. Write tool definition in ListToolsRequest (src/index.ts ~line 1460+)
6. Write case handler implementation (src/index.ts ~line 3400+)
7. Run `npm test` again - verify all tests still pass
8. Run `npm run build` - verify build succeeds
9. Mark tool as COMPLETE
10. Move to next tool

NEVER batch implement multiple tools before writing tests!
```

**Build & Test Commands**:
- `npm run build` - Build TypeScript to JavaScript
- `npm test` - Run all unit tests (MUST pass before tool is complete)
- `npm run typecheck` - TypeScript type checking
- `npm run test:coverage` - Check test coverage (≥80% required)

**Local Testing**:
- Update `~/.claude.json` to point to `dist/index.js`
- Test with OAuth document: `1CIeAIWDqN_s1g9b7V2h79VpFjlrPM15VYuZ09zsNM9w`
- Test with public/service account document: `18iVsRPn2L49sJtbgyvE3sakRG3v3mY--s4z5nPkghaI`

## Current Implementation Status

### ✅ Completed (2025-01-18)
**Google Sheets API - Phase 1: Core Data Operations** (10 tools, 91 tests, 100% passing)
- `sheets_getSpreadsheet` - Get full spreadsheet metadata
- `sheets_createSpreadsheet` - Create spreadsheet with properties
- `sheets_appendValues` - Append data to end of sheet
- `sheets_clearValues` - Clear cell values
- `sheets_batchGetValues` - Get multiple ranges at once
- `sheets_batchUpdateValues` - Update multiple ranges at once
- `sheets_batchClearValues` - Clear multiple ranges at once
- `sheets_addSheet` - Add new sheet to spreadsheet
- `sheets_deleteSheet` - Delete sheet by ID
- `sheets_updateSheetProperties` - Update sheet properties

**Total Tests**: 411 tests (320 Docs + 91 Sheets) - 100% passing

### 🔄 Next Implementation
**Google Sheets API - Phase 2: Row/Column/Range Operations** (10 tools planned)
- See `docs/development/design/api_reference_sheets.md` for complete plan

### 📋 Planned (Future)
**Google Drive Comments API** (3 tools)
- `listComments` - List comments on a file
- `replyToComment` - Reply to a specific comment
- `resolveComment` - Mark comment as resolved
- Implementation details in docs/historical/

## Todo List Guidelines

**CORRECT Todo Structure** (per-tool testing):
```
✅ Implement sheets_addSheet (code + tests)
✅ Implement sheets_deleteSheet (code + tests)
✅ Implement sheets_updateSheetProperties (code + tests)
```

**WRONG Todo Structure** (batch testing):
```
❌ Implement sheets_addSheet
❌ Implement sheets_deleteSheet
❌ Implement sheets_updateSheetProperties
❌ Test all tools  ← NO! Tests must be per-tool!
```

## Bug Reports and Feature Requests

**As of 2025-11-18**: All bugs, issues, and feature requests are tracked in **GitHub Issues**.

### 🐛 Report a Bug
- **Template**: https://github.com/clintagossett/google-drive-mcp/issues/new/choose
- **Select**: "Bug Report" template
- **Include**: Severity, affected tools, reproduction steps, expected vs actual behavior

### ✨ Request a Feature
- **Template**: https://github.com/clintagossett/google-drive-mcp/issues/new/choose
- **Select**: "Feature Request" template
- **Include**: Problem statement, proposed solution, use case, priority

### 💬 Ask Questions
- **Use**: GitHub Discussions - https://github.com/clintagossett/google-drive-mcp/discussions
- For general questions, discussions, or help

### 📝 Historical Issues
- **Reference**: `docs/development/known_issues.md` (now contains resolved issues only)

## Task Workflow

All work is tracked through numbered task folders tied to GitHub issues:

```
tasks/
├── 00001-first-task/        # GitHub Issue #1
├── 00002-another-task/      # GitHub Issue #2
└── XXXXX-task-name/         # Future tasks
```

### Creating a New Task

1. **Create GitHub Issue:**
   ```bash
   gh issue create --title "Task title" --body "Description"
   ```

2. **Create Task Folder:**
   ```bash
   mkdir tasks/XXXXX-task-name/
   ```
   - Use 5-digit numbering (00001, 00002, etc.)
   - Match the GitHub issue number when possible

3. **Add README.md** to document the task (see `tasks/TEMPLATE.md`)

4. **Do the work**

5. **Commit with Issue Reference:**
   ```
   Closes #X
   ```

### Task Folder Contents

Each task folder may contain:
- `README.md` - Task description, decisions, outcomes
- `output/` - Generated artifacts (code, data, docs)
- Any other relevant files

### Task Conventions

| Convention | Format | Example |
|------------|--------|---------|
| Task number | 5-digit, zero-padded | `00001`, `00042`, `00123` |
| Folder name | `XXXXX-kebab-case-description` | `00042-add-user-auth` |
| Issue linking | `Closes #X` in commit | `Closes #42` |

**Note**: Task folders persist as project documentation - don't delete after completion.

### Epics and Sub-Issues

**Structure**: Keep tasks **flat** with metadata linking (optimized for Claude Code).

```
tasks/
├── 00022-mcp-best-practices-epic/    # Epic (overview + links)
├── 00023-cache-infrastructure/       # Sub-issue of #22
├── 00024-returnmode-parameter/       # Sub-issue of #22
└── 00025-truncation-helper/          # Sub-issue of #22
```

**Why flat?**
- Simple lookup: Issue #23 → `tasks/00023-*/README.md`
- Self-contained: Each task has full context
- GitHub handles epic/sub-issue relationships natively
- Easy navigation: `ls tasks/` shows all work

**Epic README**: Contains overview and links to child issues (no implementation work).

**Sub-issue README metadata**:
```markdown
**GitHub Issue:** #23
**Epic:** #22 (Epic Title)
**Phase:** 1 - Phase Name
**Blocked By:** None
**Blocks:** #24, #25
```

**Subtasks within a task folder** (e.g., `01_subtask_name/`) are for internal breakdown only - they are NOT separate GitHub issues.

## Quick Reminder Checklist

Before starting any new tool:
- [ ] Read docs/development/design/DESIGN_PRINCIPLES.md
- [ ] Read docs/development/design/LESSONS_LEARNED.md
- [ ] Understand: Tests are PART of implementation
- [ ] Structure todos as "Implement X (code + tests)"
- [ ] Run `npm test` after EACH tool, not at end

Before reporting a bug or requesting a feature:
- [ ] Search existing GitHub Issues for duplicates
- [ ] Use the appropriate issue template
- [ ] Do NOT share production documents or sensitive data
- [ ] Provide clear reproduction steps (for bugs)
- [ ] Explain the use case (for features)
- Always answer questions, evaluate options, and propose solution using the MPC Builder skill