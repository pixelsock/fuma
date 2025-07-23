'use client';

import React, { Suspense, lazy } from 'react';
import { useSearchParams } from 'next/navigation';
import { HighlightedContent } from '@/lib/search-highlight-react';
import { ProgressiveDefinitionProcessorV2 } from './progressive-definition-processor-v2';
import { GlobalDefinitionTooltipV2 } from './global-definition-tooltip-v2';
import { TooltipProvider as DefinitionTooltipProvider } from './definition-tooltip-context';
import { ContentWithHeadingLinks } from './content-with-heading-links';

// Lazy load the AG-Grid table component
const UDOAgGridTable = lazy(() => 
  import('./udo-ag-grid-table').then(module => ({ default: module.UDOAgGridTable }))
);

interface UDOContentRendererSSRProps {
  htmlContent: string;
  className?: string;
  // Pre-processed content from server
  preprocessed: {
    htmlParts: string[];
    tables: string[];
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

export function UDOContentRendererSSR({ 
  htmlContent, 
  className,
  preprocessed 
}: UDOContentRendererSSRProps) {
  const searchParams = useSearchParams();
  const searchTerm = searchParams?.get('search') || '';
  
  // Always render with preprocessed content for consistent SSR/client rendering
  return (
    <DefinitionTooltipProvider>
      <ContentWithHeadingLinks>
        <div className={className || "udo-content"}>
          <ProgressiveDefinitionProcessorV2 
            content={
              <>
                {preprocessed.htmlParts.map((part, index) => (
                  <React.Fragment key={index}>
                    {part && part.trim() && (
                      <HighlightedContent
                        html={part}
                        searchTerm={searchTerm}
                      />
                    )}
                    {index < preprocessed.tables.length && preprocessed.tables[index] && (
                      <div className="my-4">
                        <Suspense fallback={<TableSkeleton />}>
                          <UDOAgGridTable 
                            htmlString={preprocessed.tables[index]}
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