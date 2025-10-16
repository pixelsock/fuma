'use client';

import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ColGroupDef, GridOptions, ModuleRegistry, AllCommunityModule, themeQuartz } from 'ag-grid-community';
import { Search, Maximize2, Minimize2, ChevronLeft, ChevronRight } from 'lucide-react';

// Register AG Grid modules once
ModuleRegistry.registerModules([AllCommunityModule]);

interface UDOAgGridTableProps {
  htmlString: string;
  tableIndex?: number;
}

interface CellData {
  value: string;
  html?: string; // Store original HTML content
  style?: React.CSSProperties;
  colSpan?: number;
  rowSpan?: number;
}

interface TableData {
  rows: Record<string, any>[];
  columns: (ColDef | ColGroupDef)[];
  title?: string;
  enableSearch?: boolean;
}

// Custom cell renderer component to display HTML content with formatting
const HtmlCellRenderer = (props: any) => {
  const cellData = props.data?.[props.colDef.field] as CellData;

  if (!cellData) {
    return null;
  }

  // If we have HTML content, render it with dangerouslySetInnerHTML
  if (cellData.html && cellData.html.trim()) {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: cellData.html }}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    );
  }

  // Fallback to plain text value
  return <div>{cellData.value}</div>;
};

function parseHtmlTable(htmlString: string): TableData {
  if (typeof window === 'undefined') {
    return { rows: [], columns: [] };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const table = doc.querySelector('table');

  if (!table) {
    return { rows: [], columns: [] };
  }

  // Extract title using multiple strategies
  let title: string | undefined;

  // Strategy 1: Check for data-table-title attribute
  const titleAttr = table.getAttribute('data-table-title');
  if (titleAttr) {
    title = titleAttr;
  }

  // Strategy 2: Check for <caption> element
  if (!title) {
    const caption = table.querySelector('caption');
    if (caption) {
      title = caption.textContent?.trim();
    }
  }

  // Strategy 3: Check for preceding elements (p, h1-h6, div, etc.)
  if (!title) {
    const previousElement = table.previousElementSibling;
    if (previousElement) {
      // Check for headings first
      if (/^H[1-6]$/.test(previousElement.tagName)) {
        title = previousElement.textContent?.trim();
      }
      // Check for paragraph or div with strong/bold
      else if (previousElement.tagName === 'P' || previousElement.tagName === 'DIV') {
        const strongText = previousElement.querySelector('strong, b');
        if (strongText) {
          title = strongText.textContent?.trim();
        } else {
          // Check if entire element is the title (short text)
          const text = previousElement.textContent?.trim();
          if (text && text.length < 150 && !text.includes('\n')) {
            // Likely a title if it's short and single-line
            title = text;
          }
        }
      }
    }
  }

  // Strategy 3.5: Check for any text node immediately before the table
  if (!title) {
    let prevNode = table.previousSibling;
    // Skip whitespace text nodes
    while (prevNode && prevNode.nodeType === Node.TEXT_NODE && !prevNode.textContent?.trim()) {
      prevNode = prevNode.previousSibling;
    }
    // Check if it's a text node with content
    if (prevNode && prevNode.nodeType === Node.TEXT_NODE) {
      const text = prevNode.textContent?.trim();
      if (text && text.length < 150) {
        title = text;
      }
    }
  }

  // Strategy 4: Check for title row (colspan detection)
  if (!title) {
    const allRows = Array.from(table.querySelectorAll('tr'));
    const firstRow = allRows[0];
    if (firstRow) {
      const cells = Array.from(firstRow.querySelectorAll('td, th'));
      if (cells.length === 1 || (cells.length > 0 && cells[0].hasAttribute('colspan'))) {
        const potentialTitle = cells[0].textContent?.trim();
        if (potentialTitle && potentialTitle.length > 0) {
          title = potentialTitle;
          // Remove title row from processing
          firstRow.remove();
        }
      }
    }
  }

  // Check if search is enabled
  const enableSearch = table.getAttribute('data-ag-enable-search') === 'true';

  // Extract rows
  const allRows = Array.from(table.querySelectorAll('tr'));

  if (allRows.length === 0) {
    return { rows: [], columns: [], title, enableSearch };
  }

  // Helper function to parse inline styles from HTML element
  const parseStyles = (element: Element): React.CSSProperties => {
    const htmlElement = element as HTMLElement;
    const styles: React.CSSProperties = {};

    // Extract computed or inline styles
    if (htmlElement.style.fontFamily) styles.fontFamily = htmlElement.style.fontFamily;
    if (htmlElement.style.fontSize) styles.fontSize = htmlElement.style.fontSize;
    if (htmlElement.style.fontWeight) styles.fontWeight = htmlElement.style.fontWeight;
    if (htmlElement.style.fontStyle) styles.fontStyle = htmlElement.style.fontStyle;
    if (htmlElement.style.color) styles.color = htmlElement.style.color;
    if (htmlElement.style.backgroundColor) styles.backgroundColor = htmlElement.style.backgroundColor;
    if (htmlElement.style.textAlign) styles.textAlign = htmlElement.style.textAlign as any;
    if (htmlElement.style.verticalAlign) styles.verticalAlign = htmlElement.style.verticalAlign as any;
    if (htmlElement.style.padding) styles.padding = htmlElement.style.padding;
    if (htmlElement.style.border) styles.border = htmlElement.style.border;

    return styles;
  };

  // Detect all header rows (multiple strategies)
  const headerBgColor = '#DDEAF6'; // Light blue header background
  const darkBlueColor = '#1E4E79'; // Dark blue header background

  const headerRows: Element[][] = [];
  let dataStartIndex = 0;

  // Strategy 1: Look for light blue background (DDEAF6) - multi-row headers
  // Take consecutive rows with ALL cells having header background as header rows
  for (let i = 0; i < allRows.length; i++) {
    const row = allRows[i];
    const cells = Array.from(row.querySelectorAll('td, th'));

    // Check if ALL cells in this row have the header background
    const allCellsHaveHeaderBg = cells.every(cell => {
      const bgColor = (cell as HTMLElement).getAttribute('data-bg-color');
      return bgColor && bgColor.toUpperCase() === headerBgColor.replace('#', '');
    });

    if (allCellsHaveHeaderBg && cells.length > 0) {
      headerRows.push(cells);
      dataStartIndex = i + 1;
    } else if (headerRows.length > 0) {
      // Stop once we hit a row that doesn't have all cells with header background
      break;
    }
  }

  // Strategy 2: If no multi-row headers found, look for dark blue (#1E4E79) - single header
  if (headerRows.length === 0) {
    for (let i = 0; i < allRows.length; i++) {
      const row = allRows[i];
      const cells = Array.from(row.querySelectorAll('td, th'));

      const hasDarkBlueHeader = cells.some(cell => {
        const bgColor = (cell as HTMLElement).style.backgroundColor;
        return bgColor && (
          bgColor.includes(darkBlueColor) ||
          bgColor.includes('rgb(30, 78, 121)') ||
          bgColor.includes('rgb(30,78,121)')
        );
      });

      if (hasDarkBlueHeader) {
        headerRows.push(cells);
        dataStartIndex = i + 1;
        break;
      }
    }
  }

  // Strategy 3: Look for <th> tags
  if (headerRows.length === 0) {
    for (let i = 0; i < allRows.length; i++) {
      const row = allRows[i];
      const thCells = Array.from(row.querySelectorAll('th'));

      if (thCells.length > 0) {
        headerRows.push(thCells);
        dataStartIndex = i + 1;
        break;
      }
    }
  }

  // Strategy 4: Fallback - use first row as header
  if (headerRows.length === 0 && allRows.length > 0) {
    headerRows.push(Array.from(allRows[0].querySelectorAll('td, th')));
    dataStartIndex = 1;
  }

  // Build column definitions from header structure
  let columns: ColDef[];

  if (headerRows.length > 1) {
    // Multi-row headers: Build column groups
    columns = buildColumnGroupsFromMultiRowHeaders(headerRows);
  } else {
    // Single row header: Simple flat structure
    columns = buildSimpleColumns(headerRows[0] || []);
  }

  // Parse data rows
  const rows: Record<string, any>[] = [];

  for (let i = dataStartIndex; i < allRows.length; i++) {
    const row = allRows[i];
    const cells = Array.from(row.querySelectorAll('td, th'));

    if (cells.length === 0) continue;

    const rowData: Record<string, any> = {};
    let colIndex = 0;

    cells.forEach((cell) => {
      const htmlCell = cell as HTMLElement;
      const cellData: CellData = {
        value: cell.textContent?.trim() || '',
        html: htmlCell.innerHTML,
        style: parseStyles(cell),
      };

      const colSpan = htmlCell.getAttribute('colspan') || htmlCell.getAttribute('data-colspan');
      const rowSpan = htmlCell.getAttribute('rowspan') || htmlCell.getAttribute('data-rowspan');

      if (colSpan) {
        cellData.colSpan = parseInt(colSpan, 10);
      }
      if (rowSpan) {
        cellData.rowSpan = parseInt(rowSpan, 10);
      }

      rowData[`col${colIndex}`] = cellData;
      colIndex += cellData.colSpan || 1;
    });

    rows.push(rowData);
  }

  return { rows, columns, title, enableSearch };
}

// Build simple flat columns from a single header row
function buildSimpleColumns(headerCells: Element[]): ColDef[] {
  return headerCells.map((cell, index) => {
    const headerText = cell.textContent?.trim() || `Column ${index + 1}`;
    const fieldName = `col${index}`;

    return {
      field: fieldName,
      headerName: headerText,
      flex: 1,
      minWidth: 120,
      resizable: true,
      sortable: false,
      filter: false,
      wrapText: true,
      autoHeight: true,
      cellRenderer: HtmlCellRenderer,
      cellStyle: (params) => {
        const cellData = params.data?.[fieldName] as CellData;
        const baseStyle = cellData?.style || {};
        return {
          ...baseStyle,
          paddingTop: '12px',
          paddingBottom: '12px',
          lineHeight: '1.5',
          display: 'flex',
          alignItems: 'center',
        } as any;
      },
      valueGetter: (params) => {
        const cellData = params.data?.[fieldName] as CellData;
        return cellData?.value || '';
      },
      colSpan: (params) => {
        const cellData = params.data?.[fieldName] as CellData;
        return cellData?.colSpan || 1;
      },
      rowSpan: (params) => {
        const cellData = params.data?.[fieldName] as CellData;
        return cellData?.rowSpan || 1;
      },
    };
  });
}

// Build column groups with children from multi-row headers
function buildColumnGroupsFromMultiRowHeaders(headerRows: Element[][]): ColDef[] {
  // Build a matrix to track cell positions accounting for colspan/rowspan
  interface CellInfo {
    element: Element;
    text: string;
    colspan: number;
    rowspan: number;
    fieldIndex: number;
  }

  const headerMatrix: (CellInfo | null)[][] = [];

  // Initialize matrix for each row
  headerRows.forEach(() => {
    headerMatrix.push([]);
  });

  // Fill the matrix
  headerRows.forEach((cells, rowIndex) => {
    let colIndex = 0;

    cells.forEach((cell) => {
      const htmlCell = cell as HTMLElement;

      // Find the next available column in this row
      while (headerMatrix[rowIndex][colIndex] !== undefined) {
        colIndex++;
      }

      const colspan = parseInt(
        htmlCell.getAttribute('colspan') || htmlCell.getAttribute('data-colspan') || '1'
      );
      const rowspan = parseInt(
        htmlCell.getAttribute('rowspan') || htmlCell.getAttribute('data-rowspan') || '1'
      );
      const text = cell.textContent?.trim() || '';

      const cellInfo: CellInfo = {
        element: cell,
        text,
        colspan,
        rowspan,
        fieldIndex: colIndex,
      };

      console.log(`[Matrix Fill] Row ${rowIndex}, Col ${colIndex}: "${text}" (colspan=${colspan}, rowspan=${rowspan})`);

      // Fill the matrix for this cell and its span
      for (let r = 0; r < rowspan; r++) {
        for (let c = 0; c < colspan; c++) {
          if (headerMatrix[rowIndex + r]) {
            headerMatrix[rowIndex + r][colIndex + c] = cellInfo;
          }
        }
      }

      colIndex += colspan;
    });
  });

  // Find the last header row (actual column headers)
  const lastRowIndex = headerRows.length - 1;
  const lastRow = headerMatrix[lastRowIndex];

  console.log('[Last Row] Column headers:', lastRow.map((cell, i) => `[${i}]="${cell?.text}"`).join(', '));

  // Build column definitions
  const columns: (ColDef | ColGroupDef)[] = [];
  let processedIndices = new Set<number>();
  let processedCellInfos = new Set<CellInfo>();

  // Process cells from the first row to build groups
  if (headerRows.length > 1) {
    // Find the first row that's not a full-width title (skip title rows)
    let groupingRowIndex = 0;
    for (let i = 0; i < headerMatrix.length - 1; i++) {
      const row = headerMatrix[i];
      const firstCell = row.find(cell => cell !== null);
      // Skip if this row has a single cell spanning all columns (title row)
      if (firstCell && firstCell.colspan < row.filter(c => c !== null).length) {
        groupingRowIndex = i;
        break;
      }
    }

    const groupingRow = headerMatrix[groupingRowIndex];
    console.log(`[Grouping Row ${groupingRowIndex}] Processing:`, groupingRow.map((cell, i) => `[${i}]="${cell?.text}"`).join(', '));

    groupingRow.forEach((cellInfo, colIndex) => {
      if (!cellInfo) return;

      // Skip if we already processed this exact cellInfo object (handles colspan duplicates)
      if (processedCellInfos.has(cellInfo)) {
        console.log(`[Skip] Col ${colIndex}: "${cellInfo.text}" (already processed this cellInfo)`);
        return;
      }

      if (processedIndices.has(colIndex)) {
        console.log(`[Skip] Col ${colIndex}: "${cellInfo.text}" (index already processed)`);
        return;
      }

      console.log(`[Process] Col ${colIndex}: "${cellInfo.text}" (colspan=${cellInfo.colspan}, rowspan=${cellInfo.rowspan})`);

      // Check if this cell spans multiple columns (is a group header)
      if (cellInfo.colspan > 1 && cellInfo.rowspan === 1) {
        // This is a column group
        const children: ColDef[] = [];

        console.log(`  [Group] "${cellInfo.text}" spans cols ${colIndex}-${colIndex + cellInfo.colspan - 1}`);

        // Find all child columns under this group
        for (let c = colIndex; c < colIndex + cellInfo.colspan; c++) {
          const childCell = lastRow[c];
          if (childCell && !processedIndices.has(c)) {
            console.log(`    [Child] Col ${c}: "${childCell.text}"`);
            children.push(createLeafColumn(c, childCell.text));
            processedIndices.add(c);
          }
        }

        columns.push({
          headerName: cellInfo.text,
          children: children,
        } as ColGroupDef);

        // Mark this cellInfo as processed
        processedCellInfos.add(cellInfo);
      } else if (cellInfo.rowspan > 1) {
        // This cell spans multiple rows (pinned column like "Uses")
        console.log(`  [Pinned] "${cellInfo.text}" at col ${colIndex}`);
        columns.push(createPinnedColumn(colIndex, cellInfo.text));
        processedIndices.add(colIndex);
        processedCellInfos.add(cellInfo);
      }
    });
  }

  // Add any remaining ungrouped columns
  lastRow.forEach((cellInfo, colIndex) => {
    if (cellInfo && !processedIndices.has(colIndex)) {
      console.log(`[Ungrouped] Col ${colIndex}: "${cellInfo.text}"`);
      columns.push(createLeafColumn(colIndex, cellInfo.text));
      processedIndices.add(colIndex);
    }
  });

  console.log('[Final Columns]', columns.map(col => {
    if ('children' in col && col.children) {
      return `Group "${col.headerName}" (${col.children.length} children)`;
    }
    return `"${col.headerName}" (${(col as any).field})`;
  }).join(', '));

  return columns;
}

// Create a leaf column definition
function createLeafColumn(fieldIndex: number, headerText: string): ColDef {
  const fieldName = `col${fieldIndex}`;

  return {
    field: fieldName,
    headerName: headerText,
    width: 90,
    minWidth: 70,
    resizable: true,
    sortable: false,
    filter: false,
    wrapText: true,
    autoHeight: true,
    cellRenderer: HtmlCellRenderer,
    cellStyle: (params) => {
      const cellData = params.data?.[fieldName] as CellData;
      const baseStyle = cellData?.style || {};
      return {
        ...baseStyle,
        paddingTop: '12px',
        paddingBottom: '12px',
        lineHeight: '1.5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      } as any;
    },
    valueGetter: (params) => {
      const cellData = params.data?.[fieldName] as CellData;
      return cellData?.value || '';
    },
    colSpan: (params) => {
      const cellData = params.data?.[fieldName] as CellData;
      return cellData?.colSpan || 1;
    },
    rowSpan: (params) => {
      const cellData = params.data?.[fieldName] as CellData;
      return cellData?.rowSpan || 1;
    },
  };
}

// Create a pinned column definition (for columns like "Uses")
function createPinnedColumn(fieldIndex: number, headerText: string): ColDef {
  const fieldName = `col${fieldIndex}`;

  return {
    field: fieldName,
    headerName: headerText,
    pinned: 'left',
    width: 250,
    minWidth: 200,
    resizable: true,
    sortable: false,
    filter: false,
    wrapText: true,
    autoHeight: true,
    cellRenderer: HtmlCellRenderer,
    cellClass: 'font-semibold',
    cellStyle: (params) => {
      const cellData = params.data?.[fieldName] as CellData;
      const baseStyle = cellData?.style || {};
      return {
        ...baseStyle,
        paddingTop: '12px',
        paddingBottom: '12px',
        lineHeight: '1.5',
        display: 'flex',
        alignItems: 'center',
        fontWeight: 600,
      } as any;
    },
    valueGetter: (params) => {
      const cellData = params.data?.[fieldName] as CellData;
      return cellData?.value || '';
    },
    colSpan: (params) => {
      const cellData = params.data?.[fieldName] as CellData;
      return cellData?.colSpan || 1;
    },
    rowSpan: (params) => {
      const cellData = params.data?.[fieldName] as CellData;
      return cellData?.rowSpan || 1;
    },
  };
}

export function UDOAgGridTable({ htmlString, tableIndex = 0 }: UDOAgGridTableProps) {
  const { rows, columns, title, enableSearch } = useMemo(
    () => parseHtmlTable(htmlString),
    [htmlString]
  );

  const gridRef = useRef<AgGridReact>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const gridOptions: GridOptions = useMemo(() => ({
    theme: themeQuartz.withParams({
      borderColor: '#d0d0d0',
      headerBackgroundColor: '#1E4E79',
      wrapperBorderRadius: '0px',
      headerTextColor: '#ffffff',
      headerFontWeight: 'bold',
      columnBorder: true,
      headerColumnBorder: true,
      wrapperBorder: true,
      rowBorder: true,
      cellHorizontalPadding: 15,
      spacing: 8, // Base spacing unit (default is 8px)
      rowVerticalPaddingScale: 1.5, // Multiply vertical padding (1.5 = 50% more spacing)
    }), // Use modern v34 Theming API with all borders enabled
    suppressMovableColumns: true, // Disable column dragging
    suppressColumnMoveAnimation: true,
    suppressCellFocus: false,
    enableCellTextSelection: false,
    animateRows: false,
    pagination: false,
  }), []);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    if (gridRef.current?.api) {
      gridRef.current.api.setGridOption('quickFilterText', value);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const checkScroll = useCallback(() => {
    // Use AG Grid API to check if horizontal scrolling is needed
    if (!gridRef.current?.api) return;

    // Use setTimeout to ensure DOM has updated
    setTimeout(() => {
      if (!gridRef.current?.api) return;

      // Get the viewport element directly from AG Grid
      const gridElement = gridRef.current.api.getDisplayedRowCount();
      const scrollContainer = scrollContainerRef.current;

      if (!scrollContainer) return;

      // Find AG Grid's horizontal scroll viewport
      const agBodyViewport = scrollContainer.querySelector('.ag-body-horizontal-scroll-viewport');
      const agBodyHorizontalScroll = scrollContainer.querySelector('.ag-body-horizontal-scroll');
      const agCenterColsViewport = scrollContainer.querySelector('.ag-center-cols-viewport');

      // Try multiple possible scroll containers in AG Grid v34
      let elementToCheck: HTMLElement | null = null;

      if (agBodyViewport && agBodyViewport instanceof HTMLElement) {
        elementToCheck = agBodyViewport;
      } else if (agCenterColsViewport && agCenterColsViewport instanceof HTMLElement) {
        elementToCheck = agCenterColsViewport;
      } else if (agBodyHorizontalScroll && agBodyHorizontalScroll instanceof HTMLElement) {
        elementToCheck = agBodyHorizontalScroll;
      } else {
        // Fallback: find any element with horizontal scrolling
        const allViewports = scrollContainer.querySelectorAll('[class*="viewport"]');
        for (const viewport of allViewports) {
          const el = viewport as HTMLElement;
          if (el.scrollWidth > el.clientWidth) {
            elementToCheck = el;
            break;
          }
        }
      }

      if (!elementToCheck) return;

      const { scrollLeft, scrollWidth, clientWidth } = elementToCheck;
      const canScroll = scrollWidth > clientWidth;

      setCanScrollLeft(scrollLeft > 1); // Use > 1 to avoid floating point issues
      setCanScrollRight(canScroll && scrollLeft < scrollWidth - clientWidth - 1);
    }, 100);
  }, []);

  const scrollHorizontal = useCallback((direction: 'left' | 'right') => {
    // Find the correct scroll element (same logic as checkScroll)
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    // Find AG Grid's horizontal scroll viewport (same as checkScroll)
    const agBodyViewport = scrollContainer.querySelector('.ag-body-horizontal-scroll-viewport');
    const agBodyHorizontalScroll = scrollContainer.querySelector('.ag-body-horizontal-scroll');
    const agCenterColsViewport = scrollContainer.querySelector('.ag-center-cols-viewport');

    let elementToScroll: HTMLElement | null = null;

    if (agBodyViewport && agBodyViewport instanceof HTMLElement) {
      elementToScroll = agBodyViewport;
    } else if (agCenterColsViewport && agCenterColsViewport instanceof HTMLElement) {
      elementToScroll = agCenterColsViewport;
    } else if (agBodyHorizontalScroll && agBodyHorizontalScroll instanceof HTMLElement) {
      elementToScroll = agBodyHorizontalScroll;
    } else {
      // Fallback: find any element with horizontal scrolling
      const allViewports = scrollContainer.querySelectorAll('[class*="viewport"]');
      for (const viewport of allViewports) {
        const el = viewport as HTMLElement;
        if (el.scrollWidth > el.clientWidth) {
          elementToScroll = el;
          break;
        }
      }
    }

    if (!elementToScroll) return;

    const scrollAmount = 200;
    const newScrollLeft = elementToScroll.scrollLeft +
      (direction === 'left' ? -scrollAmount : scrollAmount);

    elementToScroll.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });

    // Check scroll state after scrolling
    setTimeout(() => checkScroll(), 100);
  }, [checkScroll]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [checkScroll]);

  useEffect(() => {
    // Don't call sizeColumnsToFit - let columns use their configured widths
    // This allows horizontal scrolling for wide tables
    checkScroll();
  }, [isFullscreen, checkScroll]);

  // Check scroll when data changes
  useEffect(() => {
    checkScroll();
  }, [rows, columns, checkScroll]);

  // Handle Escape key to exit fullscreen
  useEffect(() => {
    if (!isFullscreen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isFullscreen]);

  if (rows.length === 0 || columns.length === 0) {
    return null;
  }

  const tableContent = (
    <div
      className="udo-table-shell"
      style={isFullscreen ? {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      } : undefined}
    >
      {/* Toolbar with title and controls */}
      <div className="udo-table-toolbar">
        <div className="udo-table-title">
          {title && <div className="udo-table-title-text">{title}</div>}
          {tableIndex !== undefined && (
            <div className="udo-table-index">Table {tableIndex + 1}</div>
          )}
        </div>

        <div className="udo-table-actions">
          {enableSearch && (
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search..."
                className="h-[1.9rem] px-3 pr-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          )}

          {(canScrollLeft || canScrollRight) && (
            <>
              <button
                onClick={() => scrollHorizontal('left')}
                disabled={!canScrollLeft}
                className="udo-table-action"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollHorizontal('right')}
                disabled={!canScrollRight}
                className="udo-table-action"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            onClick={toggleFullscreen}
            className="udo-table-action"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* AG Grid Container */}
      <div
        ref={scrollContainerRef}
        className="udo-table-scroll"
        style={isFullscreen ? {
          flex: 1,
          width: '100%',
          overflow: 'auto',
          padding: 0, // Remove container padding
        } : {
          height: '500px',
          width: '100%',
          padding: 0, // Remove container padding
        }}
      >
        <div
          className="udo-ag-grid-wrapper udo-ag-grid-no-radius"
          style={{
            height: '100%',
            width: '100%',
            overflow: 'hidden',
            padding: 0, // Remove container padding
            borderRadius: 0, // Remove border radius
            margin: 0, // Remove any margins
          }}
        >
          <AgGridReact
            ref={gridRef}
            rowData={rows}
            columnDefs={columns}
            gridOptions={gridOptions}
            onGridReady={() => {
              // Don't call sizeColumnsToFit - let columns use their configured widths
              // This allows horizontal scrolling for wide tables

              // Delay to ensure grid is fully rendered
              setTimeout(checkScroll, 200);
            }}
            onFirstDataRendered={() => {
              // Don't call sizeColumnsToFit - let columns use their configured widths
              // This allows horizontal scrolling for wide tables

              // Delay to ensure grid is fully rendered
              setTimeout(checkScroll, 200);
            }}
            onBodyScroll={() => {
              checkScroll();
            }}
            onColumnResized={() => {
              // Check immediately and then after render completes
              checkScroll();
              requestAnimationFrame(() => {
                setTimeout(checkScroll, 200);
              });
            }}
            onDisplayedColumnsChanged={() => {
              checkScroll();
              requestAnimationFrame(() => {
                setTimeout(checkScroll, 200);
              });
            }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Normal view */}
      {!isFullscreen && (
        <div className="udo-table-host">
          {tableContent}
        </div>
      )}

      {/* Fullscreen view using Portal */}
      {isFullscreen && isMounted && createPortal(
        <>
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 9998,
            }}
            onClick={toggleFullscreen}
          />
          {/* Fullscreen container */}
          <div
            className="udo-table-host"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              backgroundColor: 'white',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {tableContent}
          </div>
        </>,
        document.body
      )}
    </>
  );
}
