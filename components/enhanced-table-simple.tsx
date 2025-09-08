'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Maximize2, Minimize2, ChevronLeft, ChevronRight } from 'lucide-react';

interface EnhancedTableSimpleProps {
  html: string;
  title?: string;
}

export function EnhancedTableSimple({ html, title }: EnhancedTableSimpleProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const tableRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const columnWidthsRef = useRef<{ [key: number]: number }>({});
  const isResizingRef = useRef(false);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Process table HTML to extract title and footnotes
  const processTableHTML = useCallback((html: string, initialTitle?: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Enhanced title extraction if not provided
    let extractedTitle = initialTitle || '';
    if (!initialTitle) {
      const titleElement = doc.querySelector('caption, h1, h2, h3, h4, .table-title, [data-table-title]');
      if (titleElement) {
        extractedTitle = titleElement.textContent?.trim() || '';
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

    // Preserve table wrapper and original table styling
    const tableWrapper = doc.querySelector('.table-wrapper');
    let processedHtml = doc.body.innerHTML;
    
    if (tableWrapper) {
      // Keep the table wrapper structure but add our enhancement class
      const table = tableWrapper.querySelector('table');
      if (table) {
        table.classList.add('enhanced-table');
        // Preserve original table styling
        table.style.width = table.style.width || '100%';
        table.style.minWidth = table.style.minWidth || '100%';
      }
      processedHtml = tableWrapper.outerHTML;
    } else {
      // If no wrapper, just add enhancement class to table
      const table = doc.querySelector('table');
      if (table) {
        table.classList.add('enhanced-table');
      }
    }

    return {
      processedHtml,
      footnoteHtml,
      title: extractedTitle
    };
  }, []);

  const { processedHtml, footnoteHtml, title: extractedTitle } = processTableHTML(html, title);
  const displayTitle = title || extractedTitle;

  // Column resizing functionality
  const handleColumnResize = useCallback((columnIndex: number, newWidth: number) => {
    if (isResizingRef.current) return;
    
    isResizingRef.current = true;
    columnWidthsRef.current[columnIndex] = Math.max(50, newWidth);
    
    // Apply width to all cells in this column
    const table = tableRef.current?.querySelector('table');
    if (table) {
      const cells = table.querySelectorAll(`td:nth-child(${columnIndex + 1}), th:nth-child(${columnIndex + 1})`);
      cells.forEach(cell => {
        (cell as HTMLElement).style.width = `${newWidth}px`;
        (cell as HTMLElement).style.minWidth = `${newWidth}px`;
        (cell as HTMLElement).style.maxWidth = `${newWidth}px`;
      });
    }
    
    // Clear timeout and reset flag
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    resizeTimeoutRef.current = setTimeout(() => {
      isResizingRef.current = false;
    }, 100);
  }, []);

  // Mouse event handlers for column resizing
  const handleMouseDown = useCallback((e: React.MouseEvent, columnIndex: number) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = columnWidthsRef.current[columnIndex] || 100;
    
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = startWidth + (e.clientX - startX);
      handleColumnResize(columnIndex, newWidth);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [handleColumnResize]);

  // Initialize column widths and add resize handles
  useEffect(() => {
    const table = tableRef.current?.querySelector('table');
    if (table) {
      const headers = table.querySelectorAll('th');
      headers.forEach((header, index) => {
        if (!columnWidthsRef.current[index]) {
          columnWidthsRef.current[index] = header.getBoundingClientRect().width || 100;
        }
        
        // Add resize handle to each header (only if not already added)
        if (!header.querySelector('.resize-handle')) {
          const resizeHandle = document.createElement('div');
          resizeHandle.className = 'resize-handle';
          resizeHandle.addEventListener('mousedown', (e) => handleMouseDown(e, index));
          
          // Make header position relative and add handle
          (header as HTMLElement).style.position = 'relative';
          header.appendChild(resizeHandle);
        }
      });
    }
  }, [processedHtml, handleMouseDown]);

  // Fullscreen functionality
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Scroll functionality
  const scrollLeft = useCallback(() => {
    if (tableRef.current) {
      tableRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  }, []);

  const scrollRight = useCallback(() => {
    if (tableRef.current) {
      tableRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  const containerClasses = isFullscreen 
    ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' 
    : 'relative border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden';

  return (
    <div className={containerClasses} ref={containerRef}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          {displayTitle && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {displayTitle}
            </h3>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Scroll Controls */}
          <div className="flex items-center space-x-1">
            <button
              onClick={scrollLeft}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              title="Scroll Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={scrollRight}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              title="Scroll Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div 
        ref={tableRef}
        className="overflow-auto max-h-96"
        style={{ maxHeight: isFullscreen ? 'calc(100vh - 60px)' : '384px' }}
      >
        <div 
          className="enhanced-table-wrapper"
          dangerouslySetInnerHTML={{ __html: processedHtml }}
        />
      </div>

      {/* Footnotes */}
      {footnoteHtml && (
        <div 
          className="p-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400"
          dangerouslySetInnerHTML={{ __html: footnoteHtml }}
        />
      )}

    </div>
  );
}
