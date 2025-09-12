'use client';

import React, { useRef } from 'react';
import { useSearchParams } from 'next/navigation';
// import { UDOAgGridTable } from './udo-ag-grid-table'; // Disabled - using EnhancedTableV2 instead
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
  const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.charlotteudo.org';
  
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

// Table loading component - no longer needed with EnhancedTableV2
// function TableLoading({ tableIndex }: { tableIndex: number }) {
//   return (
//     <div className="my-4 table-loading-wrapper" data-table-index={tableIndex}>
//       <div className="animate-pulse border border-gray-200 rounded-lg p-4 bg-gray-50">
//         <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
//         <div className="grid grid-cols-3 gap-4 mb-2">
//           <div className="h-4 bg-gray-200 rounded"></div>
//           <div className="h-4 bg-gray-200 rounded"></div>
//           <div className="h-4 bg-gray-200 rounded"></div>
//         </div>
//         {[...Array(3)].map((_, i) => (
//           <div key={i} className="grid grid-cols-3 gap-4 mb-2">
//             <div className="h-3 bg-gray-100 rounded"></div>
//             <div className="h-3 bg-gray-100 rounded"></div>
//             <div className="h-3 bg-gray-100 rounded"></div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

export function UDOContentRendererV3Optimized({ htmlContent, className, tables }: UDOContentRendererV3OptimizedProps) {
  const searchParams = useSearchParams();
  const searchTerm = searchParams?.get('search') || '';
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Process content consistently for both server and client
  const rewrittenContent = rewriteAssetUrls(htmlContent);
  
  // AG-Grid table enhancement disabled - using EnhancedTableV2 instead
  // Tables are now enhanced by TableEnhancementProvider in app/provider.tsx
  
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
      </div>
      <GlobalDefinitionTooltipV2 />
    </DefinitionTooltipProvider>
  );
}