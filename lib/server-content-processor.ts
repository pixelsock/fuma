import { JSDOM } from 'jsdom';

interface ProcessedContent {
  htmlParts: string[];
  tables: string[];
}

// Function to rewrite asset URLs to use the correct Directus instance
export function rewriteAssetUrls(html: string): string {
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

// Server-side table extraction using JSDOM
export function extractTablesServer(html: string): ProcessedContent {
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  
  // Look for table wrappers with titles
  const tableWrappers = doc.querySelectorAll('.table-wrapper');
  const extractedTables: string[] = [];
  
  if (tableWrappers.length > 0) {
    // Extract entire table wrapper (includes title)
    tableWrappers.forEach((wrapper, index) => {
      const wrapperHtml = wrapper.outerHTML;
      extractedTables.push(wrapperHtml);
      
      // Replace the wrapper with a placeholder that won't cause layout shift
      const placeholder = doc.createElement('div');
      placeholder.className = 'table-placeholder';
      placeholder.setAttribute('data-table-index', index.toString());
      // Reserve approximate space for table
      placeholder.style.minHeight = '200px';
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
      placeholder.className = 'table-placeholder';
      placeholder.setAttribute('data-table-index', index.toString());
      placeholder.style.minHeight = '150px';
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

// Pre-process content on the server
export function preprocessContent(htmlContent: string): ProcessedContent {
  const rewrittenContent = rewriteAssetUrls(htmlContent);
  return extractTablesServer(rewrittenContent);
}