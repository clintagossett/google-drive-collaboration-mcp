# Contributing to Google Drive Collaboration MCP

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)

## Code of Conduct

This project follows standard open-source community guidelines. Please be respectful and constructive in all interactions.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Set up the development environment** (see below)
4. **Create a feature branch** from `master`
5. **Make your changes** following our guidelines
6. **Submit a pull request**

## Development Setup

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+
- Google Cloud Project with enabled APIs:
  - Google Drive API
  - Google Docs API
  - Google Sheets API
  - Google Slides API

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/google-drive-collaboration-mcp.git
cd google-drive-collaboration-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

### OAuth Setup

See `docs/development/TEST_DOCUMENT_SETUP.md` for detailed OAuth configuration instructions.

## Development Workflow

### **CRITICAL: Tests Are Part of Implementation**

This project follows a strict **per-tool testing** approach:

1. **Read** API documentation for the specific operation
2. **Write** Zod schema with validation
3. **Write** 5+ unit tests for the schema
4. **Run** `npm test` - verify tests pass
5. **Write** tool definition
6. **Write** case handler implementation
7. **Run** `npm test` again - verify all tests still pass
8. **Run** `npm run build` - verify build succeeds
9. **Mark** tool as COMPLETE
10. **Move** to next tool

**❌ NEVER implement multiple tools before writing tests!**

### Design Principles

**Before starting any work**, read these documents:

1. `docs/development/design/DESIGN_PRINCIPLES.md` - Master reference
2. `docs/development/design/LESSONS_LEARNED.md` - Past mistakes
3. `docs/development/design/API_MAPPING_STRATEGY.md` - How we map APIs

**Key Rules**:
- ✅ **1:1 API Mapping**: Each tool maps to exactly one API method
- ✅ **Thin Layer**: Pass-through to Google APIs, no business logic
- ✅ **Complete Parameter Support**: All API parameters available
- ✅ **Per-Tool Testing**: Tests written alongside each tool
- ✅ **TypeScript Strict Mode**: Full type safety

## Pull Request Process

### Before Submitting

- [ ] All tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Code follows TypeScript strict mode
- [ ] New tools have 5+ unit tests
- [ ] Documentation updated (if applicable)
- [ ] Commit messages follow convention (see below)

### Commit Message Convention

We use conventional commits:

```
type(scope): description

- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- test: Test additions/changes
- refactor: Code refactoring
- chore: Maintenance tasks
```

**Examples**:
```
feat: Add sheets_mergeCells tool with validation
fix: Prevent drive_getFile from returning trashed files (#11)
docs: Update README with performance tips
test: Add unit tests for drive_listFiles schema
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] All tests passing
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Prefer interfaces over types for objects
- Use explicit return types for functions
- Avoid `any` type (use `unknown` if needed)

### Naming Conventions

- **Tools**: `{service}_{operation}` (e.g., `drive_listFiles`, `sheets_appendValues`)
- **Schemas**: `{Service}{Operation}Schema` (e.g., `DriveListFilesSchema`)
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Files**: kebab-case (e.g., `drive-list-files.test.ts`)

### Code Structure

**Schema Definition** (src/index.ts ~line 190+):
```typescript
const DriveGetFileSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
  fields: z.string().optional(),
  // ... other parameters
});
```

**Tool Definition** (src/index.ts ~line 2000+):
```typescript
{
  name: "drive_getFile",
  description: "Get a file's metadata by ID. Maps directly to files.get in Drive API v3.",
  inputSchema: {
    type: "object",
    properties: {
      fileId: { type: "string", description: "File ID" },
      // ... other properties
    },
    required: ["fileId"]
  }
}
```

**Case Handler** (src/index.ts ~line 4800+):
```typescript
case "drive_getFile": {
  const validation = DriveGetFileSchema.safeParse(request.params.arguments);
  if (!validation.success) {
    return errorResponse(validation.error.errors[0].message);
  }
  const args = validation.data;

  // Call Google API
  const result = await drive.files.get({
    fileId: args.fileId,
    fields: args.fields
  });

  return {
    content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
    isError: false
  };
}
```

## Testing Requirements

### Unit Tests (Required)

**Minimum**: 5 tests per tool

**Test File Location**: `tests/unit/{toolName}.test.ts`

**Example** (`tests/unit/drive_getFile.test.ts`):
```typescript
import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const DriveGetFileSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
  fields: z.string().optional()
});

describe('drive_getFile - Unit Tests', () => {
  it('should validate minimal input', () => {
    const result = DriveGetFileSchema.safeParse({ fileId: 'abc123' });
    expect(result.success).toBe(true);
  });

  it('should reject missing fileId', () => {
    const result = DriveGetFileSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  // ... 3+ more tests
});
```

### Test Coverage

- Target: ≥80% coverage
- Run: `npm run test:coverage`
- Focus on schema validation and edge cases

### Running Tests

```bash
# All unit tests
npm test

# Watch mode (development)
npm run test:watch

# With coverage
npm run test:coverage

# Integration tests (requires OAuth setup)
npm run test:integration
```

## Documentation

### Tool Documentation

Every new tool needs:
1. **Docstring** in tool definition
2. **Example** in relevant API reference doc
3. **README update** (if adding new capability)

### API Reference Updates

When adding tools, update the relevant API reference:
- `docs/development/design/api_reference_drive.md`
- `docs/development/design/api_reference_docs.md`
- `docs/development/design/api_reference_sheets.md`
- `docs/development/design/api_reference_slides.md`

### Developer Documentation

For significant features, create documentation in `docs/development/`.

For bug fixes with extensive investigation, create documentation in `docs/historical/issue_XXXXX/`.

## Questions?

- **Bugs**: Open an issue using the bug report template
- **Features**: Open an issue using the feature request template
- **Discussions**: Use GitHub Discussions
- **General Questions**: Check `docs/development/` first

## Recognition

Contributors will be recognized in:
- Git commit history
- Release notes
- Project acknowledgments

Thank you for contributing! 🎉
