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
  // Check deployment environment instead of just NODE_ENV
  const deploymentEnv = process.env.DEPLOYMENT_ENV?.toLowerCase();
  const isProduction = deploymentEnv === 'production' || process.env.NODE_ENV === 'production';
  
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