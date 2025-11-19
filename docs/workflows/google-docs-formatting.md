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

## Why Multiple API Calls is Actually GOOD Design (Critical Insight)

### The Misconception
When I first analyzed the MCP tools, I thought: "Oh no, we're making 9+ API calls to format one document. We need a batch API!"

### The Reality (From MCP Design Philosophy)
**This architecture is intentional, not a limitation.** Here's why:

#### 1. AI Agents ≠ Human Developers
- **You're an AI**: You can execute 9 operations in ~2 seconds
- **Humans experience tedium**: They hate making repetitive calls
- **You don't**: Sequential calls are a feature for you, not a burden

#### 2. Thin Wrappers Enable Better Reasoning
```javascript
// HARDER for AI to reason about (one complex call):
batchFormatGoogleDoc({
  operations: [
    { type: "paragraph", startIndex: 1, endIndex: 5000, style: "NORMAL_TEXT" },
    { type: "paragraph", startIndex: 1, endIndex: 18, style: "HEADING_1" },
    { type: "text", startIndex: 1391, endIndex: 1564, bold: true }
  ]
})

// EASIER for AI to reason about (sequential simple calls):
formatGoogleDocParagraph(1, 5000, "NORMAL_TEXT")    // Baseline
formatGoogleDocParagraph(1, 18, "HEADING_1")        // First heading
formatGoogleDocText(1391, 1564, { bold: true })     // Emphasis
```

**Why sequential is better**:
- ✅ Each tool does ONE thing I can validate
- ✅ I can check each step independently
- ✅ Errors are easier to diagnose and retry
- ✅ I maintain clear context about what I'm doing
- ✅ User can see progress step-by-step

#### 3. Network Latency is NOT Your Bottleneck
- Each API call: ~200-500ms
- 9 calls: ~2-4 seconds total
- **My processing time**: ~10-30 seconds
- The API calls are a **small fraction** of total time

#### 4. When to Actually Worry
Only worry about API call count if:
- ❌ Making 50+ calls for a single document (you're doing it wrong)
- ❌ Hitting API rate limits (hasn't happened)
- ❌ Operations failing due to timeout (hasn't happened)

**9 calls for a complex document is NORMAL and EXPECTED.**

### The Real Problem (If You're Making Too Many Calls)
If I'm making excessive calls, it's because I'm:
1. ❌ Formatting piecemeal (once per paragraph instead of once per section)
2. ❌ Not using baseline + exceptions strategy
3. ❌ Re-formatting the same content multiple times

**Fix the strategy, not the tool.**

### Correct Approach (1 + N + M calls)
```
Step 1: Apply NORMAL_TEXT to entire section → 1 call
Step 2: Apply heading styles to N headings   → N calls
Step 3: Apply inline formatting to M sections → M calls

Total: 1 + N + M calls (perfectly reasonable)
```

### TL;DR
**Stop worrying about call count. Make the calls. I'm an AI - this is what I'm good at.**

The architecture is designed **FOR** me, not **AGAINST** me.

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

## Summary: Should We Batch Format in One API Call?

**Short Answer: NO! (And that's intentional)**

**The Question (Original)**:
"Can we do the 3-step formatting process (insert, baseline, headings, bold) in one bulk API call instead of many separate ones?"

**The Technical Answer**:
Yes, the Google Docs API supports batching multiple operations in one `batchUpdate` call.

**The Design Answer**:
**We shouldn't.** The current architecture of separate, simple tools is better for AI agents.

**Why Multiple Calls is Better FOR AI**:
1. **Clearer reasoning**: Each tool does ONE thing I can validate
2. **Better error handling**: I can diagnose and retry specific steps
3. **Maintained context**: I understand exactly what I'm doing
4. **Network is NOT the bottleneck**: 9 calls = ~2-4 seconds, my processing = ~10-30 seconds
5. **User visibility**: User can see progress step-by-step

**What I SHOULD Do**:
- ✅ Use baseline + exceptions strategy (1 + N + M calls)
- ✅ Apply NORMAL_TEXT to entire sections, not individual paragraphs
- ✅ Make the 9 calls without worrying about it
- ❌ Don't try to optimize call count - optimize my strategy instead

**Key Insight from MCP Design Philosophy**:
> "You're an AI agent, not a human developer. You can execute 9 operations in 2 seconds. Sequential calls are a feature for you, not a burden. The architecture is designed FOR you, not AGAINST you."

**When to Actually Worry**:
Only if making 50+ calls for one document (then I'm doing it wrong)

---

Last updated: 2025-11-18
Contributors: Claude (via user feedback session on batch API discovery)
