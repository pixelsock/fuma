'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
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

export function UDOContentRendererV3Optimized({ htmlContent, className, tables }: UDOContentRendererV3OptimizedProps) {
  const searchParams = useSearchParams();
  const searchTerm = searchParams?.get('search') || '';
  
  // Process content consistently for both server and client
  const rewrittenContent = rewriteAssetUrls(htmlContent);
  
  // Simple render without any table processing to ensure TOC works
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