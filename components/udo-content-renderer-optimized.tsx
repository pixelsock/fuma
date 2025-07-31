'use client';

import React, { Suspense, lazy, useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { HighlightedContent } from '@/lib/search-highlight-react';
import { ProgressiveDefinitionProcessorV2 } from './progressive-definition-processor-v2';
import { GlobalDefinitionTooltipV2 } from './global-definition-tooltip-v2';
import { TooltipProvider as DefinitionTooltipProvider } from './definition-tooltip-context';
import { ContentWithHeadingLinks } from './content-with-heading-links';

// Lazy load the AG-Grid table component to improve initial load
const UDOAgGridTable = lazy(() => 
  import('./udo-ag-grid-table').then(module => ({ default: module.UDOAgGridTable }))
);

interface UDOContentRendererOptimizedProps {
  htmlContent: string;
  className?: string;
  // Pre-processed content from server
  preprocessed?: {
    htmlParts: string[];
    tables: string[];
  };
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
      placeholder.className = 'table-placeholder';
      placeholder.setAttribute('data-table-index', index.toString());
      // Add loading skeleton while table loads
      placeholder.innerHTML = `
        <div class="animate-pulse my-4 border border-gray-200 rounded-lg p-4">
          <div class="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div class="grid grid-cols-3 gap-4 mb-2">
            <div class="h-4 bg-gray-200 rounded"></div>
            <div class="h-4 bg-gray-200 rounded"></div>
            <div class="h-4 bg-gray-200 rounded"></div>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div class="h-3 bg-gray-100 rounded"></div>
            <div class="h-3 bg-gray-100 rounded"></div>
            <div class="h-3 bg-gray-100 rounded"></div>
          </div>
        </div>
      `;
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
      placeholder.className = 'table-placeholder';
      placeholder.setAttribute('data-table-index', index.toString());
      placeholder.innerHTML = `
        <div class="animate-pulse my-4 border border-gray-200 rounded-lg p-4">
          <div class="grid grid-cols-3 gap-4 mb-2">
            <div class="h-4 bg-gray-200 rounded"></div>
            <div class="h-4 bg-gray-200 rounded"></div>
            <div class="h-4 bg-gray-200 rounded"></div>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div class="h-3 bg-gray-100 rounded"></div>
            <div class="h-3 bg-gray-100 rounded"></div>
            <div class="h-3 bg-gray-100 rounded"></div>
          </div>
        </div>
      `;
      table.parentNode?.replaceChild(placeholder, table);
    });
  }
  
  // Get the modified HTML with placeholders
  const modifiedHtml = doc.body.innerHTML;
  
  // Split by placeholders
  const parts = modifiedHtml.split(/<div class="table-placeholder"[^>]*>[\s\S]*?<\/div>/);
  
  return {
    htmlParts: parts,
    tables: extractedTables
  };
}

// Table loading skeleton component
function TableSkeleton() {
  return (
    <div className="animate-pulse my-4 border border-gray-200 rounded-lg p-4">
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

export function UDOContentRendererOptimized({ 
  htmlContent, 
  className,
  preprocessed 
}: UDOContentRendererOptimizedProps) {
  const searchParams = useSearchParams();
  const searchTerm = searchParams?.get('search') || '';
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Always use preprocessed content if available (from server)
  // Only process on client if not preprocessed
  const processedContent = useMemo(() => {
    if (preprocessed) {
      return preprocessed;
    }
    
    // Only process on client after hydration
    if (isClient) {
      const rewrittenContent = rewriteAssetUrls(htmlContent);
      return extractTables(rewrittenContent);
    }
    
    return null;
  }, [htmlContent, preprocessed, isClient]);
  
  // During SSR or initial client render, show with placeholders if no preprocessed data
  if (!processedContent) {
    const rewrittenContent = rewriteAssetUrls(htmlContent);
    
    return (
      <DefinitionTooltipProvider>
        <div className={className || "udo-content"}>
          <ProgressiveDefinitionProcessorV2 
            content={
              <HighlightedContent
                html={rewrittenContent}
                searchTerm={searchTerm}
              />
            } 
          />
        </div>
        <GlobalDefinitionTooltipV2 />
      </DefinitionTooltipProvider>
    );
  }
  
  // Render with progressive table loading
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
                      <div className="my-4">
                        <Suspense fallback={<TableSkeleton />}>
                          <UDOAgGridTable 
                            htmlString={processedContent.tables[index]}
                            tableIndex={index}
                          />
                        </Suspense>
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