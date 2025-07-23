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
  const directusUrl = process.env.DIRECTUS_URL || 'https://admin.charlotteudo.org';
  
  console.log('[udo-content-wrapper] Rewriting URLs from admin.charlotteudo.org to:', directusUrl);
  
  // Count replacements for logging
  let replacementCount = 0;
  
  // Replace all admin.charlotteudo.org URLs with the current Directus URL
  const rewritten = html.replace(
    /https:\/\/admin\.charlotteudo\.org/g,
    (match) => {
      replacementCount++;
      return directusUrl;
    }
  );
  
  console.log(`[udo-content-wrapper] Replaced ${replacementCount} URLs`);
  
  return rewritten;
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