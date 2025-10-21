'use client';

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface UDOAgGridTableProps {
  htmlString: string;
  title?: string;
  tableIndex?: number;
}


export function UDOAgGridTable({
  htmlString,
  title,
  tableIndex = 0,
}: UDOAgGridTableProps) {
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

    const frame = requestAnimationFrame(() => {
      const table = host.querySelector('table');
      if (!table || !(table instanceof HTMLTableElement)) {
        tableRef.current = null;
        return;
      }

      tableRef.current = table;
      updateScrollIndicators();
    });

    return () => {
      cancelAnimationFrame(frame);
      tableRef.current = null;
    };
  }, [htmlString, updateScrollIndicators]);

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
  }, [updateScrollIndicators, isFullscreen, htmlString]);

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
          dangerouslySetInnerHTML={{ __html: htmlString }}
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
