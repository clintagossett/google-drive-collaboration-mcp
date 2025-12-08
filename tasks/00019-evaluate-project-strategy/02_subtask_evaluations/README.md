# Subtask 02: MCP Server Evaluations

**Parent Task:** 00019-evaluate-project-strategy
**Status:** IN PROGRESS
**Created:** 2025-12-08

---

## Objective

Create 10 evaluation questions to test whether LLMs can effectively use the Google Drive Collaboration MCP server.

---

## Evaluation Approach

Per MCP best practices, evaluations should:
- Use only **READ-ONLY, NON-DESTRUCTIVE** operations
- Require **multiple tool calls** (potentially dozens)
- Have **stable answers** that won't change over time
- Be **realistic** - tasks humans would actually want to accomplish

---

## Test Documents

Using the project's configured test documents:

| Document | ID | Type |
|----------|----|----- |
| OAuth Test Doc | `1CIeAIWDqN_s1g9b7V2h79VpFjlrPM15VYuZ09zsNM9w` | Google Doc |
| OAuth Test Folder | `1hPToIm_EVEbJIVufHgz3aC_8cL4aeMBq` | Folder |
| Public Test Doc | `18iVsRPn2L49sJtbgyvE3sakRG3v3mY--s4z5nPkghaI` | Google Doc |
| Public Test Folder | `1dy_gOwhrpgyKv_cGRO44a1AmXo45v4e3` | Folder |

---

## Evaluation File

See `evaluation.xml` for the 10 test questions.

---

## How to Run Evaluations

```bash
# Install dependencies
pip install anthropic mcp

# Set API key
export ANTHROPIC_API_KEY=your_api_key

# Run evaluation (stdio transport)
python scripts/evaluation.py \
  -t stdio \
  -c node \
  -a dist/index.js \
  tasks/00019-evaluate-project-strategy/02_subtask_evaluations/evaluation.xml
```

---

## Files

| File | Description |
|------|-------------|
| `README.md` | This file |
| `evaluation.xml` | 10 evaluation questions |
