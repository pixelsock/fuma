'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Search,
} from 'lucide-react';

interface UDOAgGridTableProps {
  htmlString: string;
  tableIndex?: number;
}

interface TableMeta {
  html: string;
  title?: string;
  enableSearch: boolean;
  hasTable: boolean;
}

const MIN_COLUMN_WIDTH = 60;

function extractTableMeta(htmlString: string): TableMeta {
  if (typeof window === 'undefined') {
    return {
      html: htmlString,
      hasTable: true,
      enableSearch: false,
    };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const table = doc.querySelector('table');

  if (!table) {
    return {
      html: htmlString,
      hasTable: false,
      enableSearch: false,
    };
  }

  const enableSearch =
    table.getAttribute('data-ag-enable-search') === 'true' ||
    table.getAttribute('data-table-enable-search') === 'true';

  const titleCandidates: Array<string | undefined> = [];

  const dataTitle = table.getAttribute('data-table-title');
  if (dataTitle) {
    titleCandidates.push(dataTitle.trim());
  }

  const ariaLabelledBy = table.getAttribute('aria-labelledby');
  if (ariaLabelledBy) {
    const labelledElement = doc.getElementById(ariaLabelledBy);
    if (labelledElement) {
      titleCandidates.push(labelledElement.textContent?.trim());
    }
  }

  const caption = table.querySelector('caption');
  if (caption) {
    titleCandidates.push(caption.textContent?.trim());
  }

  const sibling = table.previousElementSibling as HTMLElement | null;
  if (sibling) {
    if (sibling.classList.contains('table-title-row')) {
      titleCandidates.push(sibling.textContent?.trim());
    } else if (/^H[1-6]$/.test(sibling.tagName) || sibling.tagName === 'P') {
      titleCandidates.push(sibling.textContent?.trim());
    }
  }

  if (!titleCandidates.length) {
    const firstRow = table.querySelector('tr');
    if (firstRow) {
      const cells = Array.from(firstRow.querySelectorAll('th, td'));
      if (cells.length === 1) {
        titleCandidates.push(cells[0].textContent?.trim());
      }
    }
  }

  const title = titleCandidates.find((candidate) => candidate && candidate.length > 0);

  const wrapper = doc.createElement('div');
  wrapper.appendChild(table);

  return {
    html: wrapper.innerHTML,
    title,
    enableSearch,
    hasTable: true,
  };
}

function getColumnCount(table: HTMLTableElement): number {
  let max = 0;
  const rows = Array.from(table.rows);
  rows.forEach((row) => {
    let count = 0;
    Array.from(row.cells).forEach((cell) => {
      count += cell.colSpan || 1;
    });
    if (count > max) {
      max = count;
    }
  });
  return max;
}

function measureColumnWidths(table: HTMLTableElement, colCount: number): number[] {
  const widths = new Array(colCount).fill(0);
  const rowSpanTracker = new Array(colCount).fill(0);
  const rows = Array.from(table.rows);

  rows.forEach((row) => {
    for (let i = 0; i < colCount; i += 1) {
      if (rowSpanTracker[i] > 0) {
        rowSpanTracker[i] -= 1;
      }
    }

    let columnIndex = 0;
    Array.from(row.cells).forEach((cell) => {
      while (columnIndex < colCount && rowSpanTracker[columnIndex] > 0) {
        columnIndex += 1;
      }

      const span = cell.colSpan || 1;
      const rowSpan = cell.rowSpan || 1;
      const rect = (cell as HTMLElement).getBoundingClientRect();
      const widthPerColumn = rect.width / span;

      for (let offset = 0; offset < span; offset += 1) {
        const targetIndex = columnIndex + offset;
        if (targetIndex < colCount) {
          widths[targetIndex] = Math.max(widths[targetIndex], widthPerColumn);
          if (rowSpan > 1) {
            rowSpanTracker[targetIndex] = rowSpan - 1;
          }
        }
      }

      columnIndex += span;
    });
  });

  return widths;
}

function enableColumnResizing(
  table: HTMLTableElement,
  onResize?: () => void,
): () => void {
  const doc = table.ownerDocument;
  const colCount = getColumnCount(table);

  if (colCount === 0) {
    return () => undefined;
  }

  table.classList.add('resizable-table');
  const handles = Array.from(table.querySelectorAll<HTMLElement>('.table-resize-handle'));
  handles.forEach((handle) => handle.remove());

  let colgroup = table.querySelector('colgroup[data-resize-colgroup="true"]');
  if (!colgroup) {
    colgroup = doc.createElement('colgroup');
    colgroup.setAttribute('data-resize-colgroup', 'true');
    table.insertBefore(colgroup, table.firstChild);
  }

  const existingCols = Array.from(colgroup.children);
  if (existingCols.length > colCount) {
    for (let i = colCount; i < existingCols.length; i += 1) {
      colgroup.removeChild(existingCols[i]);
    }
  }
  if (existingCols.length < colCount) {
    for (let i = existingCols.length; i < colCount; i += 1) {
      const col = doc.createElement('col');
      colgroup.appendChild(col);
    }
  }

  const columns = Array.from(colgroup.children) as HTMLTableColElement[];
  const columnCells: HTMLElement[][] = Array.from({ length: colCount }, () => []);
  const measuredWidths = measureColumnWidths(table, colCount);

  columns.forEach((column, index) => {
    const widthAttr = column.getAttribute('width');
    let width = 0;
    if (column.style.width) {
      width = parseFloat(column.style.width);
    } else if (widthAttr) {
      width = parseFloat(widthAttr);
    }

    if (!Number.isFinite(width) || width <= 0) {
      width = measuredWidths[index] || MIN_COLUMN_WIDTH;
    }

    column.style.width = `${Math.max(width, MIN_COLUMN_WIDTH)}px`;
    column.style.minWidth = `${MIN_COLUMN_WIDTH}px`;
    column.removeAttribute('width');
  });

  const rowSpanTrackerForCells = new Array(colCount).fill(0);
  const allRows = Array.from(table.rows);

  allRows.forEach((row) => {
    for (let i = 0; i < colCount; i += 1) {
      if (rowSpanTrackerForCells[i] > 0) {
        rowSpanTrackerForCells[i] -= 1;
      }
    }

    let columnIndex = 0;

    Array.from(row.cells).forEach((cell) => {
      while (columnIndex < colCount && rowSpanTrackerForCells[columnIndex] > 0) {
        columnIndex += 1;
      }

      const span = cell.colSpan || 1;
      const rowSpan = cell.rowSpan || 1;

      if (span === 1) {
        columnCells[columnIndex].push(cell as HTMLElement);
      }

      if (rowSpan > 1) {
        for (let offset = 0; offset < span; offset += 1) {
          const idx = columnIndex + offset;
          if (idx < colCount) {
            rowSpanTrackerForCells[idx] = rowSpan - 1;
          }
        }
      }

      columnIndex += span;
    });
  });

  if (!table.style.tableLayout) {
    table.style.tableLayout = 'fixed';
  }
  if (!table.style.width) {
    table.style.width = '100%';
  }

  const cleanups: Array<() => void> = [];
  const syncTableMinWidth = () => {
    const container = table.closest('.udo-table-scroll') as HTMLElement | null;
    const containerWidth = container?.clientWidth ?? table.parentElement?.clientWidth ?? 0;

    let totalWidth = columns.reduce((sum, column) => {
      const numeric = parseFloat(column.style.width || '0');
      return sum + (Number.isFinite(numeric) ? numeric : MIN_COLUMN_WIDTH);
    }, 0);

    const minWidthForColumns = colCount * MIN_COLUMN_WIDTH;
    const base = Math.max(minWidthForColumns, containerWidth);

    if (columns.length > 0 && totalWidth < base) {
      const remainder = base - totalWidth;
      const targetIndex = columns.length - 1;
      const target = columns[targetIndex];
      if (target) {
        const parsed = parseFloat(target.style.width || '0');
        const currentWidth = Number.isFinite(parsed) && parsed > 0 ? parsed : MIN_COLUMN_WIDTH;
        const resolvedWidth = Math.max(MIN_COLUMN_WIDTH, currentWidth + remainder);
        const delta = resolvedWidth - currentWidth;

        target.style.width = `${resolvedWidth}px`;
        target.style.minWidth = `${resolvedWidth}px`;

        columnCells[targetIndex].forEach((cell) => {
          cell.style.width = `${resolvedWidth}px`;
          cell.style.minWidth = `${resolvedWidth}px`;
          cell.style.boxSizing = 'border-box';
        });

        totalWidth += delta;
      }
    }

    const finalWidth = Math.max(base, totalWidth, minWidthForColumns);
    table.style.minWidth = `${finalWidth}px`;
    table.style.width = '100%';
  };

  const win = doc.defaultView;
  if (win) {
    const handleWindowResize = () => {
      syncTableMinWidth();
      onResize?.();
    };
    win.addEventListener('resize', handleWindowResize);
    cleanups.push(() => win.removeEventListener('resize', handleWindowResize));
  }

  const applyColumnWidth = (columnIndex: number, width: number) => {
    const target = columns[columnIndex];
    if (!target) {
      return;
    }

    const resolvedWidth = Math.max(MIN_COLUMN_WIDTH, width);
    target.style.width = `${resolvedWidth}px`;
    target.style.minWidth = `${resolvedWidth}px`;

    columnCells[columnIndex].forEach((cell) => {
      cell.style.width = `${resolvedWidth}px`;
      cell.style.minWidth = `${resolvedWidth}px`;
      cell.style.boxSizing = 'border-box';
    });

    syncTableMinWidth();
    onResize?.();
  };

  const spanTracker = new Array(colCount).fill(0);
  const headerRows = table.tHead
    ? Array.from(table.tHead.rows)
    : [];

  if (!headerRows.length && table.rows.length > 0) {
    headerRows.push(table.rows[0]);
  }

  headerRows.forEach((row) => {
    for (let i = 0; i < colCount; i += 1) {
      if (spanTracker[i] > 0) {
        spanTracker[i] -= 1;
      }
    }

    let columnIndex = 0;

    Array.from(row.cells).forEach((cell) => {
      while (columnIndex < colCount && spanTracker[columnIndex] > 0) {
        columnIndex += 1;
      }

      const span = cell.colSpan || 1;
      const rowSpan = cell.rowSpan || 1;

      if (span === 1) {
        const handle = doc.createElement('div');
        handle.className = 'table-resize-handle';
        cell.style.position = cell.style.position || 'relative';
        cell.style.overflow = 'visible';
        cell.appendChild(handle);

        const startResize = (event: PointerEvent) => {
          event.preventDefault();
          event.stopPropagation();

          const startX = event.clientX;
          const targetCol = columns[columnIndex];
          const referenceCell = columnCells[columnIndex][0] ?? (cell as HTMLElement);
          const computedWidth = targetCol?.getBoundingClientRect().width
            || referenceCell.getBoundingClientRect().width;
          const startWidth = Number.isFinite(computedWidth) && computedWidth > 0
            ? computedWidth
            : MIN_COLUMN_WIDTH;

          handle.classList.add('table-resize-handle--active');

          const onPointerMove = (moveEvent: PointerEvent) => {
            const delta = moveEvent.clientX - startX;
            const newWidth = Math.max(MIN_COLUMN_WIDTH, startWidth + delta);
            applyColumnWidth(columnIndex, newWidth);
          };

          const onPointerUp = () => {
            handle.classList.remove('table-resize-handle--active');
            doc.removeEventListener('pointermove', onPointerMove);
            doc.removeEventListener('pointerup', onPointerUp);
            doc.removeEventListener('pointercancel', onPointerUp);
            handle.releasePointerCapture?.(event.pointerId);
            syncTableMinWidth();
            onResize?.();
          };

          doc.addEventListener('pointermove', onPointerMove);
          doc.addEventListener('pointerup', onPointerUp);
          doc.addEventListener('pointercancel', onPointerUp);
          handle.setPointerCapture?.(event.pointerId);
        };

        handle.addEventListener('pointerdown', startResize);
        cleanups.push(() => handle.removeEventListener('pointerdown', startResize));
      }

      if (rowSpan > 1) {
        for (let offset = 0; offset < span; offset += 1) {
          const idx = columnIndex + offset;
          if (idx < colCount) {
            spanTracker[idx] = rowSpan - 1;
          }
        }
      }

      columnIndex += span;
    });
  });

  syncTableMinWidth();

  return () => {
    cleanups.forEach((cleanup) => cleanup());
    const activeHandles = Array.from(table.querySelectorAll<HTMLElement>('.table-resize-handle'));
    activeHandles.forEach((handle) => handle.remove());
    table.classList.remove('resizable-table');
  };
}

export function UDOAgGridTable({
  htmlString,
  tableIndex = 0,
}: UDOAgGridTableProps) {
  const { html, title, enableSearch, hasTable } = useMemo(
    () => extractTableMeta(htmlString),
    [htmlString],
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const hostRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!enableSearch) {
      setSearchTerm('');
    }
  }, [enableSearch]);

  const updateScrollIndicators = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    setCanScrollLeft(container.scrollLeft > 2);
    setCanScrollRight(
      container.scrollLeft + container.clientWidth < container.scrollWidth - 2,
    );
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return () => undefined;
    }

    let cleanup: (() => void) | undefined;
    const frame = requestAnimationFrame(() => {
      const table = host.querySelector('table');
      if (!table || !(table instanceof HTMLTableElement)) {
        tableRef.current = null;
        return;
      }

      tableRef.current = table;
      cleanup = enableColumnResizing(table, updateScrollIndicators);
      updateScrollIndicators();
    });

    return () => {
      cancelAnimationFrame(frame);
      cleanup?.();
      tableRef.current = null;
    };
  }, [html, updateScrollIndicators]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return () => undefined;
    }

    updateScrollIndicators();
    container.addEventListener('scroll', updateScrollIndicators);
    window.addEventListener('resize', updateScrollIndicators);

    return () => {
      container.removeEventListener('scroll', updateScrollIndicators);
      window.removeEventListener('resize', updateScrollIndicators);
    };
  }, [updateScrollIndicators, isFullscreen, html]);

  useEffect(() => {
    if (!enableSearch || !tableRef.current) {
      return;
    }

    const table = tableRef.current;
    const rows = Array.from(table.querySelectorAll('tbody tr'));
    const fallbackRows = rows.length ? rows : Array.from(table.querySelectorAll('tr')).slice(1);

    const normalized = searchTerm.trim().toLowerCase();

    fallbackRows.forEach((row) => {
      const element = row as HTMLElement;
      if (!normalized) {
        element.style.display = '';
        return;
      }

      const text = element.textContent?.toLowerCase() ?? '';
      element.style.display = text.includes(normalized) ? '' : 'none';
    });
  }, [searchTerm, enableSearch]);

  useEffect(() => {
    if (!isFullscreen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isFullscreen]);

  const scrollHorizontal = useCallback((direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    const distance = container.clientWidth * 0.8;
    const offset = direction === 'left' ? -distance : distance;
    container.scrollBy({ left: offset, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    updateScrollIndicators();
  }, [updateScrollIndicators, isFullscreen]);

  if (!hasTable) {
    return null;
  }

  const tableContent = (
    <div
      className={`udo-table-shell${isFullscreen ? ' udo-table-shell--fullscreen' : ''}`}
      style={isFullscreen ? { flex: 1, display: 'flex', flexDirection: 'column' } : undefined}
    >
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
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search..."
                className="h-[1.9rem] px-3 pr-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          )}

          {(canScrollLeft || canScrollRight) && (
            <>
              <button
                type="button"
                onClick={() => scrollHorizontal('left')}
                disabled={!canScrollLeft}
                className="udo-table-action"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
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
            type="button"
            onClick={() => setIsFullscreen((prev) => !prev)}
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

      <div
        ref={scrollContainerRef}
        className="udo-table-scroll"
        style={isFullscreen ? { flex: 1, width: '100%' } : { width: '100%' }}
      >
        <div
          ref={hostRef}
          className="resizable-table-wrapper"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );

  return (
    <>
      {!isFullscreen && <div className="udo-table-host">{tableContent}</div>}

      {isFullscreen && isMounted && createPortal(
        <>
          <div
            className="udo-table-backdrop"
            role="presentation"
            onClick={() => setIsFullscreen(false)}
          />
          <div className="udo-table-host">{tableContent}</div>
        </>,
        document.body,
      )}
    </>
  );
}
