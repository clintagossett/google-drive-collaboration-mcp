# Task 00022: MCP Best Practices Alignment (Epic)

**GitHub Issue:** #22
**Type:** Epic
**Plan Document:** `docs/development/design/MCP_BEST_PRACTICES_ALIGNMENT.md`

---

## Overview

This Epic tracks the implementation of MCP best practices to fix context overflow and improve agent effectiveness.

## Problem

Context overflow makes document tools unusable despite 138 tools and 411 tests.

## Solution

Implement **Cache as Resource** pattern with `returnMode` parameter.

---

## Child Issues

### Phase 1: Fix Context Overflow (CRITICAL)

| Issue | Title | Status | Blocked By |
|-------|-------|--------|------------|
| #23 | [Cache Infrastructure](../00023-cache-infrastructure/) | Pending | None |
| #24 | [returnMode Parameter](../00024-returnmode-parameter/) | Pending | #23 |
| #25 | [Truncation Helper](../00025-truncation-helper/) | Pending | #23 |
| #26 | [Update Priority Tools](../00026-update-priority-tools/) | Pending | #23, #24, #25 |

### Phase 2: Agent Effectiveness (HIGH)

| Issue | Title | Status | Blocked By |
|-------|-------|--------|------------|
| TBD | Annotation Mapping | Not Created | None |
| TBD | Add Annotations | Not Created | Annotation Mapping |
| TBD | Pagination Metadata | Not Created | None |

### Phase 3: Modernization (MEDIUM)

| Issue | Title | Status | Blocked By |
|-------|-------|--------|------------|
| TBD | response_format Parameter | Not Created | Phase 1 |
| TBD | registerTool() Migration | Not Created | Phase 1, 2 |

---

## Success Criteria

- [ ] Large documents readable without context overflow
- [ ] 138/138 tools have annotations
- [ ] Evaluation pass rate >80%

## Related Issues

- #20 - Context overflow
- #15 - drive_exportFile large responses
- #13 - Large MCP response mitigation
- #19 - Evaluation task (source of this Epic)
