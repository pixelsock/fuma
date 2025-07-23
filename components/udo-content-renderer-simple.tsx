'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { HighlightedContent } from '@/lib/search-highlight-react';

interface UDOContentRendererSimpleProps {
  htmlContent: string;
  className?: string;
}

// Function to rewrite asset URLs to use the correct Directus instance
function rewriteAssetUrls(html: string): string {
  const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8056';
  
  // Replace admin.charlotteudo.org with the current Directus URL
  return html.replace(
    /https:\/\/admin\.charlotteudo\.org/g,
    directusUrl
  );
}

export function UDOContentRendererSimple({ 
  htmlContent, 
  className = ''
}: UDOContentRendererSimpleProps) {
  const searchParams = useSearchParams();
  const searchTerm = searchParams?.get('search') || '';
  
  // Rewrite URLs for client-side rendering
  const rewrittenContent = rewriteAssetUrls(htmlContent);
  
  return (
    <div className={`udo-content ${className}`}>
      <HighlightedContent
        html={rewrittenContent}
        searchTerm={searchTerm}
      />
    </div>
  );
}