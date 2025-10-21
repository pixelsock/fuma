'use client';

import React, { useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { ProgressiveDefinitionProcessorV2 } from './progressive-definition-processor-v2';
import { GlobalDefinitionTooltipV2 } from './global-definition-tooltip-v2';
import { TooltipProvider as DefinitionTooltipProvider } from './definition-tooltip-context';
import { HighlightedContent } from '@/lib/search-highlight-react';

// Import table component dynamically with client-only rendering to avoid hydration issues
const UDOAgGridTable = dynamic(
  () => import('./udo-ag-grid-table').then(mod => ({ default: mod.UDOAgGridTable })),
  { ssr: false }
);

interface UDOContentRendererV3OptimizedProps {
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

interface ExtractedTable {
  html: string;
  title?: string;
}

function extractTablesFromHtml(html: string): {
  segments: string[];
  tables: ExtractedTable[];
} {
  if (typeof window === 'undefined') {
    return { segments: [html], tables: [] };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const tableElements = Array.from(doc.querySelectorAll('table'));

  if (tableElements.length === 0) {
    return { segments: [html], tables: [] };
  }

  const extracted: ExtractedTable[] = [];

  tableElements.forEach((table, index) => {
    // Find the table title if it exists (as a sibling of the table)
    let titleElement: HTMLElement | null = null;
    let title = '';

    const sibling = table.previousElementSibling;
    if (
      sibling instanceof HTMLElement &&
      sibling.classList.contains('table-title-row')
    ) {
      titleElement = sibling;
      title = titleElement.textContent?.trim() || '';
      // Remove the title element so it doesn't appear in the extracted HTML
      titleElement.remove();
    }

    // Extract only the table itself, not wrapper containers
    extracted.push({
      html: table.outerHTML,
      title: title || undefined,
    });

    // Replace ONLY the table element with a placeholder
    const placeholder = doc.createComment(`UDO_TABLE_${index}`);
    table.replaceWith(placeholder);
  });

  const htmlWithPlaceholders = doc.body.innerHTML;
  const segments: string[] = [];
  let lastIndex = 0;
  const regex = /<!--UDO_TABLE_(\d+)-->/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(htmlWithPlaceholders)) !== null) {
    segments.push(htmlWithPlaceholders.slice(lastIndex, match.index));
    lastIndex = match.index + match[0].length;
  }

  segments.push(htmlWithPlaceholders.slice(lastIndex));

  return { segments, tables: extracted };
}

export function UDOContentRendererV3Optimized({
  htmlContent,
  className,
}: UDOContentRendererV3OptimizedProps) {
  const searchParams = useSearchParams();
  const searchTerm = searchParams?.get('search') || '';
  const contentRef = useRef<HTMLDivElement>(null);

  const rewrittenContent = rewriteAssetUrls(htmlContent);

  // Enhance content after render to preserve DOM structure for Fumadocs TOC
  React.useEffect(() => {
    if (!contentRef.current) return;

    // Enhance tables in place (add wrappers, toolbars, etc.)
    const tables = contentRef.current.querySelectorAll('table');
    tables.forEach((table, index) => {
      // Skip if already enhanced
      if (table.parentElement?.classList.contains('udo-table-shell')) return;

      // Find table title if it exists
      let title = '';
      const titleDiv = table.previousElementSibling;
      if (titleDiv instanceof HTMLElement && titleDiv.classList.contains('table-title-row')) {
        title = titleDiv.textContent?.trim() || '';
        titleDiv.style.display = 'none'; // Hide the title div, we'll show it in toolbar
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

      const tableIndex = document.createElement('div');
      tableIndex.className = 'udo-table-index';
      tableIndex.textContent = `Table ${index + 1}`;
      titleContainer.appendChild(tableIndex);

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
      scrollLeft.innerHTML = '←';
      scrollLeft.setAttribute('aria-label', 'Scroll left');
      scrollLeft.style.display = 'none'; // Hidden by default
      scrollLeft.onclick = () => scrollContainer.scrollBy({ left: -200, behavior: 'smooth' });

      const scrollRight = document.createElement('button');
      scrollRight.className = 'udo-table-action';
      scrollRight.innerHTML = '→';
      scrollRight.setAttribute('aria-label', 'Scroll right');
      scrollRight.style.display = 'none'; // Hidden by default
      scrollRight.onclick = () => scrollContainer.scrollBy({ left: 200, behavior: 'smooth' });

      // Function to update scroll button visibility
      const updateScrollIndicators = () => {
        const canScrollLeft = scrollContainer.scrollLeft > 2;
        const canScrollRight =
          scrollContainer.scrollLeft + scrollContainer.clientWidth < scrollContainer.scrollWidth - 2;

        scrollLeft.style.display = canScrollLeft ? 'inline-flex' : 'none';
        scrollRight.style.display = canScrollRight ? 'inline-flex' : 'none';
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

        fullscreenBtn.innerHTML = '⛶';
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

  }, [rewrittenContent]);

  // Render HTML directly to keep DOM stable for Fumadocs TOC
  // Features are added via DOM manipulation after render
  return (
    <DefinitionTooltipProvider>
      <div
        ref={contentRef}
        className={`udo-content prose prose-lg max-w-none ${className || ''}`}
        dangerouslySetInnerHTML={{ __html: rewrittenContent }}
      />
      <GlobalDefinitionTooltipV2 />
    </DefinitionTooltipProvider>
  );
}
