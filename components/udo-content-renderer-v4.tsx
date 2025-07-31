'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { HighlightedContent } from '@/lib/search-highlight-react';
import { UDOAgGridTable } from './udo-ag-grid-table';
import { ProgressiveDefinitionProcessorV2 } from './progressive-definition-processor-v2';
import { GlobalDefinitionTooltipV2 } from './global-definition-tooltip-v2';
import { TooltipProvider as DefinitionTooltipProvider } from './definition-tooltip-context';
import { ContentWithHeadingLinks } from './content-with-heading-links';

interface UDOContentRendererV4Props {
  htmlContent: string;
  className?: string;
}

// Function to rewrite asset URLs to use the correct Directus instance
function rewriteAssetUrls(html: string): string {
  // Check deployment environment instead of just NODE_ENV
  const deploymentEnv = process.env.DEPLOYMENT_ENV?.toLowerCase();
  const isProduction = deploymentEnv === 'production' || process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // In production, replace localhost URLs with production URLs
    return html.replace(
      /http:\/\/localhost:8056\/assets\//g,
      'https://admin.charlotteudo.org/assets/'
    );
  } else {
    // In development, replace production URLs with localhost URLs
    return html.replace(
      /https:\/\/admin\.charlotteudo\.org\/assets\//g,
      'http://localhost:8056/assets/'
    );
  }
}

interface ProcessedContent {
  htmlParts: string[];
  tables: string[];
  placeholderPositions: number[];
}

function extractTables(html: string): ProcessedContent {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Look for table wrappers with titles
  const tableWrappers = doc.querySelectorAll('.table-wrapper');
  const extractedTables: string[] = [];
  const placeholderPositions: number[] = [];
  
  if (tableWrappers.length > 0) {
    // Extract entire table wrapper (includes title)
    tableWrappers.forEach((wrapper, index) => {
      const wrapperHtml = wrapper.outerHTML;
      extractedTables.push(wrapperHtml);
      
      // Create a placeholder with reserved space
      const placeholder = doc.createElement('div');
      placeholder.className = 'table-loading-placeholder';
      placeholder.setAttribute('data-table-index', index.toString());
      // Reserve space based on table content
      const rows = wrapper.querySelectorAll('tr').length;
      const minHeight = Math.max(200, rows * 40);
      placeholder.style.minHeight = `${minHeight}px`;
      placeholder.innerHTML = `
        <div class="table-skeleton animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div class="grid grid-cols-3 gap-4 mb-2">
            <div class="h-4 bg-gray-200 rounded"></div>
            <div class="h-4 bg-gray-200 rounded"></div>
            <div class="h-4 bg-gray-200 rounded"></div>
          </div>
          ${Array.from({ length: Math.min(5, rows - 1) }).map(() => `
            <div class="grid grid-cols-3 gap-4 mb-2">
              <div class="h-3 bg-gray-100 rounded"></div>
              <div class="h-3 bg-gray-100 rounded"></div>
              <div class="h-3 bg-gray-100 rounded"></div>
            </div>
          `).join('')}
        </div>
      `;
      
      wrapper.parentNode?.replaceChild(placeholder, wrapper);
      placeholderPositions.push(index);
    });
  } else {
    // Fallback to extracting just tables
    const tables = doc.querySelectorAll('table');
    tables.forEach((table, index) => {
      const tableHtml = table.outerHTML;
      extractedTables.push(tableHtml);
      
      // Create placeholder
      const placeholder = doc.createElement('div');
      placeholder.className = 'table-loading-placeholder';
      placeholder.setAttribute('data-table-index', index.toString());
      const rows = table.querySelectorAll('tr').length;
      const minHeight = Math.max(150, rows * 35);
      placeholder.style.minHeight = `${minHeight}px`;
      placeholder.innerHTML = `
        <div class="table-skeleton animate-pulse">
          <div class="grid grid-cols-3 gap-4 mb-2">
            <div class="h-4 bg-gray-200 rounded"></div>
            <div class="h-4 bg-gray-200 rounded"></div>
            <div class="h-4 bg-gray-200 rounded"></div>
          </div>
          ${Array.from({ length: Math.min(4, rows - 1) }).map(() => `
            <div class="grid grid-cols-3 gap-4 mb-2">
              <div class="h-3 bg-gray-100 rounded"></div>
              <div class="h-3 bg-gray-100 rounded"></div>
              <div class="h-3 bg-gray-100 rounded"></div>
            </div>
          `).join('')}
        </div>
      `;
      
      table.parentNode?.replaceChild(placeholder, table);
      placeholderPositions.push(index);
    });
  }
  
  // Get the modified HTML with placeholders
  const modifiedHtml = doc.body.innerHTML;
  
  // Split by placeholders
  const parts = modifiedHtml.split(/<div class="table-loading-placeholder"[^>]*>[\s\S]*?<\/div>\s*<\/div>/);
  
  return {
    htmlParts: parts,
    tables: extractedTables,
    placeholderPositions
  };
}

export function UDOContentRendererV4({ htmlContent, className }: UDOContentRendererV4Props) {
  const searchParams = useSearchParams();
  const searchTerm = searchParams?.get('search') || '';
  const [isProcessing, setIsProcessing] = useState(true);
  const [processedContent, setProcessedContent] = useState<ProcessedContent | null>(null);
  const [tablesReady, setTablesReady] = useState<Set<number>>(new Set());
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Process content on mount
  useEffect(() => {
    const processContent = () => {
      const rewrittenContent = rewriteAssetUrls(htmlContent);
      const processed = extractTables(rewrittenContent);
      setProcessedContent(processed);
      setIsProcessing(false);
    };
    
    // Use requestIdleCallback for better performance
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(processContent);
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(processContent, 0);
    }
  }, [htmlContent]);
  
  // Memoize the initial content to prevent re-renders
  const initialContent = useMemo(() => {
    const rewrittenContent = rewriteAssetUrls(htmlContent);
    return (
      <HighlightedContent
        html={rewrittenContent}
        searchTerm={searchTerm}
      />
    );
  }, [htmlContent, searchTerm]);
  
  // Handle table ready state
  const handleTableReady = (index: number) => {
    console.log(`Table ${index} is ready`);
    setTablesReady(prev => {
      const newSet = new Set(prev);
      newSet.add(index);
      console.log('Tables ready:', Array.from(newSet));
      return newSet;
    });
  };
  
  // Show initial content with proper spacing while processing
  if (isProcessing || !processedContent) {
    return (
      <DefinitionTooltipProvider>
        <div className={className || "udo-content"}>
          <ProgressiveDefinitionProcessorV2 content={initialContent} />
        </div>
        <GlobalDefinitionTooltipV2 />
      </DefinitionTooltipProvider>
    );
  }
  
  // Render with tables
  return (
    <DefinitionTooltipProvider>
      <ContentWithHeadingLinks>
        <div className={className || "udo-content"} ref={contentRef}>
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
                      <div className="my-4">
                        {tablesReady.has(index) ? (
                          <UDOAgGridTable 
                            htmlString={processedContent.tables[index]}
                            tableIndex={index}
                            onReady={() => handleTableReady(index)}
                          />
                        ) : (
                          <TableSkeleton />
                        )}
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

// Table skeleton component
function TableSkeleton() {
  return (
    <div className="animate-pulse border border-gray-200 rounded-lg p-4">
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
  );
}