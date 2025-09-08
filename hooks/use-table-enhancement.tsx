import { useEffect, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { EnhancedTableV2 } from '@/components/enhanced-table-v2';

export function useTableEnhancement(containerSelector?: string) {
  const rootsRef = useRef<Map<HTMLElement, Root>>(new Map());

  useEffect(() => {
    const enhanceTable = (table: HTMLTableElement) => {
      // Skip if already enhanced
      if (table.closest('.enhanced-table-container')) return false;
      
      const parent = table.parentElement;
      if (!parent) return false;

      // Extract title
      let title = '';
      const caption = table.querySelector('caption');
      if (caption) {
        title = caption.textContent || '';
      } else {
        // Check for heading before table
        const prevElement = table.previousElementSibling;
        if (prevElement && /^H[1-6]$/.test(prevElement.tagName)) {
          title = prevElement.textContent || '';
        }
      }

      // Create wrapper container
      const container = document.createElement('div');
      container.className = 'enhanced-table-mount';
      
      // Clone the table and its context
      const tableClone = table.cloneNode(true) as HTMLTableElement;
      
      // Collect footnotes
      let footnotesHtml = '';
      let nextSibling = table.nextElementSibling;
      while (nextSibling) {
        const text = nextSibling.textContent || '';
        if (
          text.toLowerCase().includes('note:') || 
          text.toLowerCase().includes('footnote:') ||
          /^[\d\*]+[\.\)]/.test(text.trim()) ||
          nextSibling.classList.contains('footnote')
        ) {
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
        if (
          text.toLowerCase().includes('note:') || 
          text.toLowerCase().includes('footnote:') ||
          /^[\d\*]+[\.\)]/.test(text.trim()) ||
          sibling.classList.contains('footnote')
        ) {
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

      return true;
    };

    const enhanceAllTables = () => {
      const selector = containerSelector || '.udo-content';
      const containers = document.querySelectorAll(selector);
      
      containers.forEach(container => {
        const tables = container.querySelectorAll('table:not(.enhanced-table)');
        tables.forEach(table => {
          enhanceTable(table as HTMLTableElement);
        });
      });
    };

    // Initial enhancement
    setTimeout(enhanceAllTables, 100);

    // Watch for changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            const element = node as HTMLElement;
            if (element.tagName === 'TABLE') {
              enhanceTable(element as HTMLTableElement);
            } else {
              const tables = element.querySelectorAll('table:not(.enhanced-table)');
              tables.forEach(table => {
                enhanceTable(table as HTMLTableElement);
              });
            }
          }
        });
      });
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
      
      // Cleanup React roots
      rootsRef.current.forEach((root) => {
        root.unmount();
      });
      rootsRef.current.clear();
    };
  }, [containerSelector]);
}