import { JSDOM } from 'jsdom';

interface ProcessedContent {
  htmlParts: string[];
  tables: string[];
}

// Function to rewrite asset URLs to use the correct Directus instance
export function rewriteAssetUrls(html: string): string {
  // Check deployment environment with better debugging
  const deploymentEnv = process.env.DEPLOYMENT_ENV?.toLowerCase();
  const nodeEnv = process.env.NODE_ENV;
  const isProduction = deploymentEnv === 'production' || nodeEnv === 'production';
  
  // Debug logging for environment detection
  console.log('[server-content-processor] Environment detection:', {
    DEPLOYMENT_ENV: deploymentEnv,
    NODE_ENV: nodeEnv,
    isProduction,
    typeof_window: typeof window
  });
  
  if (isProduction) {
    // In production, replace localhost URLs with production URLs
    const result = html.replace(
      /http:\/\/localhost:8056\/assets\//g,
      'https://admin.charlotteudo.org/assets/'
    );
    console.log('[server-content-processor] Applied production URL rewrite');
    return result;
  } else {
    // In development, replace production URLs with localhost URLs
    const result = html.replace(
      /https:\/\/admin\.charlotteudo\.org\/assets\//g,
      'http://localhost:8056/assets/'
    );
    console.log('[server-content-processor] Applied development URL rewrite');
    return result;
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

// Server-side table enhancement - same logic as HtmlContent component
export function enhanceTablesServer(html: string): string {
  try {
    if (!html || html.trim() === '') {
      console.log('[server-content-processor] Empty HTML, returning as-is');
      return html;
    }
    
    const dom = new JSDOM(html);
    const doc = dom.window.document;
  
  console.log('[server-content-processor] Enhancing tables server-side');
  
  // Create a map of tables to their associated titles
  const tableToTitleMap = new Map<Element, Element>();
  const allTitleRows = doc.querySelectorAll('.table-title-row');
  console.log(`[server-content-processor] Found ${allTitleRows.length} .table-title-row elements`);

  // For each .table-title-row, find the nearest table that follows it
  allTitleRows.forEach(titleRow => {
    let nextSibling = titleRow.nextElementSibling;
    let searchCount = 0;
    while (nextSibling && searchCount < 10) {
      if (nextSibling.tagName === 'TABLE') {
        tableToTitleMap.set(nextSibling, titleRow);
        console.log(`[server-content-processor] Mapped title "${titleRow.textContent?.trim()}" to table`);
        break;
      }
      // Also check if there's a table inside this element
      const innerTable = nextSibling.querySelector('table');
      if (innerTable) {
        tableToTitleMap.set(innerTable, titleRow);
        console.log(`[server-content-processor] Mapped title "${titleRow.textContent?.trim()}" to inner table`);
        break;
      }
      nextSibling = nextSibling.nextElementSibling;
      searchCount++;
    }
  });

  // Enhance tables: wrap and apply standardized classes
  const tables = doc.querySelectorAll('table');
  console.log(`[server-content-processor] Found ${tables.length} tables to enhance`);
  
  tables.forEach((table, index) => {
    const el = table as Element;
    console.log(`[server-content-processor] Processing table ${index + 1}`);
    
    // Skip if already enhanced
    if (el.closest('.enhanced-table-container')) {
      console.log('[server-content-processor] Already enhanced, skipping');
      return;
    }

    // Extract title from table or preceding elements
    let extractedTitle = '';
    let titleElement: Element | null = null;

    // First check if this table has a mapped title
    const mappedTitle = tableToTitleMap.get(el);
    if (mappedTitle) {
      extractedTitle = mappedTitle.textContent?.trim() || '';
      titleElement = mappedTitle;
      console.log(`[server-content-processor] Using mapped title: "${extractedTitle}"`);
    } else {
      // Fallback: Look for table title elements with .table-title-row class in siblings
      let prevSibling = el.previousElementSibling;
      let searchCount = 0;
      console.log('[server-content-processor] No mapped title found, searching siblings...');
      while (prevSibling && searchCount < 5) {
        const text = prevSibling.textContent?.trim() || '';
        
        // Primary: Check if this element has the table-title-row class
        if ((prevSibling as Element).classList?.contains('table-title-row')) {
          console.log(`[server-content-processor] Found .table-title-row: "${text}"`);
          extractedTitle = text;
          titleElement = prevSibling;
          break;
        }
        // Fallback: Pattern matching for compatibility with other formats
        else if ((text.toLowerCase().includes('table') && text.includes(':')) || 
                 (text.match(/^Table\s+\d+/i)) ||
                 (text.match(/^Table\s+\w+-\d+/i))) {
          console.log(`[server-content-processor] Found by pattern: "${text}"`);
          extractedTitle = text;
          titleElement = prevSibling;
          break;
        }
        prevSibling = prevSibling.previousElementSibling;
        searchCount++;
      }
    }

    // Also check if first row is a title row
    if (!extractedTitle) {
      const firstRow = el.querySelector('tr');
      if (firstRow) {
        const cells = firstRow.querySelectorAll('td, th');
        // Check if first row is a title row (single cell spanning width OR contains table pattern)
        if (cells.length === 1) {
          const cellText = cells[0].textContent?.trim() || '';
          if ((cellText.toLowerCase().includes('table') && cellText.includes(':')) ||
              (cellText.match(/^Table\s+\d+/i)) ||
              (cellText.match(/^Table\s+\w+-\d+/i))) {
            extractedTitle = cellText;
            firstRow.remove(); // Remove title row from table
          }
        } else if (cells.length > 0 && cells[0].hasAttribute('colspan')) {
          const cellText = cells[0].textContent?.trim() || '';
          if ((cellText.toLowerCase().includes('table') && cellText.includes(':')) ||
              (cellText.match(/^Table\s+\d+/i)) ||
              (cellText.match(/^Table\s+\w+-\d+/i))) {
            extractedTitle = cellText;
            firstRow.remove(); // Remove title row from table
          }
        }
      }
    }

    // Ensure base class for cell borders/layout
    (el as Element).classList.add('enhanced-table');
    if (!(el as HTMLElement).style.width) (el as HTMLElement).style.width = '100%';
    if (!(el as HTMLElement).style.minWidth) (el as HTMLElement).style.minWidth = '100%';

    // Build wrappers
    const containerDiv = doc.createElement('div');
    containerDiv.className = 'enhanced-table-container';

    // Create toolbar if we have a title
    if (extractedTitle) {
      const toolbarDiv = doc.createElement('div');
      toolbarDiv.className = 'flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700';
      
      const titleSection = doc.createElement('div');
      titleSection.className = 'flex items-center space-x-3';
      
      const titleHeader = doc.createElement('h3');
      titleHeader.className = 'text-lg font-semibold text-gray-900 dark:text-white';
      titleHeader.textContent = extractedTitle;
      
      titleSection.appendChild(titleHeader);
      toolbarDiv.appendChild(titleSection);
      
      // Add empty controls section for consistency
      const controlsSection = doc.createElement('div');
      controlsSection.className = 'flex items-center space-x-2';
      toolbarDiv.appendChild(controlsSection);
      
      containerDiv.appendChild(toolbarDiv);

      // Remove the title element if it was found as a separate element
      if (titleElement) {
        titleElement.remove();
      }
    }

    const wrapperDiv = doc.createElement('div');
    wrapperDiv.className = 'table-wrapper overflow-auto';

    // Insert wrapper before table and move table inside
    const parent = el.parentElement;
    if (parent) {
      parent.insertBefore(containerDiv, el);
      containerDiv.appendChild(wrapperDiv);
      wrapperDiv.appendChild(el);
    }
  });

    return doc.body.innerHTML;
  } catch (error) {
    console.error('[server-content-processor] Error enhancing tables server-side:', error);
    console.log('[server-content-processor] Returning original HTML due to error');
    return html; // Return original HTML if processing fails
  }
}

// Pre-process content on the server
export function preprocessContent(htmlContent: string): ProcessedContent {
  const rewrittenContent = rewriteAssetUrls(htmlContent);
  const enhancedContent = enhanceTablesServer(rewrittenContent);
  return extractTablesServer(enhancedContent);
}