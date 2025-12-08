# Subtask 03: Execution Plan

**Parent Task:** 00019-evaluate-project-strategy
**Status:** DRAFT
**Created:** 2025-12-08

---

## Execution Strategy: MCP Best Practices Alignment

This plan addresses all concerns identified in the project evaluation, organized as GitHub issues/tasks.

---

## Epic: MCP Best Practices Alignment

**Related Issues:** #20, #15, #13

### Problem Statement

The current implementation has excellent API coverage (138 tools, 411 tests) but:
- Context overflow makes document tools unusable
- Missing agent hints for intelligent tool selection
- No pagination metadata for large result sets

### Success Criteria

- [ ] Large documents readable without context overflow
- [ ] All tools have appropriate annotations
- [ ] Pagination responses follow MCP standard format

---

## Phase 1: Fix Context Overflow (CRITICAL)

### Issue P1-1: Implement Resource Cache Infrastructure

**Priority:** CRITICAL
**Effort:** Medium
**Dependencies:** None

**Description:**
Create the foundational caching and Resource serving infrastructure.

**Acceptance Criteria:**
- [ ] Add `documentCache` Map for storing fetched content
- [ ] Add `CHARACTER_LIMIT = 25000` constant
- [ ] Implement cache TTL (time-to-live) management
- [ ] Implement Resource URI parser for `gdrive://` scheme
- [ ] Update `ReadResourceRequestSchema` handler to serve cached chunks

**Implementation:**
```typescript
// New constants
const CHARACTER_LIMIT = 25000;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// Cache storage
const documentCache = new Map<string, {
  content: any;
  text: string;
  fetchedAt: number;
}>();

// Resource URI patterns
// gdrive://docs/{docId}/content          → full text
// gdrive://docs/{docId}/chunk/{start}-{end} → text slice
// gdrive://docs/{docId}/structure        → headings/sections
// gdrive://sheets/{spreadsheetId}/values/{range} → cell values
```

**Tests Required:**
- [ ] Cache stores and retrieves content
- [ ] Cache TTL expiration works
- [ ] Resource URI parsing handles all patterns
- [ ] Chunk boundaries work correctly

---

### Issue P1-2: Add returnMode Parameter to Document Tools

**Priority:** CRITICAL
**Effort:** Medium
**Dependencies:** P1-1

**Description:**
Add `returnMode` parameter to document-reading tools that defaults to safe behavior.

**Affected Tools:**
| Tool | Current Behavior | New Default |
|------|------------------|-------------|
| `docs_getDocument` | Returns full JSON | Summary + cache |
| `drive_exportFile` | Returns full content | Summary + cache |
| `sheets_getSpreadsheet` | Returns full metadata | Summary + cache |
| `sheets_batchGetValues` | Returns all values | Summary + cache |

**Schema Change:**
```typescript
const DocsGetDocumentSchema = z.object({
  documentId: z.string().min(1),
  returnMode: z.enum(["summary", "full"]).default("summary")
    .describe("'summary' (default): Returns metadata, caches content for Resource access. 'full': Returns complete response (may cause context overflow)")
});
```

**Acceptance Criteria:**
- [ ] Schema updated with returnMode parameter
- [ ] Default behavior returns summary + caches content
- [ ] Summary includes resourceUri for chunk access
- [ ] `returnMode: "full"` preserves legacy behavior
- [ ] Full mode includes CHARACTER_LIMIT truncation
- [ ] Tool descriptions updated to explain both modes

**Tests Required:**
- [ ] Default mode returns summary format
- [ ] Default mode caches content
- [ ] Full mode returns complete response
- [ ] Full mode truncates at CHARACTER_LIMIT
- [ ] Resource URI in summary is valid

---

### Issue P1-3: Implement Truncation Helper

**Priority:** CRITICAL
**Effort:** Small
**Dependencies:** P1-1

**Description:**
Create reusable truncation helper with actionable messages.

**Implementation:**
```typescript
function truncateResponse(
  content: string,
  toolName: string,
  options?: {
    limit?: number;
    hint?: string;
  }
): { text: string; truncated: boolean } {
  const limit = options?.limit ?? CHARACTER_LIMIT;

  if (content.length <= limit) {
    return { text: content, truncated: false };
  }

  const truncated = content.slice(0, limit);
  const hint = options?.hint ??
    `Use returnMode: 'summary' or narrower parameters to manage response size.`;

  return {
    text: truncated + `\n\n--- TRUNCATED ---\n` +
      `Response truncated from ${content.length.toLocaleString()} to ${limit.toLocaleString()} characters.\n` +
      hint,
    truncated: true
  };
}
```

**Acceptance Criteria:**
- [ ] Helper truncates at CHARACTER_LIMIT
- [ ] Truncation message includes original size
- [ ] Truncation message includes actionable hint
- [ ] Helper used by all tools returning large content

**Tests Required:**
- [ ] Content under limit unchanged
- [ ] Content over limit truncated correctly
- [ ] Message format is correct
- [ ] Custom hints work

---

### Issue P1-4: Update High-Priority Tools

**Priority:** CRITICAL
**Effort:** Large
**Dependencies:** P1-1, P1-2, P1-3

**Description:**
Apply returnMode pattern and truncation to highest-impact tools.

**Tools to Update (in order):**

1. **docs_getDocument**
   - Add returnMode parameter
   - Summary: title, documentId, charCount, sectionCount, resourceUri
   - Cache: full document object
   - Resource access: `gdrive://docs/{id}/chunk/{start}-{end}`

2. **drive_exportFile**
   - Add returnMode parameter
   - Summary: fileName, mimeType, charCount, resourceUri
   - Cache: exported content
   - Resource access: `gdrive://files/{id}/content/{start}-{end}`

3. **sheets_getSpreadsheet**
   - Add returnMode parameter
   - Summary: title, spreadsheetId, sheetCount, sheetNames
   - Cache: full spreadsheet object
   - Resource access: `gdrive://sheets/{id}/sheet/{sheetId}`

4. **sheets_batchGetValues**
   - Add returnMode parameter
   - Summary: rangeCount, totalCells, resourceUri
   - Cache: all values
   - Resource access: `gdrive://sheets/{id}/values/{range}`

**Acceptance Criteria:**
- [ ] All 4 tools updated with returnMode
- [ ] Default behavior prevents context overflow
- [ ] Full mode still available with truncation
- [ ] Tests pass for both modes
- [ ] Tool descriptions updated

**Tests Required (per tool):**
- [ ] Summary mode returns correct format
- [ ] Summary mode caches content
- [ ] Full mode works with truncation
- [ ] Resource URI access works
- [ ] Backward compatibility maintained

---

## Phase 2: Agent Effectiveness (HIGH)

### Issue P2-1: Define Annotation Mappings

**Priority:** HIGH
**Effort:** Medium
**Dependencies:** None (can parallel with Phase 1)

**Description:**
Create mapping of all 138 tools to their correct annotations.

**Annotation Definitions:**
| Annotation | Meaning | Example Tools |
|------------|---------|---------------|
| `readOnlyHint: true` | Does not modify state | `drive_getFile`, `docs_getDocument` |
| `destructiveHint: true` | Deletes data | `drive_deleteFile`, `sheets_deleteSheet` |
| `idempotentHint: true` | Repeated calls same result | `drive_getFile`, `sheets_getSpreadsheet` |
| `openWorldHint: true` | Interacts with external service | All tools (Google APIs) |

**Deliverable:**
Create `docs/development/design/TOOL_ANNOTATIONS.md` with:
- [ ] Table of all 138 tools with annotations
- [ ] Justification for each annotation
- [ ] Review checklist

**Tools by Category:**
```
Read-Only Tools (~45):
- drive_getFile, drive_listFiles, drive_exportFile
- docs_getDocument
- sheets_getSpreadsheet, sheets_batchGetValues
- slides_getPresentation
→ readOnlyHint: true, destructiveHint: false, idempotentHint: true

Create Tools (~20):
- drive_createFile, docs_insertText, sheets_createSpreadsheet
→ readOnlyHint: false, destructiveHint: false, idempotentHint: false

Update Tools (~50):
- drive_updateFile, docs_updateTextStyle, sheets_updateSheetProperties
→ readOnlyHint: false, destructiveHint: false, idempotentHint: varies

Delete Tools (~15):
- drive_deleteFile, docs_deleteContentRange, sheets_deleteSheet
→ readOnlyHint: false, destructiveHint: true, idempotentHint: false
```

---

### Issue P2-2: Add Annotations to Tool Definitions

**Priority:** HIGH
**Effort:** Large
**Dependencies:** P2-1

**Description:**
Add annotations to all 138 tool definitions in TOOLS_LIST.

**Implementation Pattern:**
```typescript
{
  name: "drive_getFile",
  description: "...",
  inputSchema: { ... },
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true
  }
}
```

**Acceptance Criteria:**
- [ ] All 138 tools have annotations
- [ ] Annotations match mapping document
- [ ] Build passes
- [ ] Tests verify annotations present

**Execution Strategy:**
Batch by API to reduce context switching:
1. Drive tools (~25)
2. Docs tools (~35)
3. Sheets tools (~25)
4. Slides tools (~25)
5. Server tools (~3)

---

### Issue P2-3: Standardize Pagination Responses

**Priority:** HIGH
**Effort:** Medium
**Dependencies:** None

**Description:**
Add standard pagination metadata to all list operations.

**Affected Tools:**
- `drive_listFiles`
- `drive_listComments`
- (any future list operations)

**Standard Response Format:**
```json
{
  "items": [...],
  "pagination": {
    "total": 150,
    "count": 20,
    "offset": 0,
    "has_more": true,
    "next_cursor": "token_or_offset"
  }
}
```

**Acceptance Criteria:**
- [ ] All list tools return pagination metadata
- [ ] `has_more` accurately reflects availability
- [ ] `next_cursor` usable for subsequent requests
- [ ] Documentation updated

---

## Phase 3: Modernization (MEDIUM)

### Issue P3-1: Add response_format Parameter

**Priority:** MEDIUM
**Effort:** Medium
**Dependencies:** Phase 1 complete

**Description:**
Add `response_format` parameter to tools returning data.

**Implementation:**
```typescript
response_format: z.enum(["json", "markdown"]).default("markdown")
```

**Markdown Benefits:**
- More context-efficient (~40% reduction)
- Better for conversational use
- Easier for LLMs to parse

**Affected Tools:**
- All read operations that return structured data
- List operations
- Get operations

---

### Issue P3-2: Migrate to registerTool() API

**Priority:** MEDIUM
**Effort:** Large
**Dependencies:** Phase 1, 2 complete

**Description:**
Migrate from deprecated `setRequestHandler(ListToolsRequestSchema)` to modern `server.registerTool()` API.

**Current Pattern:**
```typescript
const TOOLS_LIST = [{ name, description, inputSchema }];
server.setRequestHandler(ListToolsRequestSchema, () => ({ tools: TOOLS_LIST }));
server.setRequestHandler(CallToolRequestSchema, (req) => { switch... });
```

**Modern Pattern:**
```typescript
server.registerTool(
  "tool_name",
  { title, description, inputSchema: zodSchema, annotations },
  async (params) => { ... }
);
```

**Benefits:**
- Better type safety
- Automatic schema handling
- `structuredContent` support
- `outputSchema` support

**Risk:** Large refactor, defer until stable

---

## Dependency Graph

```
Phase 1 (CRITICAL)
├── P1-1: Resource Cache Infrastructure
│   ├── P1-2: returnMode Parameter (depends on P1-1)
│   └── P1-3: Truncation Helper (depends on P1-1)
│       └── P1-4: Update High-Priority Tools (depends on P1-1, P1-2, P1-3)

Phase 2 (HIGH) - Can parallel with Phase 1
├── P2-1: Define Annotation Mappings
│   └── P2-2: Add Annotations (depends on P2-1)
└── P2-3: Standardize Pagination (independent)

Phase 3 (MEDIUM) - After Phase 1 & 2
├── P3-1: response_format Parameter
└── P3-2: Migrate to registerTool() API
```

---

## Execution Timeline

```
Week 1-2: Phase 1 (Critical)
├── Day 1-2: P1-1 Cache Infrastructure
├── Day 3-4: P1-2 returnMode + P1-3 Truncation
└── Day 5-10: P1-4 Update 4 high-priority tools

Week 2-3: Phase 2 (High) - Parallel where possible
├── Day 1-2: P2-1 Define Annotation Mappings
├── Day 3-7: P2-2 Add Annotations (batch by API)
└── Day 2-4: P2-3 Pagination (parallel)

Week 4+: Phase 3 (Medium) - As capacity allows
├── P3-1: response_format
└── P3-2: registerTool() migration (larger effort)
```

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Large doc usability | 0% (broken) | 100% |
| Tools with annotations | 0/138 | 138/138 |
| List tools with pagination metadata | 0/2 | 2/2 |
| Evaluation pass rate | TBD | >80% |

---

## Files

| File | Description |
|------|-------------|
| `README.md` | This execution plan |
