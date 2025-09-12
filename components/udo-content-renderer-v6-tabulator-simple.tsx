'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProgressiveDefinitionProcessorV2 } from './progressive-definition-processor-v2';
import { GlobalDefinitionTooltipV2 } from './global-definition-tooltip-v2';
import { TooltipProvider as DefinitionTooltipProvider } from './definition-tooltip-context';
import { HighlightedContent } from '@/lib/search-highlight-react';

interface UDOContentRendererV6TabulatorSimpleProps {
  htmlContent: string;
  className?: string;
}

// Function to rewrite asset URLs to use the correct Directus instance
function rewriteAssetUrls(html: string): string {
  const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.charlotteudo.org';
  
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

export function UDOContentRendererV6TabulatorSimple({ htmlContent, className }: UDOContentRendererV6TabulatorSimpleProps) {
  const searchParams = useSearchParams();
  const searchTerm = searchParams?.get('search') || '';
  const contentRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [tablesEnhanced, setTablesEnhanced] = useState(0);
  const [totalTables, setTotalTables] = useState(0);
  const tabulatorRefs = useRef<Map<number, any>>(new Map());
  
  // Process content
  const rewrittenContent = rewriteAssetUrls(htmlContent);
  
  // Initialize Tabulator on tables after render
  useEffect(() => {
    if (!contentRef.current) return;
    
    // Wait for DOM to settle and then initialize Tabulator
    const timer = setTimeout(async () => {
      try {
        // Dynamic import of Tabulator
        const { TabulatorFull } = await import('tabulator-tables');
        
        // Import CSS dynamically
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/tabulator-tables@6.3.1/dist/css/tabulator.min.css';
        document.head.appendChild(link);
        
        console.log('Tabulator loaded successfully');
        initializeTables(TabulatorFull);
      } catch (error) {
        console.error('Failed to load Tabulator:', error);
        setIsReady(true); // Mark as ready even if failed
      }
    }, 1000);
    
    function initializeTables(Tabulator: any) {
      const tables = contentRef.current?.querySelectorAll('table');
      if (!tables) {
        setIsReady(true);
        return;
      }
      
      setTotalTables(tables.length);
      console.log(`Found ${tables.length} tables to enhance`);
      
      if (tables.length === 0) {
        setIsReady(true);
        return;
      }
      
      tables.forEach((table, index) => {
        // Skip if already processed
        if (table.hasAttribute('data-tabulator-initialized')) return;
        
        try {
          console.log(`Initializing Tabulator on table ${index}`, table);
          
          // Mark as initialized
          table.setAttribute('data-tabulator-initialized', 'true');
          
          // Initialize Tabulator directly on the table
          const tabulator = new Tabulator(table, {
            layout: 'fitDataFill',
            responsiveLayout: 'hide',
            height: 'auto',
            movableColumns: true,
            headerSort: true,
            resizableColumns: true,
            tableBuilt: function() {
              console.log(`Tabulator ${index} built successfully`);
              setTablesEnhanced(prev => {
                const newCount = prev + 1;
                if (newCount >= totalTables) {
                  setIsReady(true);
                }
                return newCount;
              });
            },
          });
          
          // Store reference
          tabulatorRefs.current.set(index, tabulator);
          
          // Fallback: if tableBuilt doesn't fire, mark as ready after a timeout
          setTimeout(() => {
            setTablesEnhanced(prev => {
              const newCount = prev + 1;
              if (newCount >= totalTables) {
                setIsReady(true);
              }
              return newCount;
            });
          }, 2000);
          
        } catch (error) {
          console.error(`Failed to initialize Tabulator on table ${index}:`, error);
          setTablesEnhanced(prev => {
            const newCount = prev + 1;
            if (newCount >= totalTables) {
              setIsReady(true);
            }
            return newCount;
          });
        }
      });
    }
    
    return () => clearTimeout(timer);
  }, [rewrittenContent, totalTables]);
  
  // Cleanup Tabulator instances on unmount
  useEffect(() => {
    return () => {
      tabulatorRefs.current.forEach((tabulator, index) => {
        try {
          tabulator.destroy();
          console.log(`Destroyed Tabulator instance ${index}`);
        } catch (error) {
          console.error(`Failed to destroy Tabulator instance ${index}:`, error);
        }
      });
      tabulatorRefs.current.clear();
    };
  }, []);
  
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
        
        {/* Loading indicator */}
        {!isReady && totalTables > 0 && (
          <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Enhancing tables with Tabulator... ({tablesEnhanced}/{totalTables})</span>
            </div>
          </div>
        )}
      </div>
      <GlobalDefinitionTooltipV2 />
    </DefinitionTooltipProvider>
  );
}