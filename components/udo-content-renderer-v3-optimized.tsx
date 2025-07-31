'use client';

import React, { useState, useEffect } from 'react';
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
  const [tablesReady, setTablesReady] = useState<Set<number>>(new Set());
  const [extractedTables, setExtractedTables] = useState<string[]>([]);
  const [contentWithPlaceholders, setContentWithPlaceholders] = useState<string>('');
  const [hasProcessedTables, setHasProcessedTables] = useState(false);
  
  // Process content consistently for both server and client
  const rewrittenContent = rewriteAssetUrls(htmlContent);
  
  // Client-side table extraction after hydration
  useEffect(() => {
    if (hasProcessedTables) return; // Only process once
    
    const extractTablesFromContent = () => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(rewrittenContent, 'text/html');
      
      const tables = doc.querySelectorAll('table');
      const extractedTables: string[] = [];
      let modifiedContent = rewrittenContent;
      
      if (tables.length > 0) {
        console.log(`Found ${tables.length} tables for client-side processing`);
        
        // Process tables in reverse order to maintain indices
        for (let i = tables.length - 1; i >= 0; i--) {
          const table = tables[i];
          const tableHtml = table.outerHTML;
          extractedTables.unshift(tableHtml);
          
          // Replace table with placeholder
          const placeholder = `<!--TABLE_PLACEHOLDER_${extractedTables.length - 1}-->`;
          modifiedContent = modifiedContent.replace(tableHtml, placeholder);
        }
        
        setExtractedTables(extractedTables);
        setContentWithPlaceholders(modifiedContent);
        setHasProcessedTables(true);
      } else {
        // No tables found, use original content
        setContentWithPlaceholders(rewrittenContent);
        setHasProcessedTables(true);
      }
    };
    
    // Small delay to ensure hydration is complete
    const timer = setTimeout(extractTablesFromContent, 100);
    return () => clearTimeout(timer);
  }, [rewrittenContent, hasProcessedTables]);
  
  // If no tables found or not yet processed, render simple content
  if (!hasProcessedTables || extractedTables.length === 0) {
    return (
      <DefinitionTooltipProvider>
        <div className={`udo-content ${className}`}>
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
  
  // Process table placeholders
  const contentParts = contentWithPlaceholders.split(/<!--TABLE_PLACEHOLDER_\d+-->/);
  
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
  
  // Render content with AG-Grid tables
  return (
    <DefinitionTooltipProvider>
      <div className={`udo-content ${className}`}>
        <ProgressiveDefinitionProcessorV2 
          content={
            <>
              {contentParts.map((part, index) => (
                <React.Fragment key={index}>
                  {part && part.trim() && (
                    <HighlightedContent
                      html={part}
                      searchTerm={searchTerm}
                    />
                  )}
                  {index < extractedTables.length && extractedTables[index] && (
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
                          htmlString={extractedTables[index]}
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
      <GlobalDefinitionTooltipV2 />
    </DefinitionTooltipProvider>
  );
}