# Migration Guide: Grid.js to DataTables

## Overview

This guide documents the migration from Grid.js to DataTables for the Charlotte UDO frontend table rendering system. The migration was necessary to properly support colspan and rowspan attributes, which Grid.js had limitations with when using the "from HTML" feature.

## Why DataTables?

### Grid.js Limitations
- No native support for colspan/rowspan when using "from HTML" feature
- Complex workarounds required using h() function
- Limited documentation for advanced table structures
- Issues with server-side rendering (DOMParser errors)

### DataTables Advantages
- Native support for colspan and rowspan
- Handles complex HTML tables without modification
- Mature library with extensive documentation
- Built-in features like export to Excel/PDF/CSV
- Better performance with large datasets
- Wide ecosystem of plugins and extensions

## Migration Steps

### 1. Install DataTables Dependencies

```bash
npm install datatables.net-dt datatables.net-react jquery @types/jquery @types/datatables.net
```

### 2. Component Migration

#### Old Grid.js Component (udo-table.tsx)
```typescript
import { Grid, html } from 'gridjs';
import 'gridjs/dist/theme/mermaid.css';

export function UDOTable({ children, ...props }) {
  // Grid.js implementation
}
```

#### New DataTables Component (udo-table-datatables.tsx)
```typescript
import $ from 'jquery';
import 'datatables.net-dt';
import 'datatables.net-dt/css/dataTables.dataTables.css';

export function UDOTable({ children, ...props }) {
  // DataTables implementation
}
```

### 3. Update Import Statements

Replace all Grid.js imports:
```typescript
// Old
import { UDOGridJSTable } from './udo-gridjs-table';

// New
import { UDODataTableParsed } from './udo-datatable-parsed';
```

### 4. Update Table Rendering Logic

#### Grid.js Approach
```typescript
<UDOGridJSTable
  tableData={processedTableData}
  variant="zoning"
  searchable={true}
  height="auto"
/>
```

#### DataTables Approach
```typescript
<UDODataTableParsed
  table={processedTableData}
  options={{
    pageLength: 25,
    responsive: true,
    columnDefs: [
      { targets: 0, width: '60px' },
      { targets: 1, width: '300px' }
    ]
  }}
/>
```

## Component Mapping

| Grid.js Component | DataTables Component | Purpose |
|------------------|---------------------|----------|
| UDOGridJSTable | UDODataTableParsed | Render parsed table data |
| UDOGridJSFromHTML | UDODataTable | Enhance existing HTML table |
| UDOGridJSColspan | UDODataTable | Handle colspan/rowspan (native support) |
| UDOTable | UDOTable (updated) | MDX table wrapper |

## Configuration Differences

### Grid.js Configuration
```typescript
const config = {
  data: tableData,
  columns: headers,
  search: { enabled: true },
  sort: true,
  pagination: { limit: 10 },
  className: {
    container: 'gridjs-wrapper',
    table: 'gridjs-table'
  }
};
```

### DataTables Configuration
```typescript
const config: DataTables.Settings = {
  pageLength: 25,
  searching: true,
  ordering: true,
  paging: true,
  responsive: true,
  columnDefs: [
    { targets: '_all', className: 'text-center' }
  ]
};
```

## Styling Updates

### CSS Changes
Update your global CSS:
```css
/* Remove Grid.js styles */
/* @import '../styles/udo-gridjs.css'; */

/* Add DataTables customization */
.dataTables_wrapper {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.dataTables_wrapper .dataTables_filter input {
  border: 1px solid #D1D5DB;
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
}

.dataTables_wrapper .dataTables_paginate .paginate_button.current {
  background: #1E4E79 !important;
  color: white !important;
}
```

## Testing Checklist

- [ ] All tables render correctly
- [ ] Colspan and rowspan work properly
- [ ] Search functionality works
- [ ] Sorting works on all columns
- [ ] Pagination works for large tables
- [ ] Responsive design works on mobile
- [ ] No console errors
- [ ] Performance is acceptable

## Rollback Plan

If you need to rollback to Grid.js:
1. Keep Grid.js components in place during migration
2. Use feature flags to switch between implementations
3. Test thoroughly before removing Grid.js components
4. Keep this migration guide for reference

## Cleanup After Migration

Once migration is complete and tested:
1. Remove Grid.js dependencies from package.json
2. Delete Grid.js component files
3. Remove Grid.js CSS imports
4. Update documentation

## Known Issues and Solutions

### Issue: jQuery conflicts
**Solution**: Ensure jQuery is loaded before DataTables initialization

### Issue: Server-side rendering errors
**Solution**: Use 'use client' directive and initialize DataTables in useEffect

### Issue: Multiple initialization attempts
**Solution**: Use a ref to track initialization state

## Performance Considerations

- DataTables performs well with up to 10,000 rows client-side
- For larger datasets, consider server-side processing
- Use `deferRender: true` for better initial load performance
- Enable `responsive: true` for mobile optimization