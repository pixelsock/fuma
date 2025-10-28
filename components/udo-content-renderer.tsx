'use client';

import React, { useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProgressiveDefinitionProcessorV2 } from './progressive-definition-processor-v2';
import { GlobalDefinitionTooltipV2 } from './global-definition-tooltip-v2';
import { TooltipProvider as DefinitionTooltipProvider } from './definition-tooltip-context';
import { HighlightedContent } from '@/lib/search-highlight-react';

interface UDOContentRendererProps {
  htmlContent: string;
  className?: string;
}

function rewriteAssetUrls(html: string): string {
  const directusUrl =
    process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.charlotteudo.org';

  const patterns = [
    /http:\/\/localhost:8056\/assets\//g,
    /https:\/\/admin\.charlotteudo\.org\/assets\//g,
  ];

  let result = html;
  patterns.forEach((pattern) => {
    result = result.replace(pattern, `${directusUrl}/assets/`);
  });

  return result;
}

export function UDOContentRenderer({
  htmlContent,
  className,
}: UDOContentRendererProps) {
  const searchParams = useSearchParams();
  const searchTerm = searchParams?.get('search') || '';
  const contentRef = useRef<HTMLDivElement>(null);

  const rewrittenContent = useMemo(() => rewriteAssetUrls(htmlContent), [htmlContent]);
  const hasEnhanced = useRef(false);

  // Enhance content after render to preserve DOM structure for Fumadocs TOC
  React.useEffect(() => {
    if (!contentRef.current || hasEnhanced.current) return;

    // Use requestAnimationFrame to avoid blocking render
    const enhanceTables = () => {
      try {
        const tables = contentRef.current?.querySelectorAll('table');
        if (!tables || tables.length === 0) return;

        tables.forEach((table, index) => {
          // Skip if already enhanced
          if (table.parentElement?.classList.contains('udo-table-shell')) return;

      // Find table title if it exists (TD/TH cell in first row with table-title-row class)
      let title = '';
      const firstRow = table.querySelector('tr');
      const firstCell = firstRow?.querySelector('td.table-title-row, th.table-title-row');

      if (firstCell && firstCell.getAttribute('colspan')) {
        title = firstCell.textContent?.trim() || '';
        // Hide the entire title row (we'll show text in toolbar)
        if (firstRow) {
          firstRow.style.display = 'none';
        }
      }

      // Create wrapper structure
      const shell = document.createElement('div');
      shell.className = 'udo-table-shell';

      const toolbar = document.createElement('div');
      toolbar.className = 'udo-table-toolbar';

      const titleContainer = document.createElement('div');
      titleContainer.className = 'udo-table-title';

      if (title) {
        const titleText = document.createElement('div');
        titleText.className = 'udo-table-title-text';
        titleText.textContent = title;
        titleContainer.appendChild(titleText);
      }

      toolbar.appendChild(titleContainer);

      // Create scroll container first (needed by button handlers)
      const scrollContainer = document.createElement('div');
      scrollContainer.className = 'udo-table-scroll';

      // Add actions container
      const actionsContainer = document.createElement('div');
      actionsContainer.className = 'udo-table-actions';

      // Add scroll buttons
      const scrollLeft = document.createElement('button');
      scrollLeft.className = 'udo-table-action';
      scrollLeft.innerHTML = '‹';
      scrollLeft.setAttribute('aria-label', 'Scroll left');
      scrollLeft.style.display = 'none'; // Hidden by default
      scrollLeft.onclick = () => scrollContainer.scrollBy({ left: -200, behavior: 'smooth' });

      const scrollRight = document.createElement('button');
      scrollRight.className = 'udo-table-action';
      scrollRight.innerHTML = '›';
      scrollRight.setAttribute('aria-label', 'Scroll right');
      scrollRight.style.display = 'none'; // Hidden by default
      scrollRight.onclick = () => scrollContainer.scrollBy({ left: 200, behavior: 'smooth' });

      // Function to update scroll button visibility and state
      const updateScrollIndicators = () => {
        const isScrollable = scrollContainer.scrollWidth > scrollContainer.clientWidth;
        const canScrollLeft = scrollContainer.scrollLeft > 2;
        const canScrollRight =
          scrollContainer.scrollLeft + scrollContainer.clientWidth < scrollContainer.scrollWidth - 2;

        // Hide both buttons if table doesn't need scrolling
        if (!isScrollable) {
          scrollLeft.style.display = 'none';
          scrollRight.style.display = 'none';
        } else {
          // Show buttons but disable them if can't scroll in that direction
          scrollLeft.style.display = 'inline-flex';
          scrollRight.style.display = 'inline-flex';
          scrollLeft.disabled = !canScrollLeft;
          scrollRight.disabled = !canScrollRight;
        }
      };

      // Add fullscreen button
      const fullscreenBtn = document.createElement('button');
      fullscreenBtn.className = 'udo-table-action';
      fullscreenBtn.innerHTML = '⛶';
      fullscreenBtn.setAttribute('aria-label', 'Toggle fullscreen');

      // Store original parent and position for restoration
      let originalParent: HTMLElement | null = null;
      let originalNextSibling: ChildNode | null = null;

      const exitFullscreen = () => {
        // Remove fullscreen class
        shell.classList.remove('udo-table-shell--fullscreen');
        shell.classList.remove('udo-content');

        // Remove backdrop
        const backdrop = document.querySelector('.udo-table-backdrop');
        if (backdrop) backdrop.remove();

        // Move shell back to original position
        if (originalParent) {
          if (originalNextSibling) {
            originalParent.insertBefore(shell, originalNextSibling);
          } else {
            originalParent.appendChild(shell);
          }
        }

        fullscreenBtn.innerHTML = '⛶';
        fullscreenBtn.setAttribute('aria-label', 'Toggle fullscreen');
        
        // Update scroll indicators after exiting fullscreen
        setTimeout(updateScrollIndicators, 100);
      };

      const enterFullscreen = () => {
        // Store original position
        originalParent = shell.parentElement;
        originalNextSibling = shell.nextSibling;

        // Create and insert backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'udo-table-backdrop';
        backdrop.onclick = (e) => {
          e.stopPropagation();
          exitFullscreen();
        };
        document.body.appendChild(backdrop);

        // Move shell to body and add fullscreen class
        document.body.appendChild(shell);
        shell.classList.add('udo-table-shell--fullscreen');
        shell.classList.add('udo-content'); // Preserve table styling

        fullscreenBtn.innerHTML = '×';
        fullscreenBtn.setAttribute('aria-label', 'Exit fullscreen');
        
        // Update scroll indicators after entering fullscreen
        setTimeout(updateScrollIndicators, 100);
      };

      fullscreenBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isFullscreen = shell.classList.contains('udo-table-shell--fullscreen');
        if (isFullscreen) {
          exitFullscreen();
        } else {
          enterFullscreen();
        }
      };

      actionsContainer.appendChild(scrollLeft);
      actionsContainer.appendChild(scrollRight);
      actionsContainer.appendChild(fullscreenBtn);

      toolbar.appendChild(actionsContainer);

      // Wrap table
      table.parentNode?.insertBefore(shell, table);
      shell.appendChild(toolbar);
      shell.appendChild(scrollContainer);
      scrollContainer.appendChild(table);

      // Set up scroll listeners to update button visibility
      scrollContainer.addEventListener('scroll', updateScrollIndicators);
      window.addEventListener('resize', updateScrollIndicators);

      // Initial check for scroll indicators
      setTimeout(updateScrollIndicators, 100);

      // Add column resize enhancement (async, non-blocking)
      // Task Group 6.6: Enhanced error boundary
      requestAnimationFrame(() => {
        try {
          import('@/lib/table-column-resize')
            .then(({ TableColumnResizer }) => {
              try {
                const tableId = TableColumnResizer.generateTableId(table);
                TableColumnResizer.enhance(table, tableId);

                // Add reset button to toolbar if preferences exist
                if (TableColumnResizer.hasPreferences(tableId)) {
                  const resetBtn = document.createElement('button');
                  resetBtn.className = 'udo-table-action';
                  resetBtn.innerHTML = '↺';
                  resetBtn.setAttribute('aria-label', 'Reset column widths');
                  resetBtn.onclick = () => {
                    try {
                      TableColumnResizer.resetWidths(tableId);
                      location.reload(); // Simple approach: reload to reset
                    } catch (error) {
                      console.error('Failed to reset column widths:', error);
                      // Fail gracefully - table remains functional
                    }
                  };
                  actionsContainer.insertBefore(resetBtn, actionsContainer.firstChild);
                }
              } catch (enhanceError) {
                // Task Group 6.6: Log error but don't break table
                console.error('Failed to enhance table columns:', enhanceError);
              }
            })
            .catch((importError) => {
              // Task Group 6.6: Handle module loading failure
              console.error('Failed to load table column resize module:', importError);
            });
        } catch (error) {
          // Task Group 6.6: Outer catch for any unexpected errors
          console.error('Unexpected error in table resize setup:', error);
          // Fail silently - table is still functional without resize
        }
      });
    });

    // Process definition links in place
    const processDefinitionLinks = () => {
      if (!contentRef.current) return;

      const links = contentRef.current.querySelectorAll('a.definition-link[data-definition-id]');

      links.forEach((link) => {
        const anchor = link as HTMLAnchorElement;

        // Skip if already enhanced
        if (anchor.getAttribute('data-enhanced') === 'true') return;

        const definitionId = anchor.getAttribute('data-definition-id');

        if (definitionId) {
          // Add enhanced styles
          anchor.classList.add(
            'text-[var(--color-fd-primary)]',
            'underline',
            'decoration-dotted',
            'underline-offset-2',
            'hover:text-[var(--color-fd-primary)]',
            'hover:decoration-solid',
            'transition-all',
            'cursor-help'
          );

          // Mark as enhanced
          anchor.setAttribute('data-enhanced', 'true');
        }
      });
    };

        processDefinitionLinks();
        
        // Mark as enhanced
        hasEnhanced.current = true;
      } catch (error) {
        console.error('Error enhancing tables:', error);
      }
    };

    // Use requestAnimationFrame to avoid blocking the main thread
    const rafId = requestAnimationFrame(enhanceTables);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [rewrittenContent]);

  // Render HTML directly to keep DOM stable for Fumadocs TOC
  // Features are added via DOM manipulation after render
  return (
    <DefinitionTooltipProvider>
      <div
        ref={contentRef}
        className={`udo-content prose prose-lg max-w-none mt-0 ${className || ''}`}
        dangerouslySetInnerHTML={{ __html: rewrittenContent }}
      />
      <GlobalDefinitionTooltipV2 />
    </DefinitionTooltipProvider>
  );
}
