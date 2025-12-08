# Task XXXXX: Task Title

**GitHub Issue:** #X
**Related Project:** _(optional - link to `projects/YYYY-MM-project-name/` if applicable)_

<!-- For sub-issues of an Epic, add these fields: -->
**Epic:** _(optional - #XX Epic Title, if this is a sub-issue)_
**Phase:** _(optional - Phase number and name within the Epic)_
**Blocked By:** _(optional - #XX, #YY - issues that must complete first)_
**Blocks:** _(optional - #XX, #YY - issues waiting on this one)_

---

## Resume (Start Here)

**Last Updated:** YYYY-MM-DD (Session N)

### Current Status: [emoji] STATUS DESCRIPTION

**Phase:** What's currently happening or what's next.

### What We Did This Session (Session N)

1. **First thing** - Brief description
2. **Second thing** - Brief description

### Previous Sessions

_(Move session summaries here as new sessions are added)_

### Next Steps

1. **Next action** - Brief description
2. **Following action** - Brief description

---

## Objective

Brief description of what this task accomplishes.

---

## Subtasks

For complex tasks, break work into numbered subtasks. Each subtask gets its own folder with a README defining scope, deliverables, and status.

### Subtask Structure

```
tasks/XXXXX-task-name/
├── README.md                           # Main task file (this template)
├── 01_subtask_descriptive-name/
│   ├── README.md                       # Subtask requirements & status
│   ├── SQL_query_name.sql              # Self-contained SQL (if applicable)
│   └── output_file.csv                 # Deliverable
├── 02_subtask_another-name/
│   ├── README.md
│   └── ...
└── 03_subtask_third-name/
    └── ...
```

### Subtask README Template

```markdown
# Subtask NN: Descriptive Name

**Parent Task:** XXXXX-task-name
**Status:** OPEN | IN PROGRESS | COMPLETE
**Created:** YYYY-MM-DD
**Completed:** YYYY-MM-DD (when done)

---

## Objective

What this subtask accomplishes.

---

## Files

| File | Description |
|------|-------------|
| `README.md` | This file |
| `output.csv` | Deliverable description |

---

## Requirements

Detailed requirements for the deliverable.

---

## How This Will Be Used

How the output feeds into the next step or final goal.
```

### When to Use Subtasks

- **Multi-phase analysis** - Each phase has distinct deliverables (e.g., data extraction → analysis → visualization)
- **Sequential dependencies** - Phase 2 depends on Phase 1 output
- **Agent handoffs** - Clear scope for different sessions/agents to pick up
- **Complex SQL work** - Each query gets its own self-contained file

### Subtask Naming Convention

- Format: `NN_subtask_descriptive-name/`
- Zero-padded numbers: `01_`, `02_`, etc.
- Kebab-case description: `threshold-analysis`, `data-enrichment`

---

## Current State

Description of how things work before this task (if applicable).

## Options Considered

| Option | Pros | Cons |
|--------|------|------|
| Option A | ... | ... |
| Option B | ... | ... |

## Decision

Which option was chosen and why.

## Changes Made

- File 1: Description of change
- File 2: Description of change

## Output

List any artifacts produced by this task (in `output/` subfolder or subtask folders).

## Testing

How to verify the changes work correctly.
