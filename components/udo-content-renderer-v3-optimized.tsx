'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { UDOAgGridTable } from './udo-ag-grid-table';
import { ProgressiveDefinitionProcessorV2 } from './progressive-definition-processor-v2';
import { GlobalDefinitionTooltipV2 } from './global-definition-tooltip-v2';
import { TooltipProvider as DefinitionTooltipProvider } from './definition-tooltip-context';
import { HighlightedContent } from '@/lib/search-highlight-react';

interface UDOContentRendererV3OptimizedProps {
  htmlContent: string;
  className?: string;
  tables?: string[]; // Server-provided table data
}

// Function to rewrite asset URLs to use the correct Directus instance
function rewriteAssetUrls(html: string): string {
  // Use NEXT_PUBLIC_ env var so it's available on both server and client
  const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8056';
  
  // Replace any existing Directus URLs with the current one
  const patterns = [
    /http:\/\/localhost:8056\/assets\//g,
    /https:\/\/admin\.charlotteudo\.org\/assets\//g,
  ];
  
  let result = html;
  patterns.forEach(pattern => {
    result = result.replace(pattern, `${directusUrl}/assets/`);
  });
  
  return result;
}

// Function to extract tables from HTML content
function extractTables(html: string): { htmlParts: string[], tables: string[] } {
  if (!html) return { htmlParts: [html], tables: [] };
  
  const tableRegex = /<table[^>]*>.*?<\/table>/gis;
  const tables: string[] = [];
  let lastIndex = 0;
  const htmlParts: string[] = [];
  
  let match;
  while ((match = tableRegex.exec(html)) !== null) {
    if (match.index > lastIndex) {
      htmlParts.push(html.substring(lastIndex, match.index));
    }
    htmlParts.push(`<!--TABLE_PLACEHOLDER_${tables.length}-->`);
    tables.push(match[0]);
    lastIndex = match.index + match[0].length;
  }
  
  if (lastIndex < html.length) {
    htmlParts.push(html.substring(lastIndex));
  }
  
  if (tables.length === 0) {
    return { htmlParts: [html], tables: [] };
  }
  
  return { htmlParts, tables };
}

// Table loading component
function TableLoading({ tableIndex }: { tableIndex: number }) {
  return (
    <div className="my-4 table-loading-wrapper" data-table-index={tableIndex}>
      <div className="animate-pulse border border-gray-200 rounded-lg p-4 bg-gray-50">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-3 gap-4 mb-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="grid grid-cols-3 gap-4 mb-2">
            <div className="h-3 bg-gray-100 rounded"></div>
            <div className="h-3 bg-gray-100 rounded"></div>
            <div className="h-3 bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function UDOContentRendererV3Optimized({ htmlContent, className, tables }: UDOContentRendererV3OptimizedProps) {
  const searchParams = useSearchParams();
  const searchTerm = searchParams?.get('search') || '';
  const [processedContent, setProcessedContent] = useState<{ htmlParts: string[], tables: string[] } | null>(null);
  const [tablesReady, setTablesReady] = useState<Set<number>>(new Set());
  
  // Process content consistently for both server and client
  const rewrittenContent = rewriteAssetUrls(htmlContent);
  
  // Extract tables from content
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const processed = extractTables(rewrittenContent);
      console.log('Extracted tables:', processed.tables.length, 'tables found');
      console.log('HTML parts:', processed.htmlParts.length, 'parts');
      setProcessedContent(processed);
    }
  }, [rewrittenContent]);
  
  const handleTableReady = (index: number) => {
    setTimeout(() => {
      setTablesReady(prev => {
        const newSet = new Set(prev);
        newSet.add(index);
        return newSet;
      });
    }, 100);
  };
  
  // Render content with AG-Grid tables
  return (
    <DefinitionTooltipProvider>
      <div className={`udo-content ${className}`}>
        <ProgressiveDefinitionProcessorV2 
          content={
            <>
              {processedContent ? (
                // Client-side render with AG-Grid
                processedContent.htmlParts.map((part, index) => (
                  <React.Fragment key={index}>
                    {part && part.trim() && (
                      <HighlightedContent
                        html={part}
                        searchTerm={searchTerm}
                      />
                    )}
                    {index < processedContent.tables.length && processedContent.tables[index] && (
                      <div className="my-4">
                        {!tablesReady.has(index) && (
                          <TableLoading tableIndex={index} />
                        )}
                        <div 
                          className="table-wrapper" 
                          style={{ 
                            opacity: tablesReady.has(index) ? 1 : 0,
                            height: tablesReady.has(index) ? 'auto' : 0,
                            overflow: 'hidden',
                            transition: 'opacity 0.3s ease-out, height 0.3s ease-out',
                            visibility: tablesReady.has(index) ? 'visible' : 'hidden',
                            pointerEvents: tablesReady.has(index) ? 'auto' : 'none',
                          }}
                        >
                          <UDOAgGridTable 
                            htmlString={processedContent.tables[index]}
                            tableIndex={index}
                            onReady={() => handleTableReady(index)}
                          />
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))
              ) : (
                // Server-side render or initial load
                <HighlightedContent
                  html={rewrittenContent}
                  searchTerm={searchTerm}
                />
              )}
            </>
          } 
        />
      </div>
      <GlobalDefinitionTooltipV2 />
    </DefinitionTooltipProvider>
  );
}