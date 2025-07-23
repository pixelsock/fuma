# Handling Complex Tables with DataTables

## The Challenge

When working with complex HTML tables that have multiple header rows with colspan and rowspan attributes, DataTables can encounter issues with automatic column detection. The error "Requested unknown parameter 'X' for row Y, column Z" occurs because DataTables tries to map data to columns that don't exist due to the merged cells.

## Example Complex Table Structure

```html
<table>
  <thead>
    <tr>
      <th colspan="10">Main Header</th>
    </tr>
    <tr>
      <th rowspan="2">ID</th>
      <th rowspan="2">Name</th>
      <th colspan="4">Group 1</th>
      <th colspan="3">Group 2</th>
    </tr>
    <tr>
      <th>Sub 1</th>
      <th>Sub 2</th>
      <th>Sub 3</th>
      <th>Sub 4</th>
      <th>Sub A</th>
      <th>Sub B</th>
      <th>Sub C</th>
    </tr>
  </thead>
  <tbody>
    <!-- Data rows -->
  </tbody>
</table>
```

## Solutions

### 1. Use UDODataTableComplex Component

For tables with complex headers, use the `UDODataTableComplex` component which provides table enhancements without DataTables' automatic column detection:

```typescript
<UDODataTableComplex 
  htmlContent={complexTableHTML}
  tableId="complex-table"
  enableSearch={true}
  enablePaging={false}
/>
```

This component provides:
- Search functionality
- Hover effects
- Proper styling
- No column detection errors

### 2. Disable Sorting for Complex Tables

If using the standard DataTable component, disable sorting for complex tables:

```typescript
<UDODataTable 
  htmlContent={tableHTML}
  options={{
    ordering: false,  // Disable sorting
    searching: true,
    paging: true
  }}
/>
```

### 3. Use Simple Tables When Possible

For data that doesn't require complex headers, restructure the table to use simple column headers:

```html
<table>
  <thead>
    <tr>
      <th>ID</th>
      <th>Name</th>
      <th>Category</th>
      <th>Value</th>
    </tr>
  </thead>
  <tbody>
    <!-- Data rows -->
  </tbody>
</table>
```

## When to Use Each Approach

### Use DataTables Full Features
- Simple table structures
- Single header row
- No colspan/rowspan in headers
- Need sorting, pagination, and advanced features

### Use UDODataTableComplex
- Complex header structures
- Multiple header rows
- Extensive use of colspan/rowspan
- Only need search and basic enhancements

### Use Static Tables
- Very complex layouts
- Nested tables
- Non-tabular data presentations
- Print-optimized layouts

## Best Practices

1. **Test with Real Data**: Always test with actual UDO table structures
2. **Progressive Enhancement**: Start with basic HTML tables and add features as needed
3. **Accessibility**: Ensure complex tables remain accessible with proper headers and ARIA labels
4. **Performance**: For very large tables, consider server-side processing
5. **Mobile**: Test responsive behavior on mobile devices

## Migration Strategy

1. Identify all complex tables in your application
2. Categorize them by complexity level
3. Apply the appropriate solution for each category
4. Test thoroughly with real data
5. Monitor for console errors and warnings