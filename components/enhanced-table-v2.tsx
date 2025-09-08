'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Maximize2, Minimize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';

interface EnhancedTableProps {
  html: string;
  title?: string;
}

export function EnhancedTableV2({ html, title: initialTitle }: EnhancedTableProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [processedHtml, setProcessedHtml] = useState(html);
  const [footnoteHtml, setFootnoteHtml] = useState('');
  const [title, setTitle] = useState(initialTitle || '');
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Enhanced title extraction from HTML
  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Enhanced title extraction if not provided
    if (!initialTitle) {
      // Try multiple selectors for better title detection
      const titleElement = doc.querySelector('caption, h1, h2, h3, h4, .table-title, [data-table-title]');
      if (titleElement) {
        const extractedTitle = titleElement.textContent?.trim() || '';
        if (extractedTitle) {
          setTitle(extractedTitle);
          titleElement.remove();
        }
      }
    }

    // Extract footnotes
    const table = doc.querySelector('table');
    if (table) {
      let nextSibling = table.nextElementSibling;
      let footnotes = '';
      
      // Look for footnotes in the next few elements after the table
      while (nextSibling) {
        const text = nextSibling.textContent || '';
        if (text.includes('Note:') || text.includes('Footnote:') || /^\d+\./.test(text.trim()) || text.startsWith('*')) {
          footnotes += nextSibling.outerHTML;
          const next = nextSibling.nextElementSibling;
          nextSibling.remove();
          nextSibling = next;
        } else {
          break;
        }
      }
      
      setFootnoteHtml(footnotes);
    }

    setProcessedHtml(doc.body.innerHTML);
  }, [html, initialTitle]);

  // Check for horizontal scroll
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

  // Handle scroll
  const handleScroll = useCallback(() => {
    checkScroll();
  }, [checkScroll]);

  // Scroll left/right functions
  const scrollLeft = () => {
    if (tableWrapperRef.current) {
      tableWrapperRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (tableWrapperRef.current) {
      tableWrapperRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Initialize table enhancements
  useEffect(() => {
    if (!tableRef.current) return;

    // Apply cell styles while preserving original styles
    const cells = tableRef.current.querySelectorAll('td, th');
    cells.forEach((cell) => {
      const cellEl = cell as HTMLElement;
      // Only set min-width if not already set
      if (!cellEl.style.minWidth) {
        cellEl.style.minWidth = '75px';
      }
      // Set vertical alignment to middle
      cellEl.style.verticalAlign = 'middle';
      // Ensure padding if not set
      if (!cellEl.style.padding) {
        cellEl.style.padding = '8px';
      }
    });

    // Ensure table has minimum width and proper border collapse
    tableRef.current.style.minWidth = '100%';
    tableRef.current.style.width = '100%';
    tableRef.current.style.borderCollapse = 'collapse';
    tableRef.current.style.borderSpacing = '0';
    // Don't use table-layout: fixed as it prevents dynamic resizing

    // Check scroll on mount and resize
    checkScroll();

    // Set up ResizeObserver
    if (tableWrapperRef.current) {
      resizeObserverRef.current = new ResizeObserver(() => {
        checkScroll();
      });
      resizeObserverRef.current.observe(tableWrapperRef.current);
    }

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [processedHtml, checkScroll]);

  // Enhanced columns resizable implementation with throttling
  useEffect(() => {
    if (!tableRef.current || !mounted) return;

    const setupResize = () => {
      if (!tableRef.current) return;

      const table = tableRef.current;
      // Use auto layout for better resizing
      table.style.tableLayout = 'auto';
      
      const headers = table.querySelectorAll('thead th');
      
      headers.forEach((header, index) => {
        // Skip the last header
        if (index === headers.length - 1) return;

        const th = header as HTMLElement;
        const columnIndex = index + 1; // CSS nth-child is 1-indexed
        
        // Remove any existing resize handle
        const existingHandle = th.querySelector('.resize-handle');
        if (existingHandle) {
          existingHandle.remove();
        }
        
        // Make header relative positioned
        th.style.position = 'relative';

        // Create resize handle div
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        
        th.appendChild(resizeHandle);

        // Enhanced column resizing with throttling and better constraints
        let startX = 0;
        let startWidth = 0;
        let isResizing = false;
        let animationFrame: number | null = null;

        // Throttled resize function using requestAnimationFrame
        const throttledResize = (newWidth: number) => {
          if (animationFrame) {
            cancelAnimationFrame(animationFrame);
          }
          
          animationFrame = requestAnimationFrame(() => {
            if (!tableRef.current) return;

            // Apply improved width constraints (minimum 50px, maximum 80% of table width)
            const tableWidth = tableRef.current.offsetWidth;
            const minWidth = 50;
            const maxWidth = Math.max(200, tableWidth * 0.8);
            const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
            
            // Set width on the header with enhanced consistency
            th.style.width = `${constrainedWidth}px`;
            th.style.minWidth = `${constrainedWidth}px`;
            th.style.maxWidth = `${constrainedWidth}px`;
            
            // Update all cells in this column with improved selector reliability
            const allCells = tableRef.current.querySelectorAll(
              `thead th:nth-child(${columnIndex}), tbody td:nth-child(${columnIndex}), tfoot td:nth-child(${columnIndex}), tfoot th:nth-child(${columnIndex})`
            );
            
            allCells.forEach(cell => {
              const cellEl = cell as HTMLElement;
              cellEl.style.width = `${constrainedWidth}px`;
              cellEl.style.minWidth = `${constrainedWidth}px`;
              cellEl.style.maxWidth = `${constrainedWidth}px`;
              // Ensure the cell maintains its styling during resize
              cellEl.style.boxSizing = 'border-box';
            });
          });
        };

        const onMouseDown = (e: MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          
          isResizing = true;
          startX = e.pageX;
          startWidth = th.offsetWidth;
          
          // Enhanced visual feedback
          document.body.style.cursor = 'col-resize';
          document.body.style.userSelect = 'none';
          th.classList.add('resizing');
          table.classList.add('resizing-active');
          
          const onMouseMove = (e: MouseEvent) => {
            if (!isResizing || !tableRef.current) return;
            
            const diff = e.pageX - startX;
            const newWidth = startWidth + diff;
            
            // Use throttled resize for better performance
            throttledResize(newWidth);
          };
          
          const onMouseUp = () => {
            isResizing = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            th.classList.remove('resizing');
            table.classList.remove('resizing-active');
            
            // Clean up animation frame
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
      // Clean up resize handles on unmount
      if (tableRef.current) {
        const handles = tableRef.current.querySelectorAll('.resize-handle');
        handles.forEach(handle => handle.remove());
      }
    };
  }, [processedHtml, mounted]);

  const tableContent = (
    <div className={isFullscreen ? 'enhanced-table-fullscreen' : 'enhanced-table-container'}>
      {/* Enhanced toolbar with prominent title */}
      <div className="table-toolbar">
        <div className="toolbar-controls">
          {/* Enhanced prominent title display */}
          {title && (
            <div className="table-title-prominent">{title}</div>
          )}

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
              }
            }
          }}
        />
      </div>

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
