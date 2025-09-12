'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { HighlightedContent } from '@/lib/search-highlight-react';
import { UDOAgGridTable } from './udo-ag-grid-table';
import { DefinitionLinksProcessor } from './definition-links-processor';
import { ContentWithHeadingLinks } from './content-with-heading-links';

interface UDOContentWithAgGridProps {
  htmlContent: string;
  className?: string;
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
      'https://admin.charlotteudo.org/assets/'
    );
  }
}

interface ProcessedContent {
  htmlParts: string[];
  tables: string[];
}

function extractTables(html: string): ProcessedContent {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Look for table wrappers with titles
  const tableWrappers = doc.querySelectorAll('.table-wrapper');
  const extractedTables: string[] = [];
  
  if (tableWrappers.length > 0) {
    // Extract entire table wrapper (includes title)
    tableWrappers.forEach((wrapper, index) => {
      const wrapperHtml = wrapper.outerHTML;
      extractedTables.push(wrapperHtml);
      
      // Replace the wrapper with a placeholder
      const placeholder = doc.createElement('div');
      placeholder.innerHTML = `<!--TABLE_PLACEHOLDER_${index}-->`;
      wrapper.parentNode?.replaceChild(placeholder, wrapper);
    });
  } else {
    // Fallback to extracting just tables
    const tables = doc.querySelectorAll('table');
    tables.forEach((table, index) => {
      const tableHtml = table.outerHTML;
      extractedTables.push(tableHtml);
      
      // Replace the table with a placeholder
      const placeholder = doc.createElement('div');
      placeholder.innerHTML = `<!--TABLE_PLACEHOLDER_${index}-->`;
      table.parentNode?.replaceChild(placeholder, table);
    });
  }
  
  // Get the modified HTML with placeholders
  const modifiedHtml = doc.body.innerHTML;
  
  // Split by placeholders
  const parts = modifiedHtml.split(/<!--TABLE_PLACEHOLDER_(\d+)-->/);
  const htmlParts: string[] = [];
  
  // Process the parts to maintain order
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      // This is HTML content
      htmlParts.push(parts[i]);
    } else {
      // This is a table index - skip it as we'll insert tables separately
    }
  }
  
  return {
    htmlParts: htmlParts,
    tables: extractedTables
  };
}

export function UDOContentWithAgGrid({ 
  htmlContent, 
  className = ''
}: UDOContentWithAgGridProps) {
  const searchParams = useSearchParams();
  const searchTerm = searchParams?.get('search') || '';
  const [processedContent, setProcessedContent] = useState<ProcessedContent | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const rewrittenContent = rewriteAssetUrls(htmlContent);
      const processed = extractTables(rewrittenContent);
      console.log('Extracted tables:', processed.tables.length, 'tables found');
      console.log('HTML parts:', processed.htmlParts.length, 'parts');
      setProcessedContent(processed);
    }
  }, [htmlContent]);
  
  if (!processedContent) {
    // Server-side render or initial load
    const rewrittenContent = rewriteAssetUrls(htmlContent);
    return (
      <DefinitionLinksProcessor>
        <div className={`udo-content ${className}`}>
          <HighlightedContent
            html={rewrittenContent}
            searchTerm={searchTerm}
          />
        </div>
      </DefinitionLinksProcessor>
    );
  }
  
  // Render with AG-Grid tables and definition tooltips
  return (
    <DefinitionLinksProcessor>
      <ContentWithHeadingLinks>
        <div className={`udo-content ${className}`}>
          {processedContent.htmlParts.map((part, index) => (
            <React.Fragment key={index}>
              {part && part.trim() && (
                <HighlightedContent
                  html={part}
                  searchTerm={searchTerm}
                />
              )}
              {index < processedContent.tables.length && processedContent.tables[index] && (
                <div className="my-4">
                  <UDOAgGridTable 
                    htmlString={processedContent.tables[index]}
                    tableIndex={index}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </ContentWithHeadingLinks>
    </DefinitionLinksProcessor>
  );
}