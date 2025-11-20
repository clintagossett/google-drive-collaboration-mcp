# Large MCP Response Mitigation Analysis

**Issue**: #13 - Mitigate large MCP responses that consume context tokens
**Created**: 2025-01-19
**Problem**: MCP responses can exceed 25k tokens, quickly filling context window

---

## Problem Statement

Users are receiving warnings when using the MCP server:

```
⚠ Large MCP response (~25.1k tokens), this can fill up context quickly
```

This occurs when tools return large amounts of data, such as:
- Listing many files without pagination
- Fetching entire spreadsheets instead of specific ranges
- API responses without field limiting
- Search results with many matches

### Impact

1. **Context Window Exhaustion**: Large responses consume available tokens quickly
2. **Reduced Effectiveness**: Less room for actual conversation and problem-solving
3. **Performance Degradation**: Unnecessary data transfer slows interactions
4. **User Friction**: Manual intervention required to limit responses

---

## Root Cause Analysis

### Current Tool Behavior

Most tools pass user parameters directly to Google APIs without defaults:

```typescript
// Example: drive_listFiles (src/index.ts ~line 4924)
case "drive_listFiles": {
  const params: any = {};

  if (args.q) params.q = args.q;
  if (args.pageSize) params.pageSize = args.pageSize;  // No default!
  if (args.fields) params.fields = args.fields;        // No default!

  // ... calls drive.files.list(params)
}
```

**Result**: Without user-specified limits, APIs return full responses:
- `drive_listFiles` can return 100+ files with full metadata (default page size: 100)
- `sheets_batchGetValues` returns entire sheets if range is "Sheet1"
- Each file/row includes ALL fields unless `fields` parameter used

### Common Scenarios

| Scenario | Typical Size | Tokens Used |
|----------|--------------|-------------|
| List 100 files (full metadata) | ~50-100KB | ~15-30k tokens |
| Get sheet with 500 rows × 10 cols | ~200KB | ~60k tokens |
| Search results with 50+ matches | ~75KB | ~20k tokens |
| Docs API with full document body | Varies | Can exceed 100k |

---

## Mitigation Strategies

### Strategy 1: Documentation & Guidance (Immediate)

**Effort**: Low (1-2 hours)
**Impact**: Medium (helps informed users)

#### Actions

1. **Add Performance Tips Section to README**

```markdown
## ⚡ Performance Tips: Reducing Response Size

Large responses can consume context tokens quickly. Follow these guidelines:

### Always Use `fields` Parameter
Limit API responses to only the data you need:

```typescript
// ❌ Returns ALL metadata (~500+ bytes per file)
drive_getFile({ fileId: "abc123" })

// ✅ Returns only essentials (~50 bytes per file)
drive_getFile({
  fileId: "abc123",
  fields: "id,name,mimeType,parents,trashed"
})
```

### Use Pagination
Break large result sets into smaller chunks:

```typescript
// ❌ Could return 100+ files
drive_listFiles({ q: "name contains 'report'" })

// ✅ Returns max 10 files
drive_listFiles({
  q: "name contains 'report'",
  pageSize: 10,
  fields: "files(id,name,mimeType)"
})
```

### Request Specific Ranges
For spreadsheets, always specify cell ranges:

```typescript
// ❌ Returns entire sheet (could be 1000s of rows)
sheets_batchGetValues({
  spreadsheetId: "...",
  ranges: ["Sheet1"]
})

// ✅ Returns only needed data
sheets_batchGetValues({
  spreadsheetId: "...",
  ranges: ["Sheet1!A1:D10"]
})
```

### Common Field Patterns

**Drive/Files**:
- Minimal: `"id,name,mimeType"`
- Standard: `"id,name,mimeType,parents,modifiedTime,trashed"`
- Full: `"*"` (avoid unless necessary)

**Sheets**:
- Use specific ranges: `"A1:B10"` not `"Sheet1"`
- Limit sheets: `"sheets.properties(sheetId,title)"` not `"*"`

**Docs**:
- Minimal: `"documentId,title"`
- Content: `"documentId,title,body"`
- Avoid: `"*"` (includes revision history, suggestions, etc.)
```

2. **Update Tool Descriptions**

Add size warnings to tool descriptions for commonly large responses:

```typescript
{
  name: "drive_listFiles",
  description: "List or search for files. ⚠️ Use pageSize and fields parameters to reduce response size.",
  // ...
}
```

3. **Create Quick Reference**

Add `docs/PERFORMANCE_GUIDE.md` with examples and token estimates.

---

### Strategy 2: Smart Defaults (Medium Term)

**Effort**: Medium (4-6 hours)
**Impact**: High (helps all users automatically)

#### Approach 1: Default Field Limiting

Add sensible defaults when `fields` parameter is omitted:

```typescript
// In drive_listFiles case handler
case "drive_listFiles": {
  // ...

  // Add default fields if not specified
  if (!args.fields) {
    params.fields = "nextPageToken,files(id,name,mimeType,parents,modifiedTime,trashed)";
  } else {
    params.fields = args.fields;
  }

  // Add default pageSize if not specified
  if (!args.pageSize) {
    params.pageSize = 20;  // Much smaller than API default of 100
  }

  // ...
}
```

**Pros**:
- Transparent: Users can override with explicit `fields: "*"`
- Backward compatible: Only affects unspecified parameters
- Immediate improvement: 50-80% response size reduction

**Cons**:
- May break existing workflows expecting full metadata
- Requires careful default selection

#### Approach 2: Response Size Detection

Add automatic size warnings:

```typescript
function createResponse(data: any, warning?: string) {
  const json = JSON.stringify(data, null, 2);
  const sizeKB = json.length / 1024;
  const estimatedTokens = Math.round(json.length / 3.5); // Rough estimate

  let responseText = json;

  if (estimatedTokens > 10000) {
    responseText = JSON.stringify({
      warning: `⚠️ Large response detected: ~${Math.round(sizeKB)}KB (~${Math.round(estimatedTokens/1000)}k tokens)`,
      suggestion: warning || "Consider using 'fields' parameter or pagination to reduce size",
      data: data
    }, null, 2);
  }

  return {
    content: [{ type: "text", text: responseText }],
    isError: false
  };
}

// Usage in tools
case "drive_listFiles": {
  // ... get result ...
  return createResponse(result.data,
    "Use 'pageSize' and 'fields' parameters: fields='files(id,name,mimeType)' pageSize=20"
  );
}
```

**Pros**:
- Non-breaking: Just adds warnings
- Educational: Teaches users about optimization
- Measurable: Actual size feedback

**Cons**:
- Adds overhead (JSON stringification)
- Warning noise if not tuned properly

---

### Strategy 3: Light Tool Variants (Long Term)

**Effort**: Medium-High (6-10 hours)
**Impact**: High (best user experience)

Create "light" versions of tools with optimized defaults:

```typescript
{
  name: "drive_listFilesLight",
  description: "List files with minimal metadata (faster, smaller response)",
  inputSchema: {
    properties: {
      q: { type: "string", description: "Query string" },
      pageSize: {
        type: "number",
        description: "Max results (default: 20, max: 50)",
        default: 20
      }
    }
  }
}

// Implementation
case "drive_listFilesLight": {
  const params: any = {
    q: args.q,
    pageSize: Math.min(args.pageSize || 20, 50),
    fields: "nextPageToken,files(id,name,mimeType,parents,trashed)",
    includeItemsFromAllDrives: true,
    supportsAllDrives: true
  };

  // Auto-add trash filter
  if (!args.q?.includes('trashed')) {
    params.q = params.q ? `(${params.q}) and trashed=false` : 'trashed=false';
  }

  const result = await drive.files.list(params);
  return createResponse(result.data);
}
```

**Additional Light Tools**:
- `sheets_getValuesLight` - Auto-limits to 100 rows
- `docs_getLight` - Returns title + first 1000 chars
- `drive_searchLight` - Returns max 10 results

**Pros**:
- Zero breaking changes (new tools)
- Optimized by design
- Clear naming convention

**Cons**:
- Tool proliferation
- Maintenance overhead
- Need to document when to use which

---

### Strategy 4: Configuration & Limits

**Effort**: Medium (4-6 hours)
**Impact**: Medium (power user feature)

Add environment variable configuration:

```typescript
// In src/index.ts
const CONFIG = {
  MAX_RESPONSE_SIZE: parseInt(process.env.MCP_MAX_RESPONSE_SIZE || '50000'), // 50KB
  MAX_PAGE_SIZE: parseInt(process.env.MCP_MAX_PAGE_SIZE || '50'),
  AUTO_TRUNCATE: process.env.MCP_AUTO_TRUNCATE === 'true',
  DEFAULT_FIELDS: {
    drive: process.env.MCP_DRIVE_DEFAULT_FIELDS ||
           'nextPageToken,files(id,name,mimeType,parents,modifiedTime,trashed)',
    sheets: process.env.MCP_SHEETS_DEFAULT_FIELDS ||
            'sheets.properties(sheetId,title)',
    docs: process.env.MCP_DOCS_DEFAULT_FIELDS ||
          'documentId,title'
  }
};

// Apply in tool handlers
function applyDefaultFields(service: string, userFields?: string): string {
  if (userFields === '*') return '*';  // Explicit override
  if (userFields) return userFields;   // User specified
  return CONFIG.DEFAULT_FIELDS[service]; // Use default
}
```

**Configuration in Claude Desktop**:

```json
{
  "mcpServers": {
    "google-drive": {
      "command": "npx",
      "args": ["-y", "@clintagossett/google-drive-collaboration-mcp"],
      "env": {
        "MCP_MAX_RESPONSE_SIZE": "30000",
        "MCP_AUTO_TRUNCATE": "true",
        "MCP_DRIVE_DEFAULT_FIELDS": "files(id,name)"
      }
    }
  }
}
```

**Pros**:
- User control
- No code changes needed to adjust
- Easy to experiment

**Cons**:
- Requires user configuration
- Environment variables can be confusing
- Platform-specific setup

---

### Strategy 5: Summary/Count Tools

**Effort**: Low-Medium (2-4 hours per tool)
**Impact**: Medium (specific use cases)

Add tools that return counts/summaries instead of full data:

```typescript
{
  name: "drive_countFiles",
  description: "Count files matching query without returning file data",
  inputSchema: {
    properties: {
      q: { type: "string", description: "Query string" }
    }
  }
}

case "drive_countFiles": {
  let count = 0;
  let pageToken = undefined;

  do {
    const result = await drive.files.list({
      q: args.q,
      pageSize: 1000,
      fields: "nextPageToken",  // No file data!
      pageToken: pageToken,
      includeItemsFromAllDrives: true,
      supportsAllDrives: true
    });

    count += result.data.files?.length || 0;
    pageToken = result.data.nextPageToken;
  } while (pageToken);

  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        query: args.q,
        count: count
      }, null, 2)
    }],
    isError: false
  };
}
```

**Additional Summary Tools**:
- `sheets_getRangeSummary` - Row/col counts, data types
- `docs_getSummary` - Word count, section headers
- `drive_getFolderSummary` - File counts by type

**Pros**:
- Minimal response size
- Fast operations
- Useful for decision-making

**Cons**:
- Limited use cases
- Doesn't replace full data access
- More tools to maintain

---

## Recommended Implementation Plan

### Phase 1: Quick Wins (Week 1)

**Goal**: Help users help themselves

1. ✅ **Add Performance Guide** (2 hours)
   - Create `docs/PERFORMANCE_GUIDE.md`
   - Add section to README
   - Include examples and token estimates

2. ✅ **Update Tool Descriptions** (1 hour)
   - Add size warnings to large-response tools
   - Suggest specific parameters

3. ✅ **Add Quick Reference** (1 hour)
   - Common field patterns
   - Pagination examples
   - Range syntax guide

**Deliverable**: Documentation that empowers users to optimize queries

---

### Phase 2: Smart Defaults (Week 2-3)

**Goal**: Automatic optimization for common cases

1. ✅ **Add Default Fields** (3 hours)
   - Implement in drive_listFiles
   - Implement in sheets tools
   - Implement in docs tools
   - Allow override with `fields: "*"`

2. ✅ **Add Default Page Sizes** (1 hour)
   - Set pageSize=20 default for list operations
   - Document override behavior

3. ✅ **Add Response Size Detection** (2 hours)
   - Implement warning system
   - Tune thresholds
   - Add helpful suggestions

**Deliverable**: Tools that are efficient by default

---

### Phase 3: Configuration (Week 4)

**Goal**: Power users can customize behavior

1. ✅ **Environment Variables** (2 hours)
   - MAX_RESPONSE_SIZE
   - DEFAULT_FIELDS per service
   - MAX_PAGE_SIZE

2. ✅ **Documentation** (1 hour)
   - Configuration guide
   - Platform-specific examples
   - Best practices

**Deliverable**: Configurable limits and defaults

---

### Phase 4: Advanced Features (Future)

**Goal**: Additional optimization options

1. ⏳ **Light Tool Variants** (6 hours)
   - Create 3-4 high-impact light tools
   - Document when to use each
   - Maintain parity with full tools

2. ⏳ **Summary Tools** (4 hours)
   - Add count tools
   - Add summary tools
   - Document use cases

**Deliverable**: Specialized tools for specific needs

---

## Testing Strategy

### Test Cases

1. **Default Behavior**
   ```typescript
   // Should use defaults
   drive_listFiles({ q: "name contains 'test'" })
   // Expected: pageSize=20, minimal fields
   ```

2. **Override Defaults**
   ```typescript
   // Should respect user preferences
   drive_listFiles({
     q: "name contains 'test'",
     pageSize: 100,
     fields: "*"
   })
   // Expected: pageSize=100, all fields
   ```

3. **Response Size Warning**
   ```typescript
   // Should warn on large response
   drive_listFiles({ pageSize: 100, fields: "*" })
   // Expected: Warning in response
   ```

4. **Configuration**
   ```bash
   MCP_MAX_PAGE_SIZE=10 npm start
   # Should limit to 10 regardless of request
   ```

### Metrics

- **Response Size Reduction**: Target 50-80% for typical queries
- **Token Usage**: Measure before/after with same queries
- **User Complaints**: Track size-related issues
- **Performance**: Ensure optimizations don't slow API calls

---

## Success Criteria

### User-Facing
- [ ] Users can easily control response sizes
- [ ] Clear documentation with examples
- [ ] Helpful warnings when responses are large
- [ ] No breaking changes to existing workflows

### Technical
- [ ] Default responses < 10k tokens for common operations
- [ ] Configuration system working
- [ ] Tests passing for all scenarios
- [ ] Performance impact < 5%

### Documentation
- [ ] Performance guide published
- [ ] README updated with tips
- [ ] Tool descriptions include size guidance
- [ ] Configuration examples provided

---

## Risks & Mitigation

### Risk: Breaking Changes
**Mitigation**: Make defaults overridable, test existing workflows

### Risk: Over-optimization
**Mitigation**: Start conservative, tune based on feedback

### Risk: User Confusion
**Mitigation**: Clear documentation, helpful error messages

### Risk: Maintenance Burden
**Mitigation**: Focus on high-impact changes, avoid tool proliferation

---

## Open Questions

1. **What should default page size be?**
   - Options: 10 (very conservative), 20 (balanced), 50 (generous)
   - Recommendation: 20 (balance of performance vs usability)

2. **Should we auto-truncate responses?**
   - Pros: Guarantees size limit
   - Cons: Data loss, confusing behavior
   - Recommendation: Warn but don't truncate (user control)

3. **Light tools vs smart defaults?**
   - Light tools: More explicit but more maintenance
   - Smart defaults: Transparent but potential surprises
   - Recommendation: Start with smart defaults, add light tools if needed

4. **Configuration complexity?**
   - Simple: One MAX_RESPONSE_SIZE setting
   - Complex: Per-service, per-tool configuration
   - Recommendation: Start simple, add complexity based on demand

---

## References

- MCP Protocol Specification: https://modelcontextprotocol.io
- Google Drive API Fields Parameter: https://developers.google.com/drive/api/guides/fields-parameter
- Google Sheets API Best Practices: https://developers.google.com/sheets/api/guides/concepts
- Token Estimation: ~3.5 characters per token (varies by model)

---

## Appendix: Token Usage Examples

### Before Optimization

```typescript
// Query: List files in folder
drive_listFiles({ q: "'folderID' in parents" })

// Response: 100 files × ~800 bytes = 80KB
// Tokens: ~23,000 tokens (80KB / 3.5 chars per token)
```

### After Optimization

```typescript
// Same query with defaults
drive_listFiles({ q: "'folderID' in parents" })
// Auto-applies: pageSize=20, fields='files(id,name,mimeType,parents,trashed)'

// Response: 20 files × ~100 bytes = 2KB
// Tokens: ~570 tokens (2KB / 3.5 chars per token)

// 97.5% reduction! 🎉
```

### Extreme Example

```typescript
// Before: Get entire spreadsheet
sheets_batchGetValues({
  spreadsheetId: "...",
  ranges: ["Sheet1"]  // 1000 rows × 10 cols
})
// Response: ~500KB
// Tokens: ~140,000 tokens (exceeds most context windows!)

// After: Get specific range
sheets_batchGetValues({
  spreadsheetId: "...",
  ranges: ["Sheet1!A1:J10"]  // 10 rows × 10 cols
})
// Response: ~5KB
// Tokens: ~1,400 tokens

// 99% reduction! 🚀
```

---

**Next Steps**: Begin Phase 1 implementation with documentation updates.
