# Duplicate Tools Analysis Report

**Date**: 2025-01-19
**Version**: 0.0.1
**Analyst**: Claude Code

## Executive Summary

Analysis of 8 legacy tools (old naming scheme) vs 21 modern `drive_*` tools reveals **significant functional overlap**. 6 of 8 legacy tools are **fully redundant**, while 2 provide convenience features that could be migrated.

## Detailed Analysis

### 1. `search` 🔴 DUPLICATE

**Status**: Fully redundant
**Duplicate of**: `drive_listFiles`

| Feature | search | drive_listFiles |
|---------|--------|-----------------|
| API Call | `drive.files.list()` | `drive.files.list()` |
| Query Support | Fixed pattern only | Full query string |
| Pagination | Fixed 10 items | Configurable pageSize |
| Fields | Fixed fields | Configurable fields |
| Shared Drives | ❌ No | ✅ Optional |
| Flexibility | Low | High |

**Implementation Comparison**:
```typescript
// search (line 5004)
const res = await drive.files.list({
  q: `fullText contains '${escapedQuery}' and trashed = false`,
  pageSize: 10,
  fields: "files(id, name, mimeType, modifiedTime, size)",
});

// drive_listFiles (line 5427) - can do everything search does + more
const params: any = {};
if (args.q) params.q = args.q;
if (args.pageSize) params.pageSize = args.pageSize;
if (args.pageToken) params.pageToken = args.pageToken;
if (args.fields) params.fields = args.fields;
// ... plus orderBy, spaces, corpora, includeItemsFromAllDrives, supportsAllDrives
```

**Recommendation**: ❌ **Remove** - All functionality covered by `drive_listFiles`

---

### 2. `createTextFile` 🟡 PARTIAL OVERLAP

**Status**: Provides convenience features
**Similar to**: `drive_createFile`

| Feature | createTextFile | drive_createFile |
|---------|----------------|------------------|
| API Call | `drive.files.create()` | `drive.files.create()` |
| File Type | .txt/.md only | Any mimeType |
| Validation | ✅ Extension check | ❌ None |
| Existence Check | ✅ Yes | ❌ No |
| Path Resolution | ✅ Yes (resolveFolderId) | ❌ No |
| Content Upload | ✅ Yes (media) | ❌ No (metadata only) |
| Shared Drives | ❌ No | ✅ Optional |

**Key Differences**:
- `createTextFile` uploads content with the file (media upload)
- `createTextFile` validates .txt/.md extensions
- `createTextFile` checks for existing files with same name
- `drive_createFile` only creates metadata (no content)

**Recommendation**: 🔄 **Migrate Features** - Add content upload to `drive_createFile` or rename legacy tool to `drive_createTextFile`

---

### 3. `updateTextFile` 🟡 PARTIAL OVERLAP

**Status**: Provides convenience features
**Similar to**: `drive_updateFile`

| Feature | updateTextFile | drive_updateFile |
|---------|----------------|------------------|
| API Call | `drive.files.update()` | `drive.files.update()` |
| File Type | .txt/.md only | Any file |
| MIME Type Check | ✅ Yes | ❌ No |
| Extension Validation | ✅ Yes | ❌ No |
| Content Upload | ✅ Yes (media) | ❌ No (metadata only) |
| Shared Drives | ❌ No | ✅ Optional |

**Key Differences**:
- `updateTextFile` updates file content (media upload)
- `updateTextFile` validates MIME type before update
- `drive_updateFile` only updates metadata (name, parents, etc.)

**Recommendation**: 🔄 **Migrate Features** - Add content upload to `drive_updateFile` or rename legacy tool to `drive_updateTextFile`

---

### 4. `createFolder` 🔴 DUPLICATE

**Status**: Fully redundant
**Duplicate of**: `drive_createFile`

| Feature | createFolder | drive_createFile |
|---------|--------------|------------------|
| API Call | `drive.files.create()` | `drive.files.create()` |
| Creates Folders | ✅ Yes | ✅ Yes (with mimeType) |
| Path Resolution | ✅ Yes | ❌ No |
| Existence Check | ✅ Yes | ❌ No |
| Shared Drives | ❌ No | ✅ Optional |

**Implementation**:
```typescript
// createFolder (line 5130)
const folderMetadata = {
  name: args.name,
  mimeType: FOLDER_MIME_TYPE, // 'application/vnd.google-apps.folder'
  parents: [parentFolderId]
};

// drive_createFile can do the same:
// Just set mimeType: 'application/vnd.google-apps.folder'
```

**Recommendation**: ❌ **Remove** - Use `drive_createFile` with `mimeType: 'application/vnd.google-apps.folder'`

---

### 5. `listFolder` 🔴 DUPLICATE

**Status**: Fully redundant
**Duplicate of**: `drive_listFiles`

| Feature | listFolder | drive_listFiles |
|---------|------------|-----------------|
| API Call | `drive.files.list()` | `drive.files.list()` |
| Query | Fixed pattern | Configurable |
| Pagination | ✅ Yes | ✅ Yes |
| Fields | Fixed | Configurable |
| Shared Drives | ❌ No | ✅ Optional |

**Implementation**:
```typescript
// listFolder (line 5162)
const res = await drive.files.list({
  q: `'${targetFolderId}' in parents and trashed = false`,
  pageSize: args.pageSize || 50,
  pageToken: args.pageToken,
  fields: 'nextPageToken, files(id, name, mimeType, modifiedTime, size)'
});

// drive_listFiles can do the same by setting:
// q: "'folderId' in parents and trashed = false"
```

**Recommendation**: ❌ **Remove** - All functionality covered by `drive_listFiles`

---

### 6. `deleteItem` 🔴 DUPLICATE

**Status**: Fully redundant
**Duplicate of**: `drive_updateFile` (soft delete) OR `drive_deleteFile` (permanent)

| Feature | deleteItem | drive_updateFile | drive_deleteFile |
|---------|------------|------------------|------------------|
| API Call | `drive.files.update()` | `drive.files.update()` | `drive.files.delete()` |
| Delete Type | Soft (trash) | Soft (trashed=true) | Permanent |
| Shared Drives | ❌ No | ✅ Optional | ✅ Optional |

**Implementation**:
```typescript
// deleteItem (line 5197)
await drive.files.update({
  fileId: args.itemId,
  requestBody: { trashed: true }
});

// drive_updateFile can do the same:
// Just set trashed: true in requestBody

// drive_deleteFile does permanent deletion
await drive.files.delete({ fileId: args.fileId });
```

**Recommendation**: ❌ **Remove** - Use `drive_updateFile` with `trashed: true` for soft delete

---

### 7. `renameItem` 🔴 DUPLICATE

**Status**: Fully redundant (with minor validation)
**Duplicate of**: `drive_updateFile`

| Feature | renameItem | drive_updateFile |
|---------|------------|------------------|
| API Call | `drive.files.update()` | `drive.files.update()` |
| Rename | ✅ Yes | ✅ Yes |
| Text File Validation | ✅ Yes | ❌ No |
| Shared Drives | ❌ No | ✅ Optional |

**Implementation**:
```typescript
// renameItem (line 5224)
await drive.files.update({
  fileId: args.itemId,
  requestBody: { name: args.newName },
  fields: 'id, name, modifiedTime'
});

// drive_updateFile does the same:
// Just set name: newName in requestBody
```

**Recommendation**: ❌ **Remove** - Use `drive_updateFile` with `name` parameter

---

### 8. `moveItem` 🔴 DUPLICATE

**Status**: Fully redundant
**Duplicate of**: `drive_updateFile`

| Feature | moveItem | drive_updateFile |
|---------|----------|------------------|
| API Call | `drive.files.update()` | `drive.files.update()` |
| Move Files | ✅ Yes | ✅ Yes |
| Path Resolution | ✅ Yes | ❌ No |
| Safety Check | ✅ Yes (no self-move) | ❌ No |
| Shared Drives | ❌ No | ✅ Optional |

**Implementation**:
```typescript
// moveItem (line 5258)
await drive.files.update({
  fileId: args.itemId,
  addParents: destinationFolderId,
  removeParents: item.data.parents?.join(',') || '',
  fields: 'id, name, parents'
});

// drive_updateFile can do the same:
// Set parents: [newParentId] in requestBody
```

**Recommendation**: ❌ **Remove** - Use `drive_updateFile` with `parents` parameter

---

## Summary Table

| Legacy Tool | Status | Duplicate Of | Unique Features | Recommendation |
|-------------|--------|--------------|-----------------|----------------|
| search | 🔴 Full Dup | drive_listFiles | None | ❌ Remove |
| createTextFile | 🟡 Partial | drive_createFile | Content upload, validation | 🔄 Migrate |
| updateTextFile | 🟡 Partial | drive_updateFile | Content upload, validation | 🔄 Migrate |
| createFolder | 🔴 Full Dup | drive_createFile | Path resolution, existence check | ❌ Remove |
| listFolder | 🔴 Full Dup | drive_listFiles | None | ❌ Remove |
| deleteItem | 🔴 Full Dup | drive_updateFile | None | ❌ Remove |
| renameItem | 🔴 Full Dup | drive_updateFile | Text file validation | ❌ Remove |
| moveItem | 🔴 Full Dup | drive_updateFile | Path resolution, safety check | ❌ Remove |

## Recommendations

### Immediate Actions

1. **Remove 6 Fully Redundant Tools**:
   - ❌ `search` → Use `drive_listFiles`
   - ❌ `createFolder` → Use `drive_createFile`
   - ❌ `listFolder` → Use `drive_listFiles`
   - ❌ `deleteItem` → Use `drive_updateFile` (soft) or `drive_deleteFile` (permanent)
   - ❌ `renameItem` → Use `drive_updateFile`
   - ❌ `moveItem` → Use `drive_updateFile`

2. **Migrate 2 Tools with Unique Features**:
   - 🔄 Rename `createTextFile` → `drive_createTextFile`
   - 🔄 Rename `updateTextFile` → `drive_updateTextFile`
   - Add content upload capability to generic tools (future enhancement)

### Migration Impact

**Breaking Changes**: Yes (for users using old tool names)

**Mitigation**:
1. Document deprecated tools in README
2. Add deprecation warnings in tool descriptions
3. Provide migration guide showing equivalent `drive_*` tool usage
4. Consider keeping deprecated tools for 1-2 versions with warnings

### Benefits

- **Reduced maintenance**: -6 tools (from 154 to 148)
- **Consistent naming**: All Drive tools use `drive_*` prefix
- **Shared drive support**: All modern tools support `supportsAllDrives`
- **Better API coverage**: Modern tools expose full Google Drive API parameters
- **Less confusion**: Users won't wonder which tool to use

## Conclusion

**6 of 8 legacy tools (75%) are fully redundant** and should be removed. The remaining 2 tools provide convenience features for text file operations that should be migrated to the modern naming scheme.

**Next Steps**:
1. Review and approve this analysis
2. Create deprecation plan
3. Update documentation
4. Implement tool removal/migration
5. Test with shared drives enabled
