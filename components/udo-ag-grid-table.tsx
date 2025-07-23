'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ColGroupDef, GridOptions, ModuleRegistry, themeQuartz, GridApi } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';

// Register AG-Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface UDOAgGridTableProps {
  htmlString: string;
  tableIndex?: number;
  onReady?: () => void;
}

interface ParsedTable {
  title: React.ReactNode;
  columnDefs: (ColDef | ColGroupDef)[];
  rows: any[];
  cellStyles: Record<string, Record<string, any>>;
  cellSpans: Record<string, number>; // rowIndex_colIndex -> colspan
}

function extractFormattedContent(cell: Element): React.ReactNode {
  // Clone the cell to avoid modifying the original
  const clonedCell = cell.cloneNode(true) as Element;
  
  // Remove any unwanted elements but preserve formatting
  const unwantedElements = clonedCell.querySelectorAll('script, style, noscript');
  unwantedElements.forEach(el => el.remove());
  
  // Convert HTML directly to React elements
  function processNode(node: Node): React.ReactNode {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      // Preserve non-breaking spaces
      if (text === '\u00A0' || text === ' ') {
        return '\u00A0';
      }
      return text;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();
      const children = Array.from(element.childNodes).map(processNode);
      
      // Handle different formatting elements
      switch (tagName) {
        case 'strong':
        case 'b':
          return React.createElement('strong', { key: Math.random() }, children);
        case 'em':
        case 'i':
          return React.createElement('em', { key: Math.random() }, children);
        case 'sup':
          return React.createElement('sup', { key: Math.random() }, children);
        case 'sub':
          return React.createElement('sub', { key: Math.random() }, children);
        case 'div':
          // Check for indentation/padding styles
          const divStyle = element.getAttribute('style') || '';
          const divClasses = element.className || '';
          let paddingLeft = 0;
          
          // Extract padding-left value
          const paddingMatch = divStyle.match(/padding-left:\s*(\d+)px/);
          if (paddingMatch) {
            paddingLeft = parseInt(paddingMatch[1]);
          } else if (divClasses.includes('indent-1')) {
            paddingLeft = 20;
          } else if (divClasses.includes('indent-2')) {
            paddingLeft = 40;
          }
          
          // Return div with line break after (divs are block elements)
          return React.createElement(React.Fragment, { key: Math.random() }, [
            React.createElement('div', { 
              style: paddingLeft > 0 ? { paddingLeft: `${paddingLeft}px` } : {},
              key: Math.random() + '_div'
            }, children)
          ]);
        case 'p':
          // Paragraphs should also be block-level
          const pStyle = element.getAttribute('style') || '';
          let pPaddingLeft = 0;
          
          const pPaddingMatch = pStyle.match(/padding-left:\s*(\d+)px/);
          if (pPaddingMatch) {
            pPaddingLeft = parseInt(pPaddingMatch[1]);
          }
          
          return React.createElement(React.Fragment, { key: Math.random() }, [
            React.createElement('div', { 
              style: pPaddingLeft > 0 ? { paddingLeft: `${pPaddingLeft}px` } : {},
              key: Math.random() + '_p'
            }, children)
          ]);
        case 'br':
          return React.createElement('br', { key: Math.random() });
        case 'span':
          // Preserve span with its styling
          const spanStyle = element.getAttribute('style') || '';
          const styleObj: any = {};
          
          if (spanStyle.includes('color:')) {
            const colorMatch = spanStyle.match(/color:\s*([^;]+)/);
            if (colorMatch) {
              styleObj.color = colorMatch[1].trim();
            }
          }
          
          return React.createElement('span', { 
            key: Math.random(),
            style: Object.keys(styleObj).length > 0 ? styleObj : undefined
          }, children);
        default:
          return children;
      }
    }
    return null;
  }
  
  const result = processNode(clonedCell);
  
  return React.createElement('div', { 
    style: { 
      whiteSpace: 'pre-wrap', 
      wordWrap: 'break-word',
      lineHeight: '1.4'
    } 
  }, result);
}

function parseHTMLTable(htmlString: string): ParsedTable | null {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  
  // Look for the table wrapper structure
  const tableWrapper = doc.querySelector('.table-wrapper');
  let title: React.ReactNode = '';
  let table: Element | null = null;
  let titleRowIndex = -1;
  
  if (tableWrapper) {
    // Extract title from the separate div
    const titleDiv = tableWrapper.querySelector('.table-title-row');
    if (titleDiv) {
      title = titleDiv.textContent?.trim() || '';
    }
    table = tableWrapper.querySelector('table');
  } else {
    // Fallback to direct table selection
    table = doc.querySelector('table');
  }
  
  if (!table) {
    console.error('No table found in HTML string');
    return null;
  }
  
  const allRows = table.querySelectorAll('tr');
  console.log('Parsing table with', allRows.length, 'rows');
  
  // If no title found in wrapper, check if first row is a title row
  if (!title && allRows.length > 0) {
    const firstRow = allRows[0];
    const firstRowCells = firstRow.querySelectorAll('td');
    
    // Check if it's a single cell with colspan and contains "Table X-X:"
    if (firstRowCells.length === 1) {
      const cell = firstRowCells[0];
      const colspan = parseInt(cell.getAttribute('colspan') || cell.getAttribute('data-colspan') || '1');
      const cellText = cell.textContent?.trim() || '';
      
      // If it spans multiple columns and contains "Table", it's likely a title
      if (colspan >= 3 && cellText.includes('Table') && cellText.includes(':')) {
        title = extractFormattedContent(cell);
        titleRowIndex = 0;
      }
    }
  }

  // Find header row - first row with dark blue background (after title row)
  const headerRows: Element[] = [];
  const headerRowIndices: Set<number> = new Set();
  
  // Start looking after the title row (if there is one)
  const startIndex = titleRowIndex + 1;
  
  // The header row is the first row with multiple cells having dark blue background
  for (let i = startIndex; i < allRows.length; i++) {
    const row = allRows[i];
    const cells = row.querySelectorAll('td');
    
    // Count cells with header background color
    let headerCellCount = 0;
    for (const cell of cells) {
      const bgColor = cell.getAttribute('data-bg-color') || '';
      const style = cell.getAttribute('style') || '';
      
      // Header cells have dark blue background (#1f4e79)
      if (bgColor === '1F4E79' || style.includes('#1f4e79')) {
        headerCellCount++;
      }
    }
    
    // If most cells have header styling, it's the header row
    if (headerCellCount >= 3) {
      headerRows.push(row);
      headerRowIndices.add(i);
      break; // Only take the first header row
    }
  }

  // Get body rows (skip title and header rows)
  const bodyRows: Element[] = [];
  
  // Get all rows that aren't title or headers
  allRows.forEach((row, index) => {
    if (index !== titleRowIndex && !headerRowIndices.has(index)) {
      bodyRows.push(row);
    }
  });
  
  console.log('Table structure:', {
    totalRows: allRows.length,
    titleText: title || 'No title',
    headerRowCount: headerRows.length,
    headerIndices: Array.from(headerRowIndices),
    headerRowContent: headerRows.length > 0 ? headerRows[0].textContent?.trim().substring(0, 100) : 'No header',
    bodyRowCount: bodyRows.length,
    firstBodyRowContent: bodyRows.length > 0 ? bodyRows[0].textContent?.trim().substring(0, 50) : 'No body rows'
  });
  
  // Calculate max columns needed based on actual column structure
  let maxColumns = 0;
  allRows.forEach((row) => {
    let colCount = 0;
    row.querySelectorAll('td, th').forEach((cell) => {
      const colspan = parseInt(cell.getAttribute('colspan') || cell.getAttribute('data-colspan') || '1');
      colCount += colspan;
    });
    maxColumns = Math.max(maxColumns, colCount);
  });

  // Parse row data and store cell spans
  const rows: any[] = [];
  const cellSpans: Record<string, number> = {};
  const cellStyles: Record<string, Record<string, any>> = {};
  
  bodyRows.forEach((row, rowIndex) => {
    const rowData: Record<string, any> = {};
    const cells = row.querySelectorAll('td, th');
    
    let colIndex = 0;
    cells.forEach((cell) => {
      const colspan = parseInt(cell.getAttribute('colspan') || cell.getAttribute('data-colspan') || '1');
      const text = cell.textContent?.trim() || '';
      const style = parseInlineStyles(cell.getAttribute('style'));
      
      // Store the value in the first column of the span
      const field = `field_${colIndex}`;
      // Extract and preserve formatting
      const formattedContent = extractFormattedContent(cell);
      rowData[field] = formattedContent;
      
      // Store colspan information for AG-Grid
      if (colspan > 1) {
        cellSpans[`${rowIndex}_${colIndex}`] = colspan;
      }
      
      // Store styles including data attributes
      const enhancedStyle = { ...style };
      
      // Add vertical alignment from data attributes
      const valign = cell.getAttribute('data-valign');
      if (valign === 'center') {
        enhancedStyle['vertical-align'] = 'middle';
      }
      
      // Add text alignment from data attributes
      const align = cell.getAttribute('data-align');
      if (align) {
        enhancedStyle['text-align'] = align;
      }
      
      // Add background color from data attributes
      const bgColor = cell.getAttribute('data-bg-color');
      if (bgColor) {
        enhancedStyle['background-color'] = `#${bgColor.toLowerCase()}`;
      }
      
      if (Object.keys(enhancedStyle).length > 0) {
        const cellKey = `${rowIndex}_${field}`;
        cellStyles[cellKey] = enhancedStyle;
      }
      
      colIndex += colspan;
    });
    
    // Fill in any missing columns with empty values
    for (let i = 0; i < maxColumns; i++) {
      if (!rowData[`field_${i}`]) {
        rowData[`field_${i}`] = '';
      }
    }
    
    rows.push(rowData);
  });
  
  // Create column definitions - one column per actual column in the table
  const columnDefs: (ColDef | ColGroupDef)[] = [];
  
  // Ensure we have at least one column
  if (maxColumns === 0) {
    console.warn('No columns detected, using default of 1');
    maxColumns = 1;
  }
  
  // Create simple columns based on maxColumns
  for (let i = 0; i < maxColumns; i++) {
    let headerText = '';
    let headerStyle = {};
    
    // Get header text from the header rows
    if (headerRows.length > 0) {
      const headerRow = headerRows[0];
      const headerCells = headerRow.querySelectorAll('td');
      
      // Find which header cell covers this column
      let currentCol = 0;
      for (const cell of headerCells) {
        const colspan = parseInt(cell.getAttribute('colspan') || cell.getAttribute('data-colspan') || '1');
        if (i >= currentCol && i < currentCol + colspan) {
          const cellText = cell.textContent?.trim() || '';
          // For the first two columns (which are merged in the header), leave empty
          // Otherwise use the cell text
          if (currentCol === 0 && colspan === 2) {
            // This is the merged empty cell at the start
            headerText = '';
          } else if (cellText && cellText !== '\u00A0') {
            headerText = cellText;
          }
          headerStyle = parseInlineStyles(cell.getAttribute('style'));
          break;
        }
        currentCol += colspan;
      }
    }
    
          const colDef: ColDef = {
        headerName: headerText,
        field: `field_${i}`,
        sortable: false,
        resizable: true,
        minWidth: 80,
        maxWidth: 400,
        width: 150,
        headerClass: '',
        wrapText: true,
        autoHeight: true,
        cellStyle: (params: any) => getCellStyle(params, cellStyles),
        valueFormatter: (params: any) => {
          // Handle React elements and objects
          if (!params.value) return '';
          if (typeof params.value === 'string') return params.value;
          if (React.isValidElement(params.value)) {
            // For React elements, we need to use cellRenderer instead
            return '';
          }
          return String(params.value);
        },
        cellRenderer: (params: any) => {
          if (!params.value) return '';
          // If it's a React element, render it
          if (React.isValidElement(params.value)) {
            return params.value;
          }
          // Otherwise return the value as is
          return params.value;
        },
        colSpan: (params: any) => {
          if (!params.data) return 1;
          const rowIndex = params.node?.rowIndex ?? 0;
          const spanKey = `${rowIndex}_${i}`;
          return cellSpans[spanKey] || 1;
        }
      };
    
    columnDefs.push(colDef);
  }

  console.log('Table parsed successfully:', {
    title: typeof title === 'string' ? title : 'React Node',
    columns: columnDefs.length,
    rows: rows.length,
    cellSpans: Object.keys(cellSpans).length,
    firstRowData: rows.length > 0 ? Object.keys(rows[0]).map(k => `${k}: ${typeof rows[0][k]}`) : 'No rows'
  });
  
  return { title, columnDefs, rows, cellStyles, cellSpans };
}

function parseInlineStyles(styleString: string | null): Record<string, any> {
  const style: Record<string, any> = {};
  if (styleString) {
    styleString.split(';').forEach(rule => {
      const [property, value] = rule.split(':').map(s => s.trim());
      if (property && value) {
        style[property] = value;
      }
    });
  }
  return style;
}

function getHeaderClass(style: Record<string, any>): string {
  // Using theme parameters instead of CSS classes
  return '';
}

function getCellStyle(params: any, cellStyles: Record<string, Record<string, any>>): any {
  const cellKey = `${params.rowIndex}_${params.column.colId}`;
  const style = cellStyles[cellKey] || {};
  
  const agStyle: any = {
    display: 'flex',
    alignItems: 'center'
  };
  
  if (style.color) agStyle.color = style.color;
  if (style['background-color']) agStyle.backgroundColor = style['background-color'];
  if (style['font-weight']) agStyle.fontWeight = style['font-weight'];
  if (style['text-align']) {
    agStyle.textAlign = style['text-align'];
    if (style['text-align'] === 'center') {
      agStyle.justifyContent = 'center';
    } else if (style['text-align'] === 'right') {
      agStyle.justifyContent = 'flex-end';
    }
  }
  
  return agStyle;
}

export function UDOAgGridTable({ htmlString, tableIndex = 0, onReady }: UDOAgGridTableProps) {
  const [rowData, setRowData] = useState<any[]>([]);
  const [columnDefs, setColumnDefs] = useState<(ColDef | ColGroupDef)[]>([]);
  const [title, setTitle] = useState<React.ReactNode>('');
  const [searchText, setSearchText] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [canScrollHorizontally, setCanScrollHorizontally] = useState<boolean>(false);
  const gridRef = useRef<AgGridReact>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Emit performance tracking event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('table-render-start'));
    }
    
    const parsed = parseHTMLTable(htmlString);
    if (!parsed) return;

    setTitle(parsed.title);
    setColumnDefs(parsed.columnDefs);
    setRowData(parsed.rows);
    
    // Table data is ready
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('table-render-end'));
    }
  }, [htmlString]);

  // Handle search
  useEffect(() => {
    if (gridRef.current?.api) {
      gridRef.current.api.setGridOption('quickFilterText', searchText);
    }
  }, [searchText]);

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Check for horizontal scroll
  useEffect(() => {
    const checkScroll = () => {
      if (gridWrapperRef.current) {
        const wrapper = gridWrapperRef.current;
        const gridBody = wrapper.querySelector('.ag-body-horizontal-scroll-viewport');
        if (gridBody) {
          const hasScroll = gridBody.scrollWidth > gridBody.clientWidth;
          setCanScrollHorizontally(hasScroll);
        }
      }
    };

    // Check on mount and resize
    checkScroll();
    window.addEventListener('resize', checkScroll);
    
    // Check after grid is ready and after every render
    const interval = setInterval(checkScroll, 500);

    return () => {
      window.removeEventListener('resize', checkScroll);
      clearInterval(interval);
    };
  }, [rowData, columnDefs]);

  // Scroll functions
  const scrollLeft = () => {
    if (gridWrapperRef.current) {
      const scrollElement = gridWrapperRef.current.querySelector('.ag-body-horizontal-scroll-viewport');
      if (scrollElement) {
        scrollElement.scrollBy({ left: -200, behavior: 'smooth' });
      }
    }
  };

  const scrollRight = () => {
    if (gridWrapperRef.current) {
      const scrollElement = gridWrapperRef.current.querySelector('.ag-body-horizontal-scroll-viewport');
      if (scrollElement) {
        scrollElement.scrollBy({ left: 200, behavior: 'smooth' });
      }
    }
  };

  const customTheme = useMemo(() => 
    themeQuartz.withParams({
      headerTextColor: '#ffffff',
      headerFontWeight: 600,
      columnBorder: true,
      headerBackgroundColor: '#1f4e79',
      headerColumnResizeHandleColor: 'rgba(179, 168, 168, 0.77)',
      headerHeight: 45,
      headerColumnBorder: { color: '#1f4e79' },
    }), []);

  const autoSizeStrategy = useMemo(() => ({
    type: 'fitCellContents' as const,
    defaultMinWidth: 100,
    defaultMaxWidth: 500,
  }), []);

  const defaultColDef = useMemo(() => ({
    sortable: false,
    resizable: true,
    minWidth: 100,
    wrapText: true,
    autoHeight: true,
    cellStyle: {
      display: 'flex',
      alignItems: 'center',
      lineHeight: '1.2'
    }
  }), []);

  const defaultColGroupDef = useMemo(() => ({
    headerClass: 'ag-header-group-default',
    marryChildren: true,
    autoHeaderHeight: true,
    suppressStickyLabel: false,
  }), []);

  if (rowData.length === 0) {
    console.warn('No row data found for table', tableIndex);
    // Still render the table even with no data rows if we have columns
    if (columnDefs.length === 0) {
      return null;
    }
  }

  return (
    <div ref={containerRef} className={`ag-grid-container ${isFullscreen ? 'fullscreen' : ''}`} style={{ width: '100%' }}>
      <style>{`
        .ag-grid-container {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          background: white;
          padding: 10px;
        }
        .ag-grid-container.fullscreen {
          height: 100vh !important;
          display: flex;
          flex-direction: column;
        }
        .ag-grid-title-section {
          padding: 8px 0;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          text-align: center;
          margin: -10px -10px 10px -10px;
        }
        .ag-grid-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
        }
        .ag-grid-header-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          margin: -10px -10px 10px -10px;
          padding-left: 10px;
          padding-right: 10px;
        }
        .ag-grid-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .ag-grid-search {
          position: relative;
        }
        .ag-grid-search input {
          padding: 6px 12px 6px 36px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          width: 250px;
          outline: none;
          background-color: #ffffff;
        }
        .ag-grid-search input:focus {
          border-color: var(--ag-header-background-color);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .ag-grid-search svg {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #6b7280;
        }
        .ag-grid-fullscreen-btn {
          padding: 6px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          color: #374151;
          transition: all 0.2s;
        }
        .ag-grid-fullscreen-btn:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
        }
        .ag-grid-fullscreen-btn svg {
          width: 16px;
          height: 16px;
        }
        .ag-grid-scroll-btn {
          padding: 6px 8px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          font-size: 14px;
          color: #374151;
          transition: all 0.2s;
        }
        .ag-grid-scroll-btn:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
        }
        .ag-grid-scroll-btn svg {
          width: 16px;
          height: 16px;
        }
        .ag-grid-wrapper {
          flex: 1;
          overflow: hidden;
          max-height: 800px;
          position: relative;
        }
        .ag-grid-container:not(.fullscreen) .ag-grid-wrapper {
          max-height: 800px;
        }
        .ag-grid-wrapper .ag-root-wrapper {
          max-height: 800px;
        }
        .ag-theme-quartz {
          --ag-border-color: #e5e7eb;
          --ag-header-background-color: #f9fafb;
          --ag-odd-row-background-color: #fafafa;
        }
        .ag-theme-quartz .ag-header-cell {
          border-right: 1px solid var(--ag-border-color);
          border-bottom: 1px solid var(--ag-border-color);
        }
        .ag-theme-quartz .ag-cell {
          border-right: 1px solid var(--ag-border-color);
          border-bottom: 1px solid var(--ag-border-color);
        }
        .ag-theme-quartz .ag-cell-span {
          background: inherit !important;
        }
        .ag-theme-quartz .ag-row {
          border-bottom: none;
          min-height: 45px;
        }
        .ag-theme-quartz .ag-row .ag-cell {
          display: flex;
          align-items: center;
        }
        .ag-theme-quartz .ag-header-cell {
          justify-content: center;
        }
        .ag-theme-quartz .ag-cell {
          white-space: normal;
          word-wrap: break-word;
          overflow-wrap: break-word;
          line-height: 1.4;
        }
        .ag-theme-quartz .ag-cell > div > div {
          margin-bottom: 0.5em;
        }
        .ag-theme-quartz .ag-cell > div > div:last-child {
          margin-bottom: 0;
        }
        .ag-theme-quartz .ag-cell-wrapper {
          height: 100%;
          display: flex !important;
          align-items: center !important;
        }
        .ag-theme-quartz .ag-cell-value {
          width: 100%;
          display: flex;
          align-items: center;
          min-height: inherit;
        }
        .ag-theme-quartz .ag-cell sup {
          font-size: 0.75em;
          vertical-align: super;
          line-height: 0;
        }
        .ag-theme-quartz .ag-cell sub {
          font-size: 0.75em;
          vertical-align: sub;
          line-height: 0;
        }
      `}</style>
      
      {title && (
        <div className="ag-grid-title-section">
          <div className="ag-grid-title">{title}</div>
        </div>
      )}
      
      <div className="ag-grid-header-section">
        <div className="ag-grid-controls">
          <div className="ag-grid-search">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search table..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>
        
        <div className="ag-grid-controls">
          {canScrollHorizontally && (
            <>
              <button className="ag-grid-scroll-btn" onClick={scrollLeft} title="Scroll left">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button className="ag-grid-scroll-btn" onClick={scrollRight} title="Scroll right">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </>
          )}
          <button className="ag-grid-fullscreen-btn" onClick={toggleFullscreen}>
            {isFullscreen ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                </svg>
                Exit Fullscreen
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
                Fullscreen
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="ag-grid-wrapper" ref={gridWrapperRef}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          defaultColGroupDef={defaultColGroupDef}
          domLayout={isFullscreen ? "normal" : "autoHeight"}
          animateRows={true}
          suppressMenuHide={true}
          theme={customTheme}
          enableCellTextSelection={true}
          ensureDomOrder={true}
          autoSizeStrategy={autoSizeStrategy}
          onFirstDataRendered={() => {
            // Auto-size columns after data is rendered
            if (gridRef.current?.api) {
              gridRef.current.api.autoSizeAllColumns();
            }
            // Check for scroll after columns are sized
            setTimeout(() => {
              if (gridWrapperRef.current) {
                const gridBody = gridWrapperRef.current.querySelector('.ag-body-horizontal-scroll-viewport');
                if (gridBody) {
                  const hasScroll = gridBody.scrollWidth > gridBody.clientWidth;
                  setCanScrollHorizontally(hasScroll);
                }
              }
              // Call onReady after grid is fully rendered
              if (onReady) {
                onReady();
              }
            }, 300);
          }}
        />
      </div>
    </div>
  );
}