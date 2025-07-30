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
  const isProduction = process.env.NODE_ENV === 'production';
  
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