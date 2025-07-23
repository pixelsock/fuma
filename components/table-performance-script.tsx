'use client';

import { useEffect } from 'react';

export function TablePerformanceScript() {
  useEffect(() => {
    // Monitor for AG-Grid table initialization
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement && node.classList.contains('ag-root-wrapper')) {
              // AG-Grid table has been added, ensure parent table wrapper is visible
              const tableWrapper = node.closest('.table-wrapper');
              if (tableWrapper instanceof HTMLElement) {
                tableWrapper.style.opacity = '1';
              }
            }
          });
        }
      });
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Also check for existing tables on mount
    const checkExistingTables = () => {
      const agGridTables = document.querySelectorAll('.ag-root-wrapper');
      agGridTables.forEach((table) => {
        const tableWrapper = table.closest('.table-wrapper');
        if (tableWrapper instanceof HTMLElement) {
          tableWrapper.style.opacity = '1';
        }
      });
    };

    // Check after a short delay to ensure DOM is ready
    setTimeout(checkExistingTables, 100);

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}