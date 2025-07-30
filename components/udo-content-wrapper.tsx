import { Suspense } from 'react';
// import { parseHTMLTablesImproved } from '@/lib/table-parser-improved';
// import { UDOContentClient } from './udo-content-client';
// import { UDOContentNoTables } from './udo-content-no-tables';
import { UDOContentWithAgGrid } from './udo-content-with-aggrid';

interface UDOContentWrapperProps {
  htmlContent: string;
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

// Server component that uses AG Grid for tables
export function UDOContentWrapper({ htmlContent }: UDOContentWrapperProps) {
  // Rewrite asset URLs to use the correct Directus instance
  const rewrittenContent = rewriteAssetUrls(htmlContent);
  
  // Use the AG Grid content renderer
  return (
    <Suspense fallback={<div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: rewrittenContent }} />}>
      <UDOContentWithAgGrid htmlContent={rewrittenContent} />
    </Suspense>
  );
}