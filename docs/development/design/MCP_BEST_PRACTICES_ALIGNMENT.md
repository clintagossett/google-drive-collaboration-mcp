# MCP Best Practices Alignment Plan

**Created:** 2025-12-08
**Status:** PLANNED
**Task Reference:** tasks/00019-evaluate-project-strategy
**Epic Issue:** #22

---

## Executive Summary

An evaluation of this MCP server against best practices (using the mcp-builder skill) identified critical gaps that make the server **practically unusable for real documents** despite excellent API coverage.

### Current State

| Strength | Details |
|----------|---------|
| API Coverage | 138 tools covering Drive, Docs, Sheets, Slides |
| Code Quality | Zod validation, TypeScript, comprehensive tests |
| Test Coverage | 411 tests, 100% passing |

| Gap | Severity | Impact |
|-----|----------|--------|
| Context Overflow | **CRITICAL** | Document tools unusable - responses fill LLM context |
| No Tool Annotations | HIGH | Agents can't identify safe/read-only operations |
| No Pagination Metadata | HIGH | Agents can't navigate large result sets |

### Root Cause

The "thin wrapper" design philosophy (1:1 API mapping) returns full API responses. For large documents, this causes context overflow, violating the project's own principle: **"Claude Must Never Be Blocked."**

---

## Solution: Cache as Resource Pattern

### The MCP-Recommended Approach

MCP separates concerns between **Tools** and **Resources**:
- **Tools** → Perform operations, return **summaries**
- **Resources** → Serve data chunks on demand via URI

### Implementation Strategy

Instead of creating new tools (violates "no tool proliferation" principle), add a `returnMode` parameter:

```typescript
docs_getDocument({
  documentId: "...",
  returnMode: "summary" | "full"  // default: "summary"
})
```

- `returnMode: "summary"` (default) → Returns metadata, caches content, provides Resource URI
- `returnMode: "full"` → Legacy behavior with CHARACTER_LIMIT truncation

### Agent Workflow (After Implementation)

```
1. Agent: docs_getDocument(docId)
   → Returns: { title, charCount: 45000, resourceUri: "gdrive://docs/{id}/chunk/{start}-{end}" }

2. Agent: resources/read("gdrive://docs/{id}/chunk/0-5000")
   → Returns: First 5000 characters

3. Agent reads more chunks as needed, or stops when it has enough context
```

### Benefits

| Metric | Current | After |
|--------|---------|-------|
| Initial context cost | 45K chars | ~500 chars |
| Agent control | None | Full |
| Large doc support | Broken | Works |

---

## Execution Plan

### Phase 1: Fix Context Overflow (CRITICAL)

| ID | Issue | Description | Effort | Dependencies |
|----|-------|-------------|--------|--------------|
| #23 | Resource Cache Infrastructure | Add documentCache, CHARACTER_LIMIT, Resource URI handler | Medium | None |
| #24 | returnMode Parameter | Add to document tool schemas, default to "summary" | Medium | #23 |
| #25 | Truncation Helper | Reusable truncation with actionable messages | Small | #23 |
| #26 | Update High-Priority Tools | Apply pattern to docs_getDocument, drive_exportFile, sheets_getSpreadsheet, sheets_batchGetValues | Large | #23, #24, #25 |

### Phase 2: Agent Effectiveness (HIGH)

| ID | Issue | Description | Effort | Dependencies |
|----|-------|-------------|--------|--------------|
| P2-1 | Annotation Mapping | Document correct annotations for all 138 tools | Medium | None |
| P2-2 | Add Annotations | Add readOnlyHint, destructiveHint, etc. to all tools | Large | P2-1 |
| P2-3 | Pagination Metadata | Standardize list responses with has_more, next_cursor | Medium | None |

### Phase 3: Modernization (MEDIUM)

| ID | Issue | Description | Effort | Dependencies |
|----|-------|-------------|--------|--------------|
| P3-1 | response_format | Add JSON/Markdown format option | Medium | Phase 1 |
| P3-2 | registerTool() Migration | Migrate from deprecated API pattern | Large | Phase 1, 2 |

---

## Dependency Graph

```
Phase 1 (CRITICAL)
────────────────────────────────────────────────────────────
P1-1: Cache Infrastructure
  │
  ├──► P1-2: returnMode Parameter ──┐
  │                                 │
  └──► P1-3: Truncation Helper ─────┼──► P1-4: Update Tools
                                    │
────────────────────────────────────────────────────────────

Phase 2 (HIGH) - Can run in parallel with Phase 1
────────────────────────────────────────────────────────────
P2-1: Annotation Mapping ──► P2-2: Add Annotations

P2-3: Pagination Metadata (independent)
────────────────────────────────────────────────────────────

Phase 3 (MEDIUM) - After Phase 1 & 2
────────────────────────────────────────────────────────────
P3-1: response_format
P3-2: registerTool() Migration
────────────────────────────────────────────────────────────
```

---

## Technical Specifications

### P1-1: Resource Cache Infrastructure

```typescript
// Constants
const CHARACTER_LIMIT = 25000;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// Cache storage
const documentCache = new Map<string, {
  content: any;
  text: string;
  fetchedAt: number;
}>();

// Resource URI patterns
gdrive://docs/{docId}/content              → full cached text
gdrive://docs/{docId}/chunk/{start}-{end}  → text slice
gdrive://docs/{docId}/structure            → headings/sections only
gdrive://sheets/{id}/values/{range}        → cell values
gdrive://files/{id}/content/{start}-{end}  → exported file content
```

### P1-2: returnMode Parameter

```typescript
// Schema addition
const DocsGetDocumentSchema = z.object({
  documentId: z.string().min(1),
  returnMode: z.enum(["summary", "full"]).default("summary")
});

// Summary response format
{
  title: "Document Title",
  documentId: "abc123",
  characterCount: 45000,
  sectionCount: 12,
  resourceUri: "gdrive://docs/abc123/chunk/{start}-{end}",
  hint: "Use resources/read with chunk URI to access content"
}
```

### P1-3: Truncation Helper

```typescript
function truncateResponse(
  content: string,
  options?: { limit?: number; hint?: string }
): { text: string; truncated: boolean } {
  const limit = options?.limit ?? CHARACTER_LIMIT;

  if (content.length <= limit) {
    return { text: content, truncated: false };
  }

  return {
    text: content.slice(0, limit) +
      `\n\n--- TRUNCATED ---\n` +
      `Response truncated from ${content.length.toLocaleString()} to ${limit.toLocaleString()} characters.\n` +
      (options?.hint ?? "Use returnMode: 'summary' for large documents."),
    truncated: true
  };
}
```

### P2-1: Annotation Mapping

| Category | Count | Annotations |
|----------|-------|-------------|
| Read-Only (get, list, export) | ~45 | `readOnlyHint: true, destructiveHint: false, idempotentHint: true` |
| Create (create, insert, add) | ~20 | `readOnlyHint: false, destructiveHint: false, idempotentHint: false` |
| Update (update, modify) | ~50 | `readOnlyHint: false, destructiveHint: false, idempotentHint: varies` |
| Delete (delete, remove, clear) | ~15 | `readOnlyHint: false, destructiveHint: true, idempotentHint: false` |

All tools: `openWorldHint: true` (Google API interaction)

### P2-3: Pagination Metadata

```typescript
// Standard pagination response
{
  items: [...],
  pagination: {
    total: 150,        // Total available (if known)
    count: 20,         // Items in this response
    offset: 0,         // Current offset
    has_more: true,    // More items available
    next_cursor: "..." // Token for next page
  }
}
```

---

## Success Criteria

| Metric | Current | Target |
|--------|---------|--------|
| Large document usability | 0% (broken) | 100% |
| Tools with annotations | 0/138 | 138/138 |
| List tools with pagination metadata | 0/2 | 2/2 |
| Evaluation pass rate | TBD | >80% |

---

## Related Documents

- `DESIGN_PRINCIPLES.md` - Core design philosophy
- `LESSONS_LEARNED.md` - Past mistakes to avoid
- `tasks/00019-evaluate-project-strategy/` - Full evaluation task
- `tasks/00019-evaluate-project-strategy/01_subtask_gap-analysis/` - Detailed gap analysis

## Related Issues

- #20 - Context overflow (existing)
- #15 - drive_exportFile large responses (existing)
- #13 - Large MCP response mitigation (existing)

---

## Revision History

| Date | Version | Changes |
|------|---------|---------|
| 2025-12-08 | 1.0 | Initial plan based on mcp-builder skill evaluation |
