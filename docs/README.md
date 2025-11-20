# Google Drive MCP Documentation

This directory contains documentation for using the Google Drive MCP server effectively.

## For Developers

### Development Workflows

- [**Autonomous Development Workflow**](./development/AUTONOMOUS_DEVELOPMENT_WORKFLOW.md) - Complete workflow for taking GitHub issues from creation to closure autonomously, following established patterns
- [**Known Issues**](./development/known_issues.md) - Tracking of resolved issues and their solutions

### Design Documentation

Core principles and API references for implementation:

- [**Design Principles**](./development/design/DESIGN_PRINCIPLES.md) - Master reference for all implementation decisions
- [**Lessons Learned**](./development/design/LESSONS_LEARNED.md) - Documented mistakes and how to avoid them
- [**API Mapping Strategy**](./development/design/API_MAPPING_STRATEGY.md) - How to map Google APIs to MCP tools

### API References

Complete audits of Google Workspace APIs:

- [**Google Drive API**](./development/design/api_reference_drive.md) - Drive, files, comments, permissions
- [**Google Docs API**](./development/design/api_reference_docs.md) - Document operations, formatting, structure
- [**Google Sheets API**](./development/design/api_reference_sheets.md) - Spreadsheet operations, data manipulation
- [**Google Slides API**](./development/design/api_reference_slides.md) - Presentation operations, slides, shapes

### Development Process

- [**Testing Strategy**](./development/testing/TESTING_STRATEGY.md) - Testing philosophy, requirements, and patterns
- [**Service Account Setup**](./development/SERVICE_ACCOUNT_IMPLEMENTATION.md) - Service account configuration for CI/CD
- [**Test Document Setup**](./development/TEST_DOCUMENT_SETUP.md) - Setting up test documents and OAuth

## For Users

Best practices and step-by-step guides for common tasks:

- [**Google Docs Formatting**](./workflows/google-docs-formatting.md) - Comprehensive guide to applying document styles, formatting content, and creating clean, well-structured Google Docs

## Directory Structure

```
docs/
├── README.md (this file)
├── development/
│   ├── design/                          # Design docs and API references
│   │   ├── DESIGN_PRINCIPLES.md
│   │   ├── LESSONS_LEARNED.md
│   │   ├── API_MAPPING_STRATEGY.md
│   │   ├── api_reference_drive.md
│   │   ├── api_reference_docs.md
│   │   ├── api_reference_sheets.md
│   │   ├── api_reference_slides.md
│   │   └── ... (implementation plans)
│   ├── testing/                         # Testing documentation
│   │   └── TESTING_STRATEGY.md
│   ├── AUTONOMOUS_DEVELOPMENT_WORKFLOW.md
│   ├── SERVICE_ACCOUNT_IMPLEMENTATION.md
│   ├── TEST_DOCUMENT_SETUP.md
│   └── known_issues.md
├── historical/                          # Issue investigations and decisions
│   ├── issue_00001/                     # TOC bug fix
│   ├── issue_00002/                     # 1:1 API mapping transition
│   ├── issue_00004/                     # Drive API Phase 1-3
│   ├── issue_00007/                     # Slides API implementation
│   ├── issue_00012/                     # Publishing strategy
│   ├── issue_00013/                     # Response size mitigation
│   └── issue_00014/                     # Colab API investigation
└── workflows/                           # User-facing guides
    └── google-docs-formatting.md
```

## Contributing

When you discover new patterns, edge cases, or best practices:
1. Update the relevant workflow document
2. Include real-world examples from actual usage
3. Document both incorrect and correct approaches
4. Update the "Last updated" date at the bottom of the file

## Future Topics

Potential workflow documents to add:
- Google Sheets: Formatting and formula best practices
- Google Slides: Layout and design patterns
- Folder organization: Naming conventions and structure
- Batch operations: Processing multiple documents efficiently
- Error handling: Common issues and solutions
