# ⚠️ CRITICAL FILES - DO NOT DELETE

## Content Renderer Files

The following files are **ESSENTIAL** for the application to work and should **NEVER** be deleted:

### Primary Implementation
- **`udo-content-renderer-v3-optimized.tsx`** - Main content renderer with AG Grid table integration
  - Used by multiple other renderers as the core implementation
  - Handles table extraction and rendering
  - Integrates with AG Grid for table display
  - **DO NOT DELETE OR MODIFY WITHOUT BACKUP**

### Wrapper Files (depend on v3-optimized)
- `udo-content-renderer-v3.tsx` - Wrapper around v3-optimized
- `udo-content-renderer-optimized.tsx` - Wrapper around v3-optimized
- `udo-content-renderer-v4.tsx` - Extended version
- `udo-content-renderer-ssr.tsx` - SSR version
- `udo-content-renderer-v6-tabulator-simple.tsx` - Alternative version

## Table Component Files

### AG Grid Implementation
- **`udo-ag-grid-table.tsx`** - AG Grid table component
  - Renders tables with advanced features
  - 4-strategy header detection
  - HTML entity cleaning
  - Auto-height cells
  - Fullscreen mode
  - **DO NOT DELETE - This is the current table renderer**

### ⚠️ OBSOLETE - DO NOT USE
- ~~`udo-tanstack-table.tsx`~~ - **DELETED** - Replaced by AG Grid
  - If this file exists, it should be deleted
  - Uses @tanstack/react-table which is not installed
  - All references should use `udo-ag-grid-table.tsx` instead

## Key Integration Points

### Content Renderer Integration
```typescript
// Correct import in udo-content-renderer-v3-optimized.tsx:
import dynamic from 'next/dynamic';

const UDOAgGridTable = dynamic(
  () => import('./udo-ag-grid-table').then((mod) => ({ default: mod.UDOAgGridTable })),
  {
    ssr: false,
    loading: () => null,
  }
);

// Usage:
<UDOAgGridTable
  htmlString={tables[index].html}
  tableIndex={index}
/>
```

### Props
- **AG Grid**: `htmlString` (not `html`), `tableIndex`
- **TanStack** (obsolete): `html`, `externalTitle`, `tableIndex`

## If Files Are Deleted

If `udo-content-renderer-v3-optimized.tsx` is deleted:
1. The file must be recreated immediately
2. Use the version with dynamic import for AG Grid
3. Ensure `ssr: false` to prevent hydration errors
4. Use `loading: () => null` to avoid mismatches

## Common Errors and Solutions

### Error: "UDOTanstackTable is not defined"
**Solution**: Change import from `udo-tanstack-table` to `udo-ag-grid-table`

### Error: "Module not found: ./udo-tanstack-table"
**Solution**: The TanStack table is obsolete, use AG Grid instead

### Error: "Hydration failed"
**Solution**: Ensure AG Grid is dynamically imported with `ssr: false`

### Error: "Failed to read source code from udo-content-renderer-v3-optimized.tsx"
**Solution**: The file was deleted, must be recreated immediately

## Backup Location
If you need to restore these files, check:
- Git history (if committed)
- This conversation history
- Cursor's local file history

## Contact
If these files are deleted and need restoration, refer to the conversation where they were implemented with all features and fixes.


