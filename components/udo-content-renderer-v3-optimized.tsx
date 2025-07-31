'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { UDOAgGridTable } from './udo-ag-grid-table';
import { ProgressiveDefinitionProcessorV2 } from './progressive-definition-processor-v2';
import { GlobalDefinitionTooltipV2 } from './global-definition-tooltip-v2';
import { TooltipProvider as DefinitionTooltipProvider } from './definition-tooltip-context';
import { HighlightedContent } from '@/lib/search-highlight-react';
import { ContentWithHeadingLinks } from './content-with-heading-links';

interface UDOContentRendererV3OptimizedProps {
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
      'http://localhost:8056/assets/'
    );
  }
}

// Function to ensure heading IDs match TOC URLs
function ensureHeadingIds(html: string): string {
  if (!html) return html;
  
  return html.replace(/<(h[1-6])([^>]*)>(.*?)<\/h[1-6]>/gi, (match, tagName, attributes, titleHTML) => {
    // Check if heading already has an ID
    const hasId = /\s+id\s*=\s*["\'][^"\']*["\']/.test(attributes);
    if (hasId) return match;
    
    // Extract text content from HTML (remove any tags)
    const title = titleHTML.replace(/<[^>]*>/g, '').trim();
    if (!title) return match;
    
    // Generate ID using the same logic as TOC generation
    const id = title
      .toLowerCase()
      .replace(/[^a-z0-9\s\-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
    
    // Add ID to the heading
    return `<${tagName}${attributes} id="${id}">${titleHTML}</${tagName}>`;
  });
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

// Table loading component
function TableLoading({ tableIndex }: { tableIndex: number }) {
  return (
    <div className="my-4 table-loading-wrapper" data-table-index={tableIndex}>
      <div className="animate-pulse border border-gray-200 rounded-lg p-4 bg-gray-50">
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
    </div>
  );
}

export function UDOContentRendererV3Optimized({ htmlContent, className }: UDOContentRendererV3OptimizedProps) {
  const searchParams = useSearchParams();
  const searchTerm = searchParams?.get('search') || '';
  
  // Process content consistently for both server and client
  const rewrittenContent = rewriteAssetUrls(htmlContent);
  const contentWithIds = ensureHeadingIds(rewrittenContent);
  
  // For now, render without table extraction to avoid hydration issues
  // We can add table extraction back later if needed
  return (
    <DefinitionTooltipProvider>
      <div className={`udo-content ${className}`}>
        <HighlightedContent
          html={contentWithIds}
          searchTerm={searchTerm}
        />
      </div>
      <GlobalDefinitionTooltipV2 />
    </DefinitionTooltipProvider>
  );
}