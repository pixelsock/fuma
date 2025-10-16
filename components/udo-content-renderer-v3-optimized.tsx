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
    const container =
      table.closest('.enhanced-table-container') ??
      table.closest('.table-wrapper') ??
      table;

    let titleElement: HTMLElement | null = null;
    let title = '';

    const candidates: (Element | null)[] = [
      table.previousElementSibling,
      container instanceof HTMLElement ? container.previousElementSibling : null,
    ];

    for (const candidate of candidates) {
      if (
        candidate instanceof HTMLElement &&
        candidate.classList.contains('table-title-row')
      ) {
        titleElement = candidate;
        break;
      }
    }

    if (titleElement) {
      title = titleElement.textContent?.trim() || '';
      titleElement.remove();
    }

    extracted.push({
      html: table.outerHTML,
      title: title || undefined,
    });

    const placeholder = doc.createComment(`UDO_TABLE_${index}`);

    if (container && container !== table) {
      container.replaceWith(placeholder);
    } else {
      table.replaceWith(placeholder);
    }
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
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const rewrittenContent = rewriteAssetUrls(htmlContent);

  const { segments, tables } = useMemo(
    () => {
      // During SSR or initial hydration, return raw HTML
      if (!isClient) {
        return { segments: [rewrittenContent], tables: [] };
      }
      // After hydration, extract tables
      return extractTablesFromHtml(rewrittenContent);
    },
    [rewrittenContent, isClient],
  );

  return (
    <DefinitionTooltipProvider>
      <div className={`udo-content ${className || ''}`} ref={contentRef}>
        <ProgressiveDefinitionProcessorV2
          content={
            <>
              {segments.map((segment, index) => (
                <React.Fragment key={`segment-${index}`}>
                  {segment.trim().length > 0 && (
                    <HighlightedContent
                      html={segment}
                      searchTerm={searchTerm}
                    />
                  )}
                  {index < tables.length && (
                    <UDOAgGridTable
                      key={`table-${index}`}
                      htmlString={tables[index].html}
                      tableIndex={index}
                    />
                  )}
                </React.Fragment>
              ))}
            </>
          }
        />
      </div>
      <GlobalDefinitionTooltipV2 />
    </DefinitionTooltipProvider>
  );
}
