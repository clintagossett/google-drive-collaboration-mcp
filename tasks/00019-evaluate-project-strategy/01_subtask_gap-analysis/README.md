# Subtask 01: MCP Best Practices Gap Analysis

**Parent Task:** 00019-evaluate-project-strategy
**Status:** COMPLETE
**Created:** 2025-12-08
**Completed:** 2025-12-08

---

## Objective

Compare current implementation against MCP best practices from the mcp-builder skill and identify gaps.

---

## Executive Summary

The project is a **solid foundation** with good coverage (138 tools, 411 tests), but has several gaps compared to modern MCP best practices that would improve LLM agent effectiveness.

| Category | Current State | Best Practice | Priority |
|----------|---------------|---------------|----------|
| Large Response Handling | Returns full content | Cache as Resource pattern | **CRITICAL** |
| Character Limits | None | 25K limit + truncation | **CRITICAL** |
| Pagination Metadata | Missing | has_more, next_offset | **High** |
| Tool Annotations | Missing | readOnlyHint, etc. | **High** |
| Response Formats | JSON only | JSON + Markdown | Medium |
| API Pattern | Deprecated handler | `registerTool()` | Medium |
| Project Structure | Monolithic | Modular | Low |

---

## Detailed Gap Analysis

### 0. Large Response Handling - Cache as Resource (CRITICAL Priority)

**GitHub Issue:** #20 (related: #13, #15)

**Current State:** Tools like `docs_getDocument`, `drive_exportFile`, `sheets_batchGetValues` return full content directly, consuming entire LLM context windows.

**Best Practice - "Cache as Resource" Pattern:**
```
1. Tool fetches document → caches in server memory
2. Tool returns SUMMARY only (title, size, URI)
3. Server exposes content as Resource with URI template
4. Agent reads incrementally via resources/read
```

**Implementation:**
```typescript
// Cache storage
const documentCache = new Map<string, { content: string; metadata: any }>();

// Tool returns summary, caches full content
case "docs_fetchDocument": {
  const doc = await docs.documents.get({ documentId });
  documentCache.set(documentId, { content: extractText(doc), metadata: doc });

  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        title: doc.data.title,
        totalCharacters: content.length,
        resourceUri: `gdrive://docs/${documentId}/chunk/{start}-{end}`,
        hint: "Use resources/read with chunk URI to access content"
      })
    }]
  };
}

// Resource handler serves chunks
// gdrive://docs/{docId}/chunk/0-5000 → first 5000 chars
```

**Benefits:**
| Metric | Current | With Pattern |
|--------|---------|--------------|
| Initial context cost | 45K chars | ~500 chars |
| Agent control | None | Full (reads what it needs) |
| Large doc support | Broken | Works |

**Server Already Has Foundation:**
- `ListResourcesRequestSchema` imported (line 7)
- `ReadResourceRequestSchema` imported (line 9)
- Basic resource listing implemented (line 1903)

**Recommendation:** Implement Cache as Resource for all document-reading tools. This is the proper MCP solution, not just truncation.

---

### 1. API Pattern (Medium Priority)

**Current State:**
```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS_LIST };
});
```

**Best Practice:**
```typescript
server.registerTool(
  "tool_name",
  {
    title: "Tool Display Name",
    description: "...",
    inputSchema: zodSchema,
    annotations: { readOnlyHint: true, ... }
  },
  async (params) => { ... }
);
```

**Impact:** Modern API provides better type safety, automatic schema handling, and structured content support.

**Recommendation:** Consider migration during a major refactor, but not critical for functionality.

---

### 2. Tool Annotations (HIGH PRIORITY)

**Current State:** No annotations on any tools.

**Best Practice:** Every tool should have:
```typescript
annotations: {
  readOnlyHint: true,      // Does not modify state
  destructiveHint: false,  // Does not delete data
  idempotentHint: true,    // Same result on repeat calls
  openWorldHint: true      // Interacts with external services
}
```

**Impact:** LLM agents use annotations to:
- Decide which tools are safe to call without confirmation
- Understand tool behavior without reading descriptions
- Make better decisions about tool selection

**Current Tools Missing Annotations:**
| Tool Category | Count | Should Have |
|---------------|-------|-------------|
| `drive_*` read ops | ~5 | `readOnlyHint: true` |
| `drive_*` write ops | ~8 | `destructiveHint: varies` |
| `docs_*` read ops | ~3 | `readOnlyHint: true` |
| `docs_*` write ops | ~31 | Various |
| `sheets_*` read ops | ~5 | `readOnlyHint: true` |
| `sheets_*` write ops | ~5 | Various |
| `slides_*` all ops | ~20+ | Various |

**Recommendation:** Add annotations to all 138 tools. Can be done incrementally.

---

### 3. Response Format Support (Medium Priority)

**Current State:** All tools return JSON only.

**Best Practice:** Support both formats via parameter:
```typescript
response_format: z.enum(["json", "markdown"]).default("markdown")
```

- **JSON**: For programmatic processing, chaining tools
- **Markdown**: For human readability, context efficiency

**Impact:** Markdown responses consume fewer tokens and are easier for LLMs to parse in conversational contexts.

**Recommendation:** Add `response_format` parameter to list/get operations.

---

### 4. Pagination Metadata (HIGH PRIORITY)

**Current State:** `drive_listFiles` returns raw API response without standardized pagination.

**Best Practice:**
```json
{
  "total": 150,
  "count": 20,
  "offset": 0,
  "items": [...],
  "has_more": true,
  "next_offset": 20
}
```

**Impact:** Without clear pagination metadata, LLMs struggle to:
- Know if more results exist
- Efficiently paginate through large datasets
- Understand how to request next page

**Recommendation:** Standardize pagination response format across all list operations.

---

### 5. Project Structure (Low Priority)

**Current State:**
```
src/
├── index.ts        (425KB, ~10,000 lines)
└── auth.ts
```

**Best Practice:**
```
src/
├── index.ts           # Entry point
├── types.ts           # Type definitions
├── constants.ts       # Shared constants
├── tools/
│   ├── drive.ts       # Drive tools
│   ├── docs.ts        # Docs tools
│   ├── sheets.ts      # Sheets tools
│   └── slides.ts      # Slides tools
├── services/
│   └── google-api.ts  # API client
└── schemas/
    └── index.ts       # Zod schemas
```

**Impact:** Maintainability and navigation, but doesn't affect LLM effectiveness.

**Recommendation:** Consider restructuring during next major version.

---

### 6. Character Limits (CRITICAL Priority)

**GitHub Issue:** #20

**Current State:** No response size limits - this is **blocking effective use** of the server.

**Best Practice:**
```typescript
const CHARACTER_LIMIT = 25000;

if (result.length > CHARACTER_LIMIT) {
  // Truncate with message
  response.truncated = true;
  response.truncation_message = "Use 'offset' parameter to see more results.";
}
```

**Impact:** Large responses consume entire LLM context windows, making tools unusable for:
- `docs_getDocument` - Any document over ~10 pages
- `drive_exportFile` - Full file exports
- `sheets_batchGetValues` - Spreadsheets with many cells
- `drive_listFiles` - Folders with many files

**Affected Tools (Priority Order):**
1. `docs_getDocument` - Returns full document body
2. `drive_exportFile` - Returns full file content
3. `sheets_batchGetValues` - Returns all cell data
4. `sheets_getSpreadsheet` with `includeGridData: true`
5. `drive_listFiles` - Can return hundreds of files

**Recommendation:** Implement immediately:
1. Add `CHARACTER_LIMIT = 25000` constant
2. Add truncation helper function
3. Apply to high-volume tools first
4. Include actionable guidance in truncation message

---

## What's Working Well

| Area | Assessment |
|------|------------|
| **Tool Naming** | Excellent - snake_case with service prefix (`drive_createFile`, `sheets_getSpreadsheet`) |
| **Input Validation** | Excellent - Zod schemas with descriptive error messages |
| **Test Coverage** | Excellent - 411 tests, 100% passing |
| **API Coverage** | Very Good - Comprehensive Google Workspace coverage |
| **Error Messages** | Good - Clear validation errors |
| **Documentation** | Good - CLAUDE.md with design principles |

---

## Prioritized Recommendations

### Immediate (This Phase)

1. **Add tool annotations** - High impact, can be done without breaking changes
2. **Add pagination metadata** - Standardize across list operations

### Next Phase

3. **Add response_format parameter** - Start with high-volume tools
4. **Implement character limits** - Prevent context overflow

### Future

5. **Migrate to registerTool()** - When doing major refactor
6. **Restructure project** - When file becomes unmanageable

---

## Files

| File | Description |
|------|-------------|
| `README.md` | This analysis |

---

## How This Will Be Used

This gap analysis informs:
1. **Subtask 02** - Specific recommendations for each tool category
2. **Subtask 04** - Prioritized action items for Phase 2 planning
3. **Future issues** - Can be converted to GitHub issues for tracking
