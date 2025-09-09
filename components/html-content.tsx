'use client';

import React, { useMemo } from 'react';

interface HtmlContentProps {
  html: string;
}

export function HtmlContent({ html }: HtmlContentProps) {
  // Process HTML to extract headings and enhance tables
  const processedHtml = useMemo(() => {
    // Parse the HTML to extract headings
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    // Create TOC entries from headings
    Array.from(headings).map((heading) => {
      const id = heading.textContent?.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-') || '';
      
      // Add ID to heading for navigation
      heading.setAttribute('id', id);
      
      return {
        id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName[1])
      };
    });

    // First, let's see what .table-title-row elements exist in the document
    const allTitleRows = doc.querySelectorAll('.table-title-row');
    console.log(`Found ${allTitleRows.length} .table-title-row elements:`, Array.from(allTitleRows).map(el => el.textContent?.trim()));

    // Create a map of tables to their associated titles
    const tableToTitleMap = new Map<HTMLTableElement, HTMLElement>();
    
    // For each .table-title-row, find the nearest table that follows it
    allTitleRows.forEach(titleRow => {
      let nextSibling = titleRow.nextElementSibling;
      let searchCount = 0;
      while (nextSibling && searchCount < 10) {
        if (nextSibling.tagName === 'TABLE') {
          tableToTitleMap.set(nextSibling as HTMLTableElement, titleRow as HTMLElement);
          console.log(`Mapped title "${titleRow.textContent?.trim()}" to table`);
          break;
        }
        // Also check if there's a table inside this element
        const innerTable = nextSibling.querySelector('table');
        if (innerTable) {
          tableToTitleMap.set(innerTable as HTMLTableElement, titleRow as HTMLElement);
          console.log(`Mapped title "${titleRow.textContent?.trim()}" to inner table`);
          break;
        }
        nextSibling = nextSibling.nextElementSibling;
        searchCount++;
      }
    });

    // Enhance tables: wrap and apply standardized classes so global styles apply
    const tables = doc.querySelectorAll('table');
    console.log(`Found ${tables.length} tables to enhance`);
    tables.forEach((table, index) => {
      const el = table as HTMLElement;
      console.log(`\n--- Processing table ${index + 1} ---`);
      // Skip if already enhanced
      if (el.closest('.enhanced-table-container')) {
        console.log('Already enhanced, skipping');
        return;
      }

      // Extract title from table or preceding elements
      let extractedTitle = '';
      let titleElement: HTMLElement | null = null;

      // First check if this table has a mapped title
      const mappedTitle = tableToTitleMap.get(el as HTMLTableElement);
      if (mappedTitle) {
        extractedTitle = mappedTitle.textContent?.trim() || '';
        titleElement = mappedTitle;
        console.log(`✅ Using mapped title: "${extractedTitle}"`);
      } else {
        // Fallback: Look for table title elements with .table-title-row class in siblings
        let prevSibling = el.previousElementSibling;
        let searchCount = 0;
        console.log('No mapped title found, searching siblings...');
        while (prevSibling && searchCount < 5) { // Check up to 5 elements back
          const text = prevSibling.textContent?.trim() || '';
          const classes = (prevSibling as HTMLElement).className || '';
          console.log(`  Sibling ${searchCount}: "${text}" (tag: ${prevSibling.tagName}, classes: "${classes}")`);
          
          // Primary: Check if this element has the table-title-row class
          if ((prevSibling as HTMLElement).classList?.contains('table-title-row')) {
            console.log(`  ✅ Found .table-title-row: "${text}"`);
            extractedTitle = text;
            titleElement = prevSibling as HTMLElement;
            break;
          }
          // Fallback: Pattern matching for compatibility with other formats
          else if ((text.toLowerCase().includes('table') && text.includes(':')) || 
                   (text.match(/^Table\s+\d+/i)) ||
                   (text.match(/^Table\s+\w+-\d+/i))) {
            console.log(`  ✅ Found by pattern: "${text}"`);
            extractedTitle = text;
            titleElement = prevSibling as HTMLElement;
            break;
          }
          prevSibling = prevSibling.previousElementSibling;
          searchCount++;
        }
      }
      
      console.log(`Final result for table ${index + 1}: title="${extractedTitle}", found=${!!titleElement}`);

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
      el.classList.add('enhanced-table');
      if (!el.style.width) el.style.width = '100%';
      if (!el.style.minWidth) el.style.minWidth = '100%';

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
      const parent = el.parentElement as HTMLElement;
      if (parent) {
        parent.insertBefore(containerDiv, el);
        containerDiv.appendChild(wrapperDiv);
        wrapperDiv.appendChild(el);
      }
    });

    return doc.body.innerHTML;
  }, [html]);

  return (
    <div 
      className="prose max-w-none"
      data-html-content
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  );
}