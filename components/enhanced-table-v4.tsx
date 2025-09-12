'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Maximize2, Minimize2, ChevronLeft, ChevronRight, Search, ArrowUpDown, Filter } from 'lucide-react';
import { createPortal } from 'react-dom';

interface EnhancedTableProps {
  html: string;
  title?: string;
}

// Enhanced table processing with sorting and filtering support
const processTableHTML = (html: string, initialTitle?: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Enhanced title extraction if not provided
  let title = initialTitle || '';
  if (!initialTitle) {
    const titleElement = doc.querySelector('caption, h1, h2, h3, h4, .table-title, [data-table-title]');
    if (titleElement) {
      title = titleElement.textContent?.trim() || '';
      titleElement.remove();
    }
  }

  // Extract footnotes
  const table = doc.querySelector('table');
  let footnoteHtml = '';
  if (table) {
    let nextSibling = table.nextElementSibling;
    
    // Look for footnotes in the next few elements after the table
    while (nextSibling) {
      const text = nextSibling.textContent || '';
      if (text.includes('Note:') || text.includes('Footnote:') || /^\d+\./.test(text.trim()) || text.startsWith('*')) {
        footnoteHtml += nextSibling.outerHTML;
        const next = nextSibling.nextElementSibling;
        nextSibling.remove();
        nextSibling = next;
      } else {
        break;
      }
    }
  }

  return {
    processedHtml: doc.body.innerHTML,
    footnoteHtml,
    title
  };
};

export function EnhancedTableV4({ html, title: initialTitle }: EnhancedTableProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredData, setFilteredData] = useState<HTMLTableRowElement[]>([]);
  
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [mounted, setMounted] = useState(false);

  // Memoize table processing to avoid re-parsing
  const { processedHtml, footnoteHtml, title } = useMemo(() => 
    processTableHTML(html, initialTitle), 
    [html, initialTitle]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Optimized scroll checking with debouncing
  const checkScroll = useCallback(() => {
    if (!tableWrapperRef.current) return;
    
    const wrapper = tableWrapperRef.current;
    const hasHorizontalScroll = wrapper.scrollWidth > wrapper.clientWidth;
    
    if (hasHorizontalScroll) {
      setCanScrollLeft(wrapper.scrollLeft > 0);
      setCanScrollRight(wrapper.scrollLeft < wrapper.scrollWidth - wrapper.clientWidth - 1);
    } else {
      setCanScrollLeft(false);
      setCanScrollRight(false);
    }
  }, []);

  // Debounced scroll handler
  const handleScroll = useCallback(() => {
    requestAnimationFrame(checkScroll);
  }, [checkScroll]);

  // Scroll functions
  const scrollLeft = useCallback(() => {
    if (tableWrapperRef.current) {
      tableWrapperRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  }, []);

  const scrollRight = useCallback(() => {
    if (tableWrapperRef.current) {
      tableWrapperRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  }, []);

  // Search and filter functionality
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    if (!tableRef.current) return;

    const tbody = tableRef.current.querySelector('tbody');
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    if (!term.trim()) {
      // Show all rows
      rows.forEach(row => {
        (row as HTMLElement).style.display = '';
      });
      setFilteredData(rows);
      return;
    }

    // Filter rows based on search term
    const filtered = rows.filter(row => {
      const text = row.textContent?.toLowerCase() || '';
      return text.includes(term.toLowerCase());
    });

    // Hide/show rows
    rows.forEach(row => {
      const isVisible = filtered.includes(row);
      (row as HTMLElement).style.display = isVisible ? '' : 'none';
    });

    setFilteredData(filtered);
  }, []);

  // Sorting functionality
  const handleSort = useCallback((columnIndex: number) => {
    if (!tableRef.current) return;

    const tbody = tableRef.current.querySelector('tbody');
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr'));
    if (rows.length === 0) return;

    // Determine sort direction
    const newDirection = sortColumn === columnIndex && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(columnIndex);
    setSortDirection(newDirection);

    // Sort rows
    const sortedRows = rows.sort((a, b) => {
      const aCell = a.children[columnIndex] as HTMLElement;
      const bCell = b.children[columnIndex] as HTMLElement;
      
      if (!aCell || !bCell) return 0;

      const aText = aCell.textContent?.trim() || '';
      const bText = bCell.textContent?.trim() || '';

      // Try to parse as numbers
      const aNum = parseFloat(aText.replace(/[^0-9.-]/g, ''));
      const bNum = parseFloat(bText.replace(/[^0-9.-]/g, ''));

      if (!isNaN(aNum) && !isNaN(bNum)) {
        return newDirection === 'asc' ? aNum - bNum : bNum - aNum;
      }

      // String comparison
      return newDirection === 'asc' 
        ? aText.localeCompare(bText)
        : bText.localeCompare(aText);
    });

    // Reorder DOM elements
    sortedRows.forEach(row => tbody.appendChild(row));
  }, [sortColumn, sortDirection]);

  // Optimized table initialization
  useEffect(() => {
    if (!tableRef.current || !mounted) return;

    const table = tableRef.current;
    
    // Batch DOM updates
    const cells = table.querySelectorAll('td, th');
    const updates: (() => void)[] = [];
    
    cells.forEach((cell) => {
      const cellEl = cell as HTMLElement;
      updates.push(() => {
        if (!cellEl.style.minWidth) {
          cellEl.style.minWidth = '75px';
        }
        cellEl.style.verticalAlign = 'middle';
        if (!cellEl.style.padding) {
          cellEl.style.padding = '8px';
        }
      });
    });

    // Apply all updates in a single batch
    updates.forEach(update => update());

    // Set table properties
    table.style.minWidth = '100%';
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.borderSpacing = '0';

    // Initialize filtered data
    const tbody = table.querySelector('tbody');
    if (tbody) {
      const rows = Array.from(tbody.querySelectorAll('tr'));
      setFilteredData(rows);
    }

    // Check scroll on mount and resize
    checkScroll();

    // Set up ResizeObserver
    if (tableWrapperRef.current) {
      resizeObserverRef.current = new ResizeObserver(() => {
        requestAnimationFrame(checkScroll);
      });
      resizeObserverRef.current.observe(tableWrapperRef.current);
    }

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [processedHtml, mounted, checkScroll]);

  // Optimized column resizing with better performance
  useEffect(() => {
    if (!tableRef.current || !mounted) return;

    const setupResize = () => {
      if (!tableRef.current) return;

      const table = tableRef.current;
      table.style.tableLayout = 'auto';
      
      const headers = table.querySelectorAll('thead th');
      
      // Pre-calculate column indices to avoid repeated calculations
      const columnIndices = Array.from(headers).map((_, index) => index + 1);
      
      headers.forEach((header, index) => {
        if (index === headers.length - 1) return;

        const th = header as HTMLElement;
        const columnIndex = columnIndices[index];
        
        // Remove existing resize handle
        const existingHandle = th.querySelector('.resize-handle');
        if (existingHandle) {
          existingHandle.remove();
        }
        
        th.style.position = 'relative';

        // Create resize handle
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        th.appendChild(resizeHandle);

        // Optimized resize handling
        let startX = 0;
        let startWidth = 0;
        let isResizing = false;
        let animationFrame: number | null = null;

        // Pre-calculate table width for constraints
        const getTableWidth = () => tableRef.current?.offsetWidth || 0;

        const throttledResize = (newWidth: number) => {
          if (animationFrame) {
            cancelAnimationFrame(animationFrame);
          }
          
          animationFrame = requestAnimationFrame(() => {
            if (!tableRef.current) return;

            const tableWidth = getTableWidth();
            const minWidth = 50;
            const maxWidth = Math.max(200, tableWidth * 0.8);
            const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
            
            // Batch style updates
            const styleUpdates = [
              () => {
                th.style.width = `${constrainedWidth}px`;
                th.style.minWidth = `${constrainedWidth}px`;
                th.style.maxWidth = `${constrainedWidth}px`;
              }
            ];

            // Update all cells in this column
            const allCells = tableRef.current.querySelectorAll(
              `thead th:nth-child(${columnIndex}), tbody td:nth-child(${columnIndex}), tfoot td:nth-child(${columnIndex}), tfoot th:nth-child(${columnIndex})`
            );
            
            allCells.forEach(cell => {
              const cellEl = cell as HTMLElement;
              styleUpdates.push(() => {
                cellEl.style.width = `${constrainedWidth}px`;
                cellEl.style.minWidth = `${constrainedWidth}px`;
                cellEl.style.maxWidth = `${constrainedWidth}px`;
                cellEl.style.boxSizing = 'border-box';
              });
            });

            // Apply all style updates
            styleUpdates.forEach(update => update());
          });
        };

        const onMouseDown = (e: MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          
          isResizing = true;
          startX = e.pageX;
          startWidth = th.offsetWidth;
          
          // Visual feedback
          document.body.style.cursor = 'col-resize';
          document.body.style.userSelect = 'none';
          th.classList.add('resizing');
          table.classList.add('resizing-active');
          
          const onMouseMove = (e: MouseEvent) => {
            if (!isResizing || !tableRef.current) return;
            
            const diff = e.pageX - startX;
            const newWidth = startWidth + diff;
            throttledResize(newWidth);
          };
          
          const onMouseUp = () => {
            isResizing = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            th.classList.remove('resizing');
            table.classList.remove('resizing-active');
            
            if (animationFrame) {
              cancelAnimationFrame(animationFrame);
              animationFrame = null;
            }
            
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
          };
          
          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
        };
        
        resizeHandle.addEventListener('mousedown', onMouseDown);
      });
    };

    // Setup with a small delay to ensure DOM is ready
    const timer = setTimeout(setupResize, 100);
    
    return () => {
      clearTimeout(timer);
      if (tableRef.current) {
        const handles = tableRef.current.querySelectorAll('.resize-handle');
        handles.forEach(handle => handle.remove());
      }
    };
  }, [processedHtml, mounted]);

  const tableContent = (
    <div className={isFullscreen ? 'enhanced-table-fullscreen' : 'enhanced-table-container'}>
      {/* Enhanced toolbar with search and sort */}
      <div className="table-toolbar">
        <div className="toolbar-controls">
          {/* Enhanced prominent title display */}
          {title && (
            <div className="table-title-prominent">{title}</div>
          )}

          {/* Search and filter controls */}
          <div className="search-controls">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search table..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8 pr-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1 rounded ${showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              title="Toggle filters"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>

          {/* Scroll controls */}
          <div className="scroll-controls">
            <button
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className="scroll-btn"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={scrollRight}
              disabled={!canScrollRight}
              className="scroll-btn"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="fullscreen-btn"
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

      {/* Table wrapper */}
      <div
        ref={tableWrapperRef}
        onScroll={handleScroll}
        className="table-wrapper"
        style={{ maxHeight: isFullscreen ? 'calc(100vh - 120px)' : '600px' }}
      >
        <div
          dangerouslySetInnerHTML={{ __html: processedHtml }}
          ref={(el) => {
            if (el) {
              const table = el.querySelector('table');
              if (table) {
                tableRef.current = table;
                table.className = 'enhanced-table';
                
                // Add sort functionality to headers
                const headers = table.querySelectorAll('thead th');
                headers.forEach((header, index) => {
                  const th = header as HTMLElement;
                  th.style.cursor = 'pointer';
                  th.addEventListener('click', () => handleSort(index));
                  
                  // Add sort indicator
                  const indicator = document.createElement('span');
                  indicator.className = 'sort-indicator ml-1';
                  indicator.innerHTML = sortColumn === index 
                    ? (sortDirection === 'asc' ? '↑' : '↓')
                    : '↕';
                  th.appendChild(indicator);
                });
              }
            }
          }}
        />
      </div>

      {/* Results summary */}
      {searchTerm && (
        <div className="table-results-summary">
          Showing {filteredData.length} of {tableRef.current?.querySelectorAll('tbody tr').length || 0} rows
        </div>
      )}

      {/* Footnotes */}
      {footnoteHtml && (
        <div 
          className="table-footnotes"
          dangerouslySetInnerHTML={{ __html: footnoteHtml }}
        />
      )}
    </div>
  );

  // Use portal for fullscreen mode
  if (isFullscreen && mounted) {
    return createPortal(
      <div className="table-fullscreen-overlay">
        {tableContent}
      </div>,
      document.body
    );
  }

  return tableContent;
}


