# TOC Index Bug Investigation Report

**Date**: 2025-11-18
**Investigator**: Claude Code
**Status**: ROOT CAUSE IDENTIFIED

---

## Executive Summary

**BUG CONFIRMED**: There is a fundamental index system mismatch between read and write operations.

- **`getGoogleDocContent`**: Uses a custom, manually-calculated index system that excludes TOC
- **`formatGoogleDocText`** and **`formatGoogleDocParagraph`**: Use Google's official API indices that include TOC

This creates an ~1235 character offset when documents contain a Table of Contents.

---

## Investigation Findings

### 1. Read Operation Analysis (`getGoogleDocContent`)

**Location**: `src/index.ts:5727-5782`

**How it works**:
```typescript
let currentIndex = 1;
const segments: Array<{text: string, startIndex: number, endIndex: number}> = [];

// Extract text content with indices
if (document.data.body?.content) {
  for (const element of document.data.body.content) {
    if (element.paragraph?.elements) {  // ← ONLY processes paragraphs
      for (const textElement of element.paragraph.elements) {
        if (textElement.textRun?.content) {
          const text = textElement.textRun.content;
          segments.push({
            text,
            startIndex: currentIndex,  // ← CUSTOM manual index
            endIndex: currentIndex + text.length
          });
          content += text;
          currentIndex += text.length;  // ← Manually incrementing
        }
      }
    }
  }
}
```

**Problem Identified**:
1. ❌ **Manually calculates indices** instead of using API-provided indices
2. ❌ **Only iterates `element.paragraph`** - skips TOC, tables, section breaks
3. ❌ **Creates a custom numbering system** starting from 1
4. ❌ **Doesn't use `element.startIndex` or `element.endIndex`** (API provides these!)

**What gets skipped**:
- `tableOfContents` elements
- `table` elements
- `sectionBreak` elements
- Any non-paragraph structural elements

---

### 2. Write Operations Analysis

#### `formatGoogleDocText` (`src/index.ts:5635-5654`)

```typescript
await docs.documents.batchUpdate({
  documentId: args.documentId,
  requestBody: {
    requests: [{
      updateTextStyle: {
        range: {
          startIndex: args.startIndex,  // ← Passes user index DIRECTLY
          endIndex: args.endIndex        // ← No transformation
        },
        textStyle,
        fields: fields.join(',')
      }
    }]
  }
});
```

#### `formatGoogleDocParagraph` (`src/index.ts:5705-5724`)

```typescript
await docs.documents.batchUpdate({
  documentId: args.documentId,
  requestBody: {
    requests: [{
      updateParagraphStyle: {
        range: {
          startIndex: args.startIndex,  // ← Passes user index DIRECTLY
          endIndex: args.endIndex        // ← No transformation
        },
        paragraphStyle,
        fields: fields.join(',')
      }
    }]
  }
});
```

**Problem Identified**:
1. ✅ **Correctly uses Google API indices** (passes directly to `batchUpdate`)
2. ❌ **Assumes user provides Google API indices** (but they provide custom indices from `getGoogleDocContent`)

---

## The Root Cause

### Two Different Index Systems

**System 1: Custom Manual Indices** (used by `getGoogleDocContent`)
- Manually calculated by iterating and counting
- Only includes paragraph text
- Excludes TOC, tables, section breaks
- Example: "TESTMARKER" appears at index 62

**System 2: Google API Absolute Indices** (used by write operations)
- Official Google Docs document indices
- Includes ALL content (TOC, tables, everything)
- This is what `documents.batchUpdate` expects
- Example: "TESTMARKER" appears at index 1297

**The Mismatch**:
```
User workflow:
1. Calls getGoogleDocContent() → returns "TESTMARKER at [62-72]" (System 1)
2. Calls formatGoogleDocText(62, 72, bold) → sends 62-72 to API (System 2)
3. API applies formatting at absolute index 62 → WRONG LOCATION (TOC content)
4. Correct location is at absolute index 1297 (offset of 1235 chars)
```

**Offset Calculation**:
```
offset = (System 2 index) - (System 1 index)
offset = 1297 - 62
offset = 1235 characters (size of TOC)
```

---

## Why This Happens

### Google Docs API Structure

According to Google Docs API documentation:

> "A StructuralElement describes content that provides structure to the document such as a section break or a table. Each StructuralElement has a startIndex and endIndex that describe the range of content in the document covered by that element."

**Key insight**: The API **already provides** `startIndex` and `endIndex` for each element!

Example API response structure:
```json
{
  "body": {
    "content": [
      {
        "startIndex": 1,
        "endIndex": 1236,
        "tableOfContents": { ... }  // ← TOC from index 1-1236
      },
      {
        "startIndex": 1236,
        "endIndex": 1298,
        "paragraph": {
          "elements": [
            {
              "startIndex": 1236,
              "endIndex": 1298,
              "textRun": {
                "content": "TESTMARKER\n"  // ← Actual indices: 1236-1298
              }
            }
          ]
        }
      }
    ]
  }
}
```

**What should happen**:
- `getGoogleDocContent` should use `element.startIndex` and `element.endIndex`
- This would give us indices of 1236-1298 for "TESTMARKER"
- Write operations would then work correctly

**What actually happens**:
- `getGoogleDocContent` ignores API indices
- Manually counts: 1, 2, 3... → gives us 62-72 for "TESTMARKER"
- Write operations fail because 62-72 points to TOC content

---

## The Fix

### Option 1: Use API-Provided Indices (RECOMMENDED)

**Change `getGoogleDocContent` to use Google's indices**:

```typescript
// CURRENT (WRONG):
let currentIndex = 1;
for (const element of document.data.body.content) {
  if (element.paragraph?.elements) {
    for (const textElement of element.paragraph.elements) {
      if (textElement.textRun?.content) {
        segments.push({
          text: textElement.textRun.content,
          startIndex: currentIndex,  // ← WRONG: manual index
          endIndex: currentIndex + textElement.textRun.content.length
        });
        currentIndex += textElement.textRun.content.length;
      }
    }
  }
}

// FIXED (RIGHT):
for (const element of document.data.body.content) {
  if (element.paragraph?.elements) {
    for (const textElement of element.paragraph.elements) {
      if (textElement.textRun?.content && textElement.startIndex !== undefined) {
        segments.push({
          text: textElement.textRun.content,
          startIndex: textElement.startIndex,  // ← RIGHT: API index
          endIndex: textElement.endIndex || (textElement.startIndex + textElement.textRun.content.length)
        });
      }
    }
  }
}
```

**Benefits**:
- ✅ Matches Google API exactly
- ✅ No offset calculations needed
- ✅ Works with TOC, tables, all elements
- ✅ Consistent read/write indices

**Risks**:
- ⚠️ Breaking change for existing users (indices will change)
- Need to test with various document structures

---

### Option 2: Transform Indices in Write Operations (NOT RECOMMENDED)

Add offset calculation in `formatGoogleDocText` and `formatGoogleDocParagraph`:

```typescript
// Calculate offset by detecting TOC size
const document = await docs.documents.get({ documentId: args.documentId });
let tocOffset = 0;

for (const element of document.data.body.content) {
  if (element.tableOfContents) {
    tocOffset = element.endIndex - element.startIndex;
    break;
  }
}

// Apply offset
const adjustedStartIndex = args.startIndex + tocOffset;
const adjustedEndIndex = args.endIndex + tocOffset;
```

**Problems**:
- ❌ Adds complexity
- ❌ Requires extra API call per format operation
- ❌ Doesn't handle tables, section breaks
- ❌ Fragile - breaks with document changes

---

## Recommended Solution

**Fix `getGoogleDocContent` to use API-provided indices (Option 1)**

### Implementation Steps

1. **Update `getGoogleDocContent` handler** (lines 5742-5758):
   ```typescript
   if (document.data.body?.content) {
     for (const element of document.data.body.content) {
       // Process all structural elements, not just paragraphs
       if (element.startIndex !== undefined && element.endIndex !== undefined) {

         // Extract text from paragraphs
         if (element.paragraph?.elements) {
           for (const textElement of element.paragraph.elements) {
             if (textElement.textRun?.content &&
                 textElement.startIndex !== undefined &&
                 textElement.endIndex !== undefined) {
               segments.push({
                 text: textElement.textRun.content,
                 startIndex: textElement.startIndex,  // Use API index
                 endIndex: textElement.endIndex         // Use API index
               });
               content += textElement.textRun.content;
             }
           }
         }
       }
     }
   }
   ```

2. **Add unit tests** verifying:
   - Indices match Google API response
   - TOC elements are handled correctly
   - Read indices = Write indices

3. **Update documentation**:
   - Note the breaking change
   - Explain new index system
   - Provide migration guide

4. **Update `known_issues.md`**:
   - Mark as FIXED
   - Document the solution
   - Explain breaking change

---

## Testing Strategy

### Without Access to Real Documents

**Use API documentation to verify logic**:

1. **Mock API responses** with TOC structure:
   ```typescript
   const mockResponse = {
     body: {
       content: [
         { startIndex: 1, endIndex: 1000, tableOfContents: {...} },
         { startIndex: 1000, endIndex: 1050, paragraph: { elements: [
           { startIndex: 1000, endIndex: 1050, textRun: { content: "Test" }}
         ]}}
       ]
     }
   };
   ```

2. **Verify index extraction**:
   - Ensure we use `element.startIndex`, not manual counting
   - Ensure we skip TOC but respect its index range
   - Ensure paragraph content gets correct indices (1000-1050, not 1-50)

3. **Unit test the fix**:
   ```typescript
   it('should use API-provided indices, not manual counting', () => {
     const result = extractContent(mockResponse);
     expect(result[0].startIndex).toBe(1000);  // Not 1
     expect(result[0].endIndex).toBe(1050);    // Not 50
   });
   ```

---

## Impact Assessment

### Documents Affected
- ✅ **Documents without TOC**: No impact (indices stay the same)
- ⚠️ **Documents with TOC**: Indices will change (BREAKING CHANGE)
- ⚠️ **Documents with tables**: May see index changes
- ⚠️ **Documents with section breaks**: May see index changes

### Tools Affected
- ✅ **Read tools**: `getGoogleDocContent` (fixed)
- ✅ **Write tools**: No changes needed (already correct)
- ✅ **Other tools**: No impact

### User Impact
- **Low**: Most users format entire new documents (no existing index references)
- **Medium**: Users with saved indices will need to re-read document
- **Workaround**: Re-call `getGoogleDocContent` after fix is deployed

---

## Next Steps

1. ✅ **Investigation complete** - Root cause identified
2. ⏭️ **Implement fix** - Update `getGoogleDocContent`
3. ⏭️ **Write tests** - Verify fix with mock data
4. ⏭️ **Update documentation** - Note breaking change
5. ⏭️ **Deploy** - Roll out fix
6. ⏭️ **Update known_issues.md** - Mark as resolved

---

## Conclusion

**Bug Confirmed**: ✅
**Root Cause**: Index system mismatch (custom vs. API indices)
**Fix Identified**: Use API-provided indices in `getGoogleDocContent`
**Complexity**: Low (simple code change)
**Risk**: Medium (breaking change for documents with TOC)
**Recommendation**: Implement fix + document breaking change

---

**Last Updated**: 2025-11-18
**Next Action**: Implement the fix in `src/index.ts`
