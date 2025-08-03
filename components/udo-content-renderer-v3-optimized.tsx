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
  const [tableOverlays, setTableOverlays] = useState<Array<{
    id: string;
    originalTable: HTMLElement;
    tableHtml: string;
    position: { top: number; left: number; width: number; height: number };
  }>>([]);
  const [tablesReady, setTablesReady] = useState<Set<string>>(new Set());
  
  // Process content consistently for both server and client
  const rewrittenContent = rewriteAssetUrls(htmlContent);
  
  // Create AG-Grid overlays for existing tables without modifying content structure
  useEffect(() => {
    if (!contentRef.current) return;
    
    const createTableOverlays = () => {
      const contentElement = contentRef.current;
      if (!contentElement) return;
      
      const tables = contentElement.querySelectorAll('table');
      const overlays: Array<{
        id: string;
        originalTable: HTMLElement;
        tableHtml: string;
        position: { top: number; left: number; width: number; height: number };
      }> = [];
      
      tables.forEach((table, index) => {
        // Skip if already processed
        if (table.hasAttribute('data-ag-grid-processed')) return;
        
        const tableElement = table as HTMLElement;
        const tableHtml = tableElement.outerHTML;
        const rect = tableElement.getBoundingClientRect();
        const contentRect = contentElement.getBoundingClientRect();
        
        // Mark as processed
        tableElement.setAttribute('data-ag-grid-processed', 'true');
        
        // Completely hide original table but keep it in DOM for TOC
        tableElement.style.display = 'none';
        tableElement.style.visibility = 'hidden';
        tableElement.style.position = 'absolute';
        tableElement.style.top = '-9999px';
        tableElement.style.left = '-9999px';
        tableElement.style.width = '0';
        tableElement.style.height = '0';
        tableElement.style.overflow = 'hidden';
        tableElement.style.opacity = '0';
        tableElement.style.pointerEvents = 'none';
        
        overlays.push({
          id: `table-overlay-${index}`,
          originalTable: tableElement,
          tableHtml,
          position: {
            top: rect.top - contentRect.top,
            left: rect.left - contentRect.left,
            width: rect.width,
            height: rect.height
          }
        });
      });
      
      setTableOverlays(overlays);
    };
    
    // Wait for content to be fully rendered and positioned
    const timer = setTimeout(createTableOverlays, 500);
    return () => clearTimeout(timer);
  }, [rewrittenContent]);
  
  const handleTableReady = (tableId: string) => {
    setTimeout(() => {
      setTablesReady(prev => {
        const newSet = new Set(prev);
        newSet.add(tableId);
        return newSet;
      });
    }, 100);
  };
  
  // Render content with AG-Grid overlays
  return (
    <DefinitionTooltipProvider>
      <div className={`udo-content ${className}`} ref={contentRef} style={{ position: 'relative' }}>
        <ProgressiveDefinitionProcessorV2 
          content={
            <HighlightedContent
              html={rewrittenContent}
              searchTerm={searchTerm}
            />
          } 
        />
        
        {/* AG-Grid table overlays */}
        {tableOverlays.map((overlay) => (
          <div
            key={overlay.id}
            className="ag-grid-overlay"
            style={{
              position: 'absolute',
              top: `${overlay.position.top}px`,
              left: `${overlay.position.left}px`,
              width: `${overlay.position.width}px`,
              minHeight: `${overlay.position.height}px`,
              zIndex: 10,
              opacity: tablesReady.has(overlay.id) ? 1 : 0,
              transition: 'opacity 0.3s ease-out',
              backgroundColor: 'white', // Ensure background covers original table
            }}
          >
            {!tablesReady.has(overlay.id) && (
              <TableLoading tableIndex={parseInt(overlay.id.split('-').pop() || '0')} />
            )}
            <div 
              className="table-wrapper" 
              style={{ 
                opacity: tablesReady.has(overlay.id) ? 1 : 0,
                height: tablesReady.has(overlay.id) ? 'auto' : 0,
                overflow: 'hidden',
                transition: 'opacity 0.3s ease-out, height 0.3s ease-out',
                visibility: tablesReady.has(overlay.id) ? 'visible' : 'hidden',
                pointerEvents: tablesReady.has(overlay.id) ? 'auto' : 'none'
              }}
            >
              <UDOAgGridTable 
                htmlString={overlay.tableHtml}
                tableIndex={parseInt(overlay.id.split('-').pop() || '0')}
                onReady={() => handleTableReady(overlay.id)}
              />
            </div>
          </div>
        ))}
      </div>
      <GlobalDefinitionTooltipV2 />
    </DefinitionTooltipProvider>
  );
}