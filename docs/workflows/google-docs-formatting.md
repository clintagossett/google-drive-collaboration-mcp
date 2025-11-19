# Google Docs Formatting Workflow

This document captures best practices for formatting Google Docs content using the Google Drive MCP server tools.

## Core Principles

1. **Always use document styles** - Never leave text with default/inconsistent styling
2. **Apply styles systematically** - Format in bulk, not piecemeal
3. **Structure before decoration** - Apply paragraph styles (headings, normal text) before inline formatting (bold, italic)

## Document Style Hierarchy

### Available Styles
- `TITLE` - Document title (centered)
- `HEADING_1` - Major sections
- `HEADING_2` - Subsections
- `HEADING_3` - Minor headings/sub-subsections
- `HEADING_4`, `HEADING_5`, `HEADING_6` - Additional heading levels
- `NORMAL_TEXT` - Body paragraphs, explanatory text, bullet points, all content that isn't a heading
- `SUBTITLE` - Document subtitle (if needed)

### Style Selection Guidelines

**HEADING_1**: Use for major conceptual sections
- Example: "Executive Summary", "Strategic Analysis", "Recommendations"

**HEADING_2**: Use for subsections within major sections
- Example: "Tier A Analysis", "Tier B Analysis", "Q1 Results"

**HEADING_3**: Use for specific topics or dimensions
- Example: "Component Breakdown", "User Profile A", "Revenue Projections"

**NORMAL_TEXT**: Use for EVERYTHING else
- Body paragraphs
- Explanatory text
- Bullet point items
- Examples and lists
- Any content that follows a heading

## Common Formatting Mistakes

### ❌ Mistake 1: Not Applying NORMAL_TEXT to Body Content
```
HEADING_1: "Analysis Results"
[No style applied]: "Mathematical scoring system (0-100 points)..."
[No style applied]: "- Tier A (80-100): Highest probability"
```

### ✅ Correct Approach
```
HEADING_1: "Analysis Results"
NORMAL_TEXT: "Mathematical scoring system (0-100 points)..."
NORMAL_TEXT: "- Tier A (80-100): Highest probability"
```

### ❌ Mistake 2: Applying Heading Styles to Descriptive Text
```
HEADING_3: "Mathematical scoring system (0-100 points) measuring likelihood to migrate:"
```

### ✅ Correct Approach
```
HEADING_3: "Scoring Methodology"
NORMAL_TEXT: "Mathematical scoring system (0-100 points) measuring likelihood to migrate:"
```

### ❌ Mistake 3: Piecemeal Formatting
```
formatGoogleDocParagraph(1-50, NORMAL_TEXT)
formatGoogleDocParagraph(51-100, NORMAL_TEXT)
formatGoogleDocParagraph(101-150, NORMAL_TEXT)
... (20 more calls)
```

### ✅ Correct Approach
```
formatGoogleDocParagraph(1-500, NORMAL_TEXT)  // Format entire section at once
formatGoogleDocParagraph(10-30, HEADING_2)    // Then apply heading to specific line
```

## Step-by-Step Workflow

### When Inserting New Content

1. **Insert the raw text** using `updateGoogleDoc` or `docs_replaceAllText`
2. **Apply NORMAL_TEXT to all content** as the baseline
3. **Apply heading styles** to specific sections that should be headings
4. **Apply inline formatting** (bold, italic) to emphasize key points

### Example: Adding Executive Summary

```javascript
// Step 1: Insert content
updateGoogleDoc({
  content: `Executive Summary

Understanding Tier vs. User Profile

This analysis uses two dimensions...

TIER A (283 users)
Profile: Active Power Users

Component Breakdown:
- Recency: 88.7% active
- Investment: 100% Level 9
...`
})

// Step 2: Apply NORMAL_TEXT to entire section (baseline)
formatGoogleDocParagraph({
  startIndex: 1,
  endIndex: 5000,  // Entire section
  namedStyleType: "NORMAL_TEXT"
})

// Step 3: Apply heading styles to specific lines
formatGoogleDocParagraph({
  startIndex: 1,
  endIndex: 18,  // "Executive Summary"
  namedStyleType: "HEADING_1"
})

formatGoogleDocParagraph({
  startIndex: 230,
  endIndex: 265,  // "Understanding Tier vs. User Profile"
  namedStyleType: "HEADING_1"
})

formatGoogleDocParagraph({
  startIndex: 945,
  endIndex: 997,  // "TIER A (283 users)"
  namedStyleType: "HEADING_2"
})

// Step 4: Apply inline formatting
formatGoogleDocText({
  startIndex: 1391,
  endIndex: 1564,  // "Business Implication: ..."
  bold: true
})
```

## Tool Usage Guide

### formatGoogleDocParagraph
**Purpose**: Apply document styles (headings, normal text, alignment)
**When to use**: For structural formatting

```typescript
formatGoogleDocParagraph({
  documentId: string,
  startIndex: number,
  endIndex: number,
  namedStyleType: "HEADING_1" | "HEADING_2" | "HEADING_3" | "NORMAL_TEXT" | ...,
  alignment?: "START" | "CENTER" | "END" | "JUSTIFIED",
  lineSpacing?: number,
  spaceAbove?: number,
  spaceBelow?: number
})
```

### formatGoogleDocText
**Purpose**: Apply inline formatting (bold, italic, colors, font)
**When to use**: For emphasis within paragraphs

```typescript
formatGoogleDocText({
  documentId: string,
  startIndex: number,
  endIndex: number,
  bold?: boolean,
  italic?: boolean,
  underline?: boolean,
  strikethrough?: boolean,
  fontSize?: number,
  foregroundColor?: { red: number, green: number, blue: number }
})
```

## Document Index Mapping

When using `getGoogleDocContent`, the response shows content with indices:
```
[1-44] User Migration Analysis - Platform Shutdown
[230-265] Understanding Tier vs. User Profile
[267-345] This analysis uses two complementary dimensions...
```

**Important**:
- Index ranges are inclusive at start, exclusive at end `[start, end)`
- Line breaks and formatting affect indices
- Always read content first to get accurate indices
- Indices shift after insertions/deletions - re-read if needed

## Efficient Formatting Strategy

### Strategy 1: Baseline + Exceptions
1. Apply NORMAL_TEXT to entire new section (one call)
2. Apply heading styles to specific heading lines (few calls)
3. Apply inline formatting for emphasis (few calls)

### Strategy 2: Batch Similar Operations
Group all HEADING_1 applications together, all HEADING_2 together, etc.

```javascript
// Good: Batched by style type
formatGoogleDocParagraph(1-50, HEADING_1)
formatGoogleDocParagraph(500-550, HEADING_1)
formatGoogleDocParagraph(1000-1050, HEADING_1)

formatGoogleDocParagraph(100-150, HEADING_2)
formatGoogleDocParagraph(600-650, HEADING_2)
```

### Strategy 3: Pre-plan Structure
Before inserting content:
1. Identify what should be HEADING_1
2. Identify what should be HEADING_2
3. Everything else is NORMAL_TEXT

## Checklist for Clean Formatting

- [ ] All headings use proper named styles (HEADING_1/2/3)
- [ ] All body content uses NORMAL_TEXT style
- [ ] No text left with default/unspecified styling
- [ ] Heading hierarchy makes logical sense (H1 → H2 → H3, no skips)
- [ ] Inline formatting (bold/italic) used sparingly for emphasis
- [ ] Document structure supports auto-generated table of contents

## Batch API Operations (ADVANCED)

**Important Discovery**: The Google Docs API supports batching multiple formatting operations into a single `batchUpdate` call!

### Current MCP Limitation
The current MCP tools (`formatGoogleDocParagraph`, `formatGoogleDocText`) only send **one request per API call**. Each tool invocation = one network round trip.

### What's Possible (Not Yet Exposed)
The underlying `docs.documents.batchUpdate` API accepts an array of requests:

```javascript
// What the API supports (not exposed as MCP tool yet):
docs.documents.batchUpdate({
  documentId: "...",
  requestBody: {
    requests: [
      {
        updateParagraphStyle: {
          range: { startIndex: 1, endIndex: 5000 },
          paragraphStyle: { namedStyleType: "NORMAL_TEXT" },
          fields: "namedStyleType"
        }
      },
      {
        updateParagraphStyle: {
          range: { startIndex: 1, endIndex: 18 },
          paragraphStyle: { namedStyleType: "HEADING_1" },
          fields: "namedStyleType"
        }
      },
      {
        updateParagraphStyle: {
          range: { startIndex: 230, endIndex: 265 },
          paragraphStyle: { namedStyleType: "HEADING_1" },
          fields: "namedStyleType"
        }
      },
      {
        updateTextStyle: {
          range: { startIndex: 1391, endIndex: 1564 },
          textStyle: { bold: true },
          fields: "bold"
        }
      }
    ]
  }
})
```

### Benefits of Batch API
1. **Single network round trip** instead of 4+ separate calls
2. **Atomic operation** - all formatting succeeds or fails together
3. **Faster execution** - reduced latency
4. **Better for large documents** - less overhead

### Future Enhancement Request
A new MCP tool could be added: `batchFormatGoogleDoc` that accepts multiple formatting operations:

```typescript
batchFormatGoogleDoc({
  documentId: string,
  operations: [
    { type: "paragraph", startIndex: 1, endIndex: 5000, style: "NORMAL_TEXT" },
    { type: "paragraph", startIndex: 1, endIndex: 18, style: "HEADING_1" },
    { type: "paragraph", startIndex: 230, endIndex: 265, style: "HEADING_1" },
    { type: "text", startIndex: 1391, endIndex: 1564, bold: true }
  ]
})
```

This would transform the 3-step workflow into a **single API call**.

### Implementation Location
See: `src/index.ts:5705-5718` - The `formatGoogleDocParagraph` case shows how `batchUpdate` is currently called with a single-item requests array.

## Available Capabilities (As of Nov 18, 2025)

The MCP server now has **31+ Google Docs tools** including:
- ✅ Text deletion, replacement, bullets (`docs_deleteContentRange`, `docs_replaceAllText`, etc.)
- ✅ Table operations (insert, delete, merge, format) - 11 tools
- ✅ Headers/footers/footnotes - 8 tools
- ✅ Images and positioned objects
- ✅ Named ranges and section breaks
- ✅ Document-wide styling

See full list in `src/index.ts` - search for `name: "docs_`

## Still Missing

- **Batch formatting operations** (API exists, tool not exposed - see Batch API section above)
- Inserting auto-updating table of contents (API exists, tool not exposed)
- Creating custom numbered list formats

**Workarounds**:
- Batch operations: Make multiple sequential tool calls (slower but works)
- Table of contents: Ask user to insert manually (Insert → Table of contents)
- Custom lists: Use `docs_createParagraphBullets` with available presets

## Real-World Example

See: `/Users/clintgossett/Documents/Applied Frameworks/projects/engage all/temp.md`

This session involved creating a migration analysis in Google Docs with:
- Multiple heading levels
- Component breakdowns
- User profiles
- Examples and recommendations

Key learnings:
1. Started with raw markdown dump (wrong approach)
2. Corrected by applying proper styles systematically
3. Applied NORMAL_TEXT baseline, then heading exceptions
4. Result: Clean, navigable document with proper hierarchy

## Future Improvements

Track common patterns and edge cases here as they're discovered.

### Pattern: Two-Column Comparison
When comparing User A vs User B, use HEADING_3 for each user label, NORMAL_TEXT for details.

### Pattern: Data Tables
Use actual table insertion tools, not text-based tables.

### Pattern: Call-out Boxes
Use bold NORMAL_TEXT with spacing, or background colors via formatGoogleDocText.

---

## Summary: Can We Do 3-Step Formatting in One API Call?

**Short Answer: YES!** The Google Docs API supports it, but the MCP server doesn't expose it yet.

**Current State (Nov 2025)**:
- Each `formatGoogleDocParagraph` call = 1 network request with 1 operation
- To format a document we need: 1 baseline + N headings + M bold text = 1+N+M API calls

**What's Possible**:
- Single `batchUpdate` call with ALL operations in the requests array
- Example: 1 baseline + 5 headings + 3 bold sections = **1 API call** with 9 operations

**Benefits**:
- Much faster (one round trip vs. many)
- Atomic (all succeed or all fail)
- Less overhead
- Better developer experience

**Next Steps**:
1. Document the need (✅ done in this file)
2. Propose `batchFormatGoogleDoc` tool to MCP maintainer
3. Until then: Use existing tools with systematic approach (baseline → exceptions)

---

Last updated: 2025-11-18
Contributors: Claude (via user feedback session on batch API discovery)
