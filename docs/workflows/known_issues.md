# Known Issues with Google Drive MCP Tools

This document tracks known bugs, limitations, and workarounds for the Google Drive MCP server.

---

## CRITICAL: Index Offset Bug with Table of Contents

**Status**: Confirmed Bug
**Severity**: High - Makes formatting unusable in documents with TOC
**Discovered**: 2025-11-18
**Affects**: `formatGoogleDocText`, `formatGoogleDocParagraph`, and all write operations

### Problem Description

When a Google Docs document contains a Table of Contents (TOC), there is a **~1235 character index offset** between:
- **Read operations** (`getGoogleDocContent`) - which exclude TOC from indices
- **Write operations** (`formatGoogleDocText`, `formatGoogleDocParagraph`) - which include TOC in indices

This causes all formatting attempts to hit the wrong text location.

### Root Cause Analysis

According to Google Docs API documentation:
> "The 'personalizing' types for structural elements—`SectionBreak`, `TableOfContents`, `Table`, and `Paragraph`—don't have these indexes because their enclosing `StructuralElement` has these fields."

**What this means**: Table of Contents elements should NOT have index properties and should be excluded from position counting.

**What's happening**:
- `getGoogleDocContent` correctly excludes TOC from indices (matches API spec)
- `formatGoogleDocText` and `formatGoogleDocParagraph` incorrectly include TOC in indices
- This creates a mismatch where read index 100 ≠ write index 100

### How to Reproduce

1. **Create a test document** with a Table of Contents:
   ```
   [Document Title]
   [Table of Contents - auto-generated, ~35 entries]

   Section 1: Data Source
   Content here...

   Section 2: Executive Summary
   Content here...
   ```

2. **Add test markers**:
   - Insert unique text like "TESTMARKER" before the first heading
   - Note its position visually (e.g., page 2, first line)

3. **Read the document**:
   ```javascript
   getGoogleDocContent(documentId)
   // Note the index range for "TESTMARKER", e.g., [62-72]
   ```

4. **Try to format at that index**:
   ```javascript
   formatGoogleDocText({
     documentId: documentId,
     startIndex: 62,
     endIndex: 72,
     foregroundColor: { red: 0, green: 1, blue: 0 }  // Green
   })
   ```

5. **Expected**: TESTMARKER turns green
   **Actual**: Text in the TOC turns green, or wrong text in document body

6. **Measure the offset**:
   - Note what text actually turned green
   - Find that text's index in the `getGoogleDocContent` output
   - Calculate: `actual_write_index - read_index = offset`
   - In our test: offset was **1235 characters**

### Validation Test

```javascript
// Test document structure:
// [start] marker at index 45
// [stop] marker at index 53
// TOC between start and stop (not shown in getGoogleDocContent)
// TESTMARKER at read index 62
// Data Source at read index 73

// Read test
const content = await getGoogleDocContent(docId);
const testMarkerIndex = findIndex(content, "TESTMARKER"); // Returns [62-72]

// Write test WITHOUT offset - FAILS
await formatGoogleDocText({
  documentId: docId,
  startIndex: 62,
  endIndex: 72,
  foregroundColor: { red: 0, green: 1, blue: 0 }
});
// Result: Wrong text turns green (not TESTMARKER)

// Write test WITH offset - WORKS
const OFFSET = 1235;
await formatGoogleDocText({
  documentId: docId,
  startIndex: 62 + OFFSET,  // 1297
  endIndex: 72 + OFFSET,    // 1307
  foregroundColor: { red: 0, green: 1, blue: 0 }
});
// Result: TESTMARKER turns green (correct!)
```

### Impact

- **Documents without TOC**: No issues
- **Documents with TOC**: All formatting operations hit wrong locations
- **User experience**: Formatting appears to work (returns success) but affects wrong text
- **Debugging difficulty**: High - formatting "succeeds" but silently affects wrong content

### Technical Details

**Offset Calculation**:
The offset appears to equal the character count of the entire TOC structure. In our test case:
- TOC had ~35 entries
- Average line length ~60 characters
- Total TOC size: ~1235 characters
- Offset needed: +1235

**Formula for workaround**:
```javascript
writeIndex = readIndex + TOC_SIZE_IN_CHARACTERS
```

**How to calculate TOC size**:
1. Add markers before and after TOC in document manually
2. Use `getGoogleDocContent` to find marker positions
3. The gap between markers reveals TOC is excluded
4. Measure TOC character count manually or programmatically
5. Use that as offset for all write operations

### Recommended Fix

The bug is in the MCP server implementation. The write tools need to be updated to use the same index system as read tools.

**For MCP server developers**:

1. **Check implementation** of `formatGoogleDocText` and `formatGoogleDocParagraph`
2. **Ensure they use** `documents.get` with the same parameters as `getGoogleDocContent`
3. **Verify index calculation** excludes TOC elements (as per Google API spec)
4. **Look for** any manual offset adjustments that might be adding TOC length

**Likely issue location** (hypothetical - needs verification):
```javascript
// WRONG: Including TOC in index calculation
const startIndex = userProvidedIndex;

// RIGHT: Should match getGoogleDocContent behavior
const startIndex = userProvidedIndex; // already excludes TOC
```

### Workaround for AI Agents

Until this is fixed, use this workaround when formatting documents with TOC:

```javascript
// 1. Calculate offset once per document
async function calculateTOCOffset(documentId) {
  // Have user add "TESTMARKER" at known location
  const content = await getGoogleDocContent(documentId);
  const readIndex = findIndex(content, "TESTMARKER");

  // Try formatting at different offsets until it works
  for (let offset = 0; offset < 3000; offset += 100) {
    await formatGoogleDocText({
      documentId,
      startIndex: readIndex + offset,
      endIndex: readIndex + offset + 10,
      foregroundColor: { red: 0, green: 1, blue: 0 }
    });

    // Ask user: "Did TESTMARKER turn green?"
    // If yes, return offset
  }
}

// 2. Use offset for all operations
const TOC_OFFSET = await calculateTOCOffset(documentId);

function formatWithOffset(startIndex, endIndex, formatting) {
  return formatGoogleDocText({
    documentId,
    startIndex: startIndex + TOC_OFFSET,
    endIndex: endIndex + TOC_OFFSET,
    ...formatting
  });
}
```

### Alternative Workaround

**For users**: Remove the TOC, do all formatting, then re-insert TOC. This avoids the bug entirely.

### Related Issues

- None known at this time

### References

- Google Docs API Structure Documentation: https://developers.google.com/docs/api/concepts/structure
- Specific quote about TOC indices: "The 'personalizing' types for structural elements—`SectionBreak`, `TableOfContents`, `Table`, and `Paragraph`—don't have these indexes because their enclosing `StructuralElement` has these fields."

### Test Case Document

Document ID used for discovery: `130QyNt_6z8TJNp04gBqDciiI8MNTf4E7oW0U3S-IB_0`

Document structure:
- Title: "User Migration Analysis - Platform Shutdown"
- TOC: 35+ entries, ~1235 characters
- Test markers: `[start]` at index 45, `[stop]` at index 53
- First content: "TESTMARKER" at read index 62, write index 1297
- Offset confirmed: 1235 characters

---

**Last Updated**: 2025-11-18
**Reporter**: Claude (via user testing session)
**Priority**: High - blocking reliable formatting in production documents
