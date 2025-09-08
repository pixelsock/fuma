import { useEffect, useRef, useCallback } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { EnhancedTableV2 } from '@/components/enhanced-table-v2';

// Debounce utility for performance
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export function useTableEnhancementV2(containerSelector?: string) {
  const rootsRef = useRef<Map<HTMLElement, Root>>(new Map());
  const processedTablesRef = useRef<Set<HTMLTableElement>>(new Set());

  // Memoized table processing function
  const processTable = useCallback((table: HTMLTableElement) => {
    // Skip if already enhanced or processed
    if (table.closest('.enhanced-table-container') || processedTablesRef.current.has(table)) {
      return false;
    }
    
    const parent = table.parentElement;
    if (!parent) return false;

    // Extract title with better performance
    let title = '';
    const caption = table.querySelector('caption');
    if (caption) {
      title = caption.textContent?.trim() || '';
    } else {
      // Check for heading before table
      const prevElement = table.previousElementSibling;
      if (prevElement && /^H[1-6]$/.test(prevElement.tagName)) {
        title = prevElement.textContent?.trim() || '';
      }
    }

    // Create wrapper container
    const container = document.createElement('div');
    container.className = 'enhanced-table-mount';
    
    // Clone the table and its context
    const tableClone = table.cloneNode(true) as HTMLTableElement;
    
    // Collect footnotes more efficiently
    let footnotesHtml = '';
    let nextSibling = table.nextElementSibling;
    const footnotePatterns = [
      /^note:/i,
      /^footnote:/i,
      /^[\d\*]+[\.\)]/,
      /^\*/
    ];
    
    while (nextSibling) {
      const text = nextSibling.textContent || '';
      const isFootnote = footnotePatterns.some(pattern => pattern.test(text.trim())) ||
                       nextSibling.classList.contains('footnote');
      
      if (isFootnote) {
        footnotesHtml += nextSibling.outerHTML;
        nextSibling = nextSibling.nextElementSibling;
      } else {
        break;
      }
    }

    // Build full HTML
    const fullHtml = tableClone.outerHTML + footnotesHtml;

    // Replace table with container
    parent.replaceChild(container, table);

    // Clean up title and footnotes from DOM
    if (caption) caption.remove();
    const prevElement = container.previousElementSibling;
    if (prevElement && /^H[1-6]$/.test(prevElement.tagName) && prevElement.textContent === title) {
      prevElement.remove();
    }
    
    // Remove footnote elements
    let sibling = container.nextElementSibling;
    while (sibling) {
      const text = sibling.textContent || '';
      const isFootnote = footnotePatterns.some(pattern => pattern.test(text.trim())) ||
                       sibling.classList.contains('footnote');
      
      if (isFootnote) {
        const next = sibling.nextElementSibling;
        sibling.remove();
        sibling = next;
      } else {
        break;
      }
    }

    // Create React root and render
    const root = createRoot(container);
    rootsRef.current.set(container, root);
    
    root.render(
      <EnhancedTableV2 
        html={fullHtml}
        title={title}
      />
    );

    // Mark as processed
    processedTablesRef.current.add(table);
    return true;
  }, []);

  // Debounced enhancement function
  const debouncedEnhanceAllTables = useCallback(
    debounce(() => {
      const selector = containerSelector || '.udo-content';
      const containers = document.querySelectorAll(selector);
      
      containers.forEach(container => {
        const tables = container.querySelectorAll('table:not(.enhanced-table)');
        tables.forEach(table => {
          processTable(table as HTMLTableElement);
        });
      });
    }, 100),
    [containerSelector, processTable]
  );

  useEffect(() => {
    // Initial enhancement
    setTimeout(() => {
      debouncedEnhanceAllTables();
    }, 100);

    // Watch for changes with optimized observer
    const observer = new MutationObserver((mutations) => {
      let shouldEnhance = false;
      
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            const element = node as HTMLElement;
            if (element.tagName === 'TABLE') {
              shouldEnhance = true;
            } else {
              const tables = element.querySelectorAll('table:not(.enhanced-table)');
              if (tables.length > 0) {
                shouldEnhance = true;
              }
            }
          }
        });
      });
      
      if (shouldEnhance) {
        debouncedEnhanceAllTables();
      }
    });

    const selector = containerSelector || '.udo-content';
    const containers = document.querySelectorAll(selector);
    containers.forEach(container => {
      observer.observe(container, {
        childList: true,
        subtree: true
      });
    });

    return () => {
      observer.disconnect();
      
      // Use requestAnimationFrame to avoid unmounting during render
      requestAnimationFrame(() => {
        rootsRef.current.forEach((root) => {
          try {
            root.unmount();
          } catch (error) {
            console.warn('Error unmounting root:', error);
          }
        });
        rootsRef.current.clear();
        processedTablesRef.current.clear();
      });
    };
  }, [containerSelector, debouncedEnhanceAllTables]);

  return {
    enhanceTable: processTable,
    enhanceAllTables: debouncedEnhanceAllTables
  };
}
