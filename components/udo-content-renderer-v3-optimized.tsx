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
  const contentRef = useRef<HTMLDivElement>(null);
  const [enhancedTables, setEnhancedTables] = useState<Map<number, { element: HTMLElement; tableHtml: string }>>(new Map());
  const [tablesReady, setTablesReady] = useState<Set<number>>(new Set());
  const [agGridEnabled, setAgGridEnabled] = useState(false);
  
  // Process content consistently for both server and client
  const rewrittenContent = rewriteAssetUrls(htmlContent);
  
  // Enable AG-Grid after initial render to preserve TOC
  useEffect(() => {
    const timer = setTimeout(() => {
      setAgGridEnabled(true);
    }, 1000); // Wait 1 second for TOC to initialize
    
    return () => clearTimeout(timer);
  }, []);
  
  // Enhance existing tables with AG-Grid after TOC is ready
  useEffect(() => {
    if (!agGridEnabled || !contentRef.current) return;
    
    const enhanceTables = () => {
      const contentElement = contentRef.current;
      if (!contentElement) return;
      
      const tables = contentElement.querySelectorAll('table');
      const newEnhancedTables = new Map<number, { element: HTMLElement; tableHtml: string }>();
      
      tables.forEach((table, index) => {
        // Skip if already enhanced
        if (table.hasAttribute('data-ag-grid-enhanced')) return;
        
        const tableElement = table as HTMLElement;
        const tableHtml = tableElement.outerHTML;
        
        // Mark as enhanced
        tableElement.setAttribute('data-ag-grid-enhanced', 'true');
        
        // Hide original table but keep it in DOM for TOC
        tableElement.style.display = 'none';
        tableElement.style.visibility = 'hidden';
        tableElement.style.height = '0';
        tableElement.style.overflow = 'hidden';
        tableElement.style.opacity = '0';
        tableElement.style.pointerEvents = 'none';
        
        // Store the table for AG-Grid enhancement
        newEnhancedTables.set(index, { element: tableElement, tableHtml });
      });
      
      setEnhancedTables(newEnhancedTables);
    };
    
    // Small delay to ensure content is fully rendered
    const timer = setTimeout(enhanceTables, 200);
    return () => clearTimeout(timer);
  }, [agGridEnabled, rewrittenContent]);
  
  const handleTableReady = (index: number) => {
    setTimeout(() => {
      setTablesReady(prev => {
        const newSet = new Set(prev);
        newSet.add(index);
        return newSet;
      });
    }, 100);
  };
  
  // Render content with delayed AG-Grid enhancement
  return (
    <DefinitionTooltipProvider>
      <div className={`udo-content ${className}`} ref={contentRef}>
        <ProgressiveDefinitionProcessorV2 
          content={
            <HighlightedContent
              html={rewrittenContent}
              searchTerm={searchTerm}
            />
          } 
        />
        
        {/* Render AG-Grid tables after TOC is ready */}
        {agGridEnabled && Array.from(enhancedTables.entries()).map(([index, { element, tableHtml }]) => (
          <div 
            key={`ag-grid-${index}`} 
            className="ag-grid-enhanced-table"
            style={{
              marginTop: '1rem',
              marginBottom: '1rem',
              position: 'relative',
              zIndex: 1,
            }}
          >
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
                maxWidth: '100%',
              }}
            >
              <UDOAgGridTable 
                htmlString={tableHtml}
                tableIndex={index}
                onReady={() => handleTableReady(index)}
              />
            </div>
          </div>
        ))}
      </div>
      <GlobalDefinitionTooltipV2 />
    </DefinitionTooltipProvider>
  );
}