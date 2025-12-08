# Task 00023: Resource Cache Infrastructure

**GitHub Issue:** #23
**Epic:** #22 (MCP Best Practices Alignment)
**Phase:** 1 - Fix Context Overflow (CRITICAL)
**Blocked By:** None
**Blocks:** #24, #25, #26

---

## Resume (Start Here)

**Last Updated:** 2025-12-08 (Session 1)

### Current Status: PENDING

**Phase:** Ready to begin implementation.

### Next Steps

1. Add constants (`CHARACTER_LIMIT`, `CACHE_TTL_MS`)
2. Create `documentCache` Map
3. Implement cache TTL management
4. Implement Resource URI parser
5. Update `ReadResourceRequestSchema` handler
6. Write tests

---

## Objective

Create the foundational caching and Resource serving infrastructure that enables the Cache as Resource pattern.

---

## Deliverables

- [ ] Add `CHARACTER_LIMIT = 25000` constant
- [ ] Add `CACHE_TTL_MS = 30 * 60 * 1000` constant (30 min)
- [ ] Create `documentCache` Map for storing fetched content
- [ ] Implement cache TTL management (cleanup expired entries)
- [ ] Implement Resource URI parser for `gdrive://` scheme
- [ ] Update `ReadResourceRequestSchema` handler to serve cached chunks

---

## Implementation

### Constants

```typescript
const CHARACTER_LIMIT = 25000;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
```

### Cache Storage

```typescript
const documentCache = new Map<string, {
  content: any;      // Original API response
  text: string;      // Extracted text content
  fetchedAt: number; // Timestamp for TTL
}>();
```

### Resource URI Patterns

```
gdrive://docs/{docId}/content              → full cached text
gdrive://docs/{docId}/chunk/{start}-{end}  → text slice
gdrive://docs/{docId}/structure            → headings/sections only
gdrive://sheets/{spreadsheetId}/values/{range} → cell values
gdrive://files/{fileId}/content/{start}-{end}  → exported file content
```

---

## Testing

- [ ] Cache stores and retrieves content correctly
- [ ] Cache TTL expiration removes stale entries
- [ ] Resource URI parsing handles all patterns
- [ ] Chunk boundaries work correctly (no off-by-one errors)
- [ ] Invalid URIs return helpful errors
- [ ] Cache miss returns helpful error with guidance

---

## Files Changed

_(To be filled during implementation)_

---

## Notes

This is the foundation for Phase 1. Issues #24, #25, and #26 depend on this being complete.
