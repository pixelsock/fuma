'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { UDOAgGridTable } from './udo-ag-grid-table';
import { ProgressiveDefinitionProcessorV2 } from './progressive-definition-processor-v2';
import { GlobalDefinitionTooltipV2 } from './global-definition-tooltip-v2';
import { TooltipProvider as DefinitionTooltipProvider } from './definition-tooltip-context';
import { HighlightedContent } from '@/lib/search-highlight-react';
import { ContentWithHeadingLinks } from './content-with-heading-links';

interface UDOContentRendererV3OptimizedProps {
  htmlContent: string;
  className?: string;
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

// Function to ensure heading IDs match TOC URLs
function ensureHeadingIds(html: string): string {
  if (!html) return html;
  
  return html.replace(/<(h[1-6])([^>]*)>(.*?)<\/h[1-6]>/gi, (match, tagName, attributes, titleHTML) => {
    // Check if heading already has an ID
    const hasId = /\s+id\s*=\s*["\'][^"\']*["\']/.test(attributes);
    if (hasId) return match;
    
    // Extract text content from HTML (remove any tags)
    const title = titleHTML.replace(/<[^>]*>/g, '').trim();
    if (!title) return match;
    
    // Generate ID using the same logic as TOC generation
    const id = title
      .toLowerCase()
      .replace(/[^a-z0-9\s\-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
    
    // Add ID to the heading
    return `<${tagName}${attributes} id="${id}">${titleHTML}</${tagName}>`;
  });
}

interface ProcessedContent {
  htmlParts: string[];
  tables: string[];
}

function extractTables(html: string): ProcessedContent {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Look for table wrappers with titles
  const tableWrappers = doc.querySelectorAll('.table-wrapper');
  const extractedTables: string[] = [];
  
  if (tableWrappers.length > 0) {
    // Extract entire table wrapper (includes title)
    tableWrappers.forEach((wrapper, index) => {
      const wrapperHtml = wrapper.outerHTML;
      extractedTables.push(wrapperHtml);
      
      // Replace the wrapper with a placeholder
      const placeholder = doc.createElement('div');
      placeholder.innerHTML = `<!--TABLE_PLACEHOLDER_${index}-->`;
      wrapper.parentNode?.replaceChild(placeholder, wrapper);
    });
  } else {
    // Fallback to extracting just tables
    const tables = doc.querySelectorAll('table');
    tables.forEach((table, index) => {
      const tableHtml = table.outerHTML;
      extractedTables.push(tableHtml);
      
      // Replace the table with a placeholder
      const placeholder = doc.createElement('div');
      placeholder.innerHTML = `<!--TABLE_PLACEHOLDER_${index}-->`;
      table.parentNode?.replaceChild(placeholder, table);
    });
  }
  
  // Get the modified HTML with placeholders
  const modifiedHtml = doc.body.innerHTML;
  
  // Split by placeholders
  const parts = modifiedHtml.split(/<!--TABLE_PLACEHOLDER_(\d+)-->/);
  const htmlParts: string[] = [];
  
  // Process the parts to maintain order
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      // This is HTML content
      htmlParts.push(parts[i]);
    } else {
      // This is a table index - skip it as we'll insert tables separately
    }
  }
  
  return {
    htmlParts: htmlParts,
    tables: extractedTables
  };
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

export function UDOContentRendererV3Optimized({ htmlContent, className }: UDOContentRendererV3OptimizedProps) {
  const searchParams = useSearchParams();
  const searchTerm = searchParams?.get('search') || '';
  const [processedContent, setProcessedContent] = useState<ProcessedContent | null>(null);
  const [tablesReady, setTablesReady] = useState<Set<number>>(new Set());
  const [tablesMounted, setTablesMounted] = useState<Set<number>>(new Set());
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const rewrittenContent = rewriteAssetUrls(htmlContent);
      const contentWithIds = ensureHeadingIds(rewrittenContent);
      const processed = extractTables(contentWithIds);
      setProcessedContent(processed);
    }
  }, [htmlContent]);
  
  const handleTableMounted = (index: number) => {
    setTablesMounted(prev => {
      const newSet = new Set(prev);
      newSet.add(index);
      return newSet;
    });
  };
  
  const handleTableReady = (index: number) => {
    // Add a small delay to ensure AG-Grid is fully rendered
    setTimeout(() => {
      setTablesReady(prev => {
        const newSet = new Set(prev);
        newSet.add(index);
        return newSet;
      });
    }, 100);
  };
  
  // Server-side render without table extraction to avoid hydration issues
  if (!processedContent) {
    const rewrittenContent = rewriteAssetUrls(htmlContent);
    const contentWithIds = ensureHeadingIds(rewrittenContent);
    return (
      <DefinitionTooltipProvider>
        <div className={className || "udo-content"}>
          <ProgressiveDefinitionProcessorV2 
            content={
              <HighlightedContent
                html={contentWithIds}
                searchTerm={searchTerm}
              />
            } 
          />
        </div>
        <GlobalDefinitionTooltipV2 />
      </DefinitionTooltipProvider>
    );
  }
  
  // Client-side render with AG-Grid tables
  return (
    <DefinitionTooltipProvider>
      <ContentWithHeadingLinks>
        <div className={className || "udo-content"}>
          <ProgressiveDefinitionProcessorV2 
            content={
              <>
                {processedContent.htmlParts.map((part, index) => (
                  <React.Fragment key={index}>
                    {part && part.trim() && (
                      <HighlightedContent
                        html={part}
                        searchTerm={searchTerm}
                      />
                    )}
                    {index < processedContent.tables.length && processedContent.tables[index] && (
                      <div className="table-container my-4" data-table-index={index}>
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
                            position: tablesReady.has(index) ? 'static' : 'absolute',
                            visibility: tablesReady.has(index) ? 'visible' : 'hidden',
                            pointerEvents: tablesReady.has(index) ? 'auto' : 'none'
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
                ))}
              </>
            } 
          />
        </div>
      </ContentWithHeadingLinks>
      <GlobalDefinitionTooltipV2 />
    </DefinitionTooltipProvider>
  );
}