'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';

/**
 * React-safe text highlighter component
 */
export function HighlightedContent({ 
  html, 
  searchTerm,
  onHighlightsChange
}: { 
  html: string; 
  searchTerm: string;
  onHighlightsChange?: (count: number) => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Use useMemo to process HTML consistently on server and client
  const { highlightedHtml, highlightCount } = useMemo(() => {
    // On server side, just return the original HTML without processing
    if (typeof document === 'undefined') {
      return { highlightedHtml: html, highlightCount: 0 };
    }
    
    console.log('🔍 HighlightedContent - searchTerm:', searchTerm);
    console.log('🔍 HighlightedContent - html length:', html?.length);
    console.log('🔍 HighlightedContent - html sample:', html?.substring(0, 200));
    
    if (!html) {
      console.log('🔍 No HTML content, returning early');
      return { highlightedHtml: html, highlightCount: 0 };
    }

    // Create a temporary div to parse HTML safely (client-side only)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Skip heading processing during useMemo to avoid hydration mismatch
    // Headings are already processed by the server and HeadingLinkHandler will handle client-side enhancement

    // Enhance tables: extract first row as title and create toolbars
    const enhanceTables = () => {
      const tables = tempDiv.querySelectorAll('table');
      console.log(`🔍 ENHANCE TABLES: Found ${tables.length} tables to enhance`);
      
      tables.forEach((table, index) => {
        const el = table as HTMLElement;
        console.log(`Processing table ${index + 1}`);
        
        // Skip if already enhanced
        if (el.closest('.enhanced-table-container')) {
          console.log('Already enhanced, skipping');
          return;
        }

        // Extract title from the first row
        let extractedTitle = '';
        let titleRowElement: HTMLElement | null = null;

        const firstRow = el.querySelector('tr');
        if (firstRow) {
          const cells = firstRow.querySelectorAll('td, th');
          console.log(`First row has ${cells.length} cells`);
          
          if (cells.length > 0) {
            // Get text from first cell or combined text if multiple cells
            if (cells.length === 1) {
              // Single cell - use its content as title
              extractedTitle = cells[0].textContent?.trim() || '';
              console.log(`Single cell title: "${extractedTitle}"`);
            } else {
              // Multiple cells - check if first cell spans the table or contains title pattern
              const firstCell = cells[0];
              const cellText = firstCell.textContent?.trim() || '';
              
              if (firstCell.hasAttribute('colspan')) {
                // Cell spans multiple columns, likely a title
                extractedTitle = cellText;
                console.log(`Colspan title: "${extractedTitle}"`);
              } else if (cellText.toLowerCase().includes('table') && cellText.includes(':')) {
                // Text pattern matches table title format
                extractedTitle = cellText;
                console.log(`Pattern match title: "${extractedTitle}"`);
              } else {
                // Combine all cells in first row as title
                extractedTitle = Array.from(cells)
                  .map(cell => cell.textContent?.trim())
                  .filter(text => text)
                  .join(' - ');
                console.log(`Combined cells title: "${extractedTitle}"`);
              }
            }
            
            // If we have a title, mark the row for removal
            if (extractedTitle) {
              titleRowElement = firstRow as HTMLElement;
              console.log(`✅ Will use first row as title: "${extractedTitle}"`);
            }
          }
        }
        
        console.log(`Final result for table ${index + 1}: title="${extractedTitle}", found=${!!titleRowElement}`);

        // Ensure base class for cell borders/layout
        el.classList.add('enhanced-table');
        if (!el.style.width) el.style.width = '100%';
        if (!el.style.minWidth) el.style.minWidth = '100%';

        // Build wrappers
        const containerDiv = document.createElement('div');
        containerDiv.className = 'enhanced-table-container';

        // Create toolbar if we have a title
        if (extractedTitle) {
          const toolbarDiv = document.createElement('div');
          toolbarDiv.className = 'flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700';
          
          const titleSection = document.createElement('div');
          titleSection.className = 'flex items-center space-x-3';
          
          const titleHeader = document.createElement('h3');
          titleHeader.className = 'text-lg font-semibold text-gray-900 dark:text-white';
          titleHeader.textContent = extractedTitle;
          
          titleSection.appendChild(titleHeader);
          toolbarDiv.appendChild(titleSection);
          
          // Add empty controls section for consistency
          const controlsSection = document.createElement('div');
          controlsSection.className = 'flex items-center space-x-2';
          toolbarDiv.appendChild(controlsSection);
          
          containerDiv.appendChild(toolbarDiv);

          // Remove the title row from the table since we extracted it
          if (titleRowElement) {
            titleRowElement.remove();
            console.log(`✅ Removed title row from table`);
          }

        }

        const wrapperDiv = document.createElement('div');
        wrapperDiv.className = 'table-wrapper overflow-auto';

        // Insert wrapper before table and move table inside
        const parent = el.parentElement as HTMLElement;
        if (parent) {
          parent.insertBefore(containerDiv, el);
          containerDiv.appendChild(wrapperDiv);
          wrapperDiv.appendChild(el);
        }
      });
    };

    // Only apply search highlighting if there's a search term
    let highlightCount = 0;
    if (searchTerm && searchTerm.trim()) {
      console.log('🔍 APPLYING SEARCH HIGHLIGHTING for term:', searchTerm);
      const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');

      // Process text nodes recursively for search highlighting
      const processNode = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent || '';
          // Create a new regex for each test since .test() advances the lastIndex
          const testRegex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
          if (testRegex.test(text)) {
            const matches = text.match(testRegex);
            highlightCount += matches?.length || 0;
            
            const highlighted = text.replace(
              testRegex, 
              '<mark class="bg-yellow-200 text-yellow-900 px-1 rounded search-highlight" data-highlight-index="$1">$1</mark>'
            );
            
            const span = document.createElement('span');
            span.innerHTML = highlighted;
            node.parentNode?.replaceChild(span, node);
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          // Skip script, style, and already highlighted elements
          if (!['SCRIPT', 'STYLE', 'MARK'].includes(element.tagName)) {
            Array.from(node.childNodes).forEach(processNode);
          }
        }
      };

      Array.from(tempDiv.childNodes).forEach(processNode);
    } else {
      console.log('🔍 NO SEARCH TERM - skipping highlighting');
    }
    const newHtml = tempDiv.innerHTML;
    console.log('HighlightedContent - highlightCount:', highlightCount);
    console.log('HighlightedContent - sample of newHtml:', newHtml.substring(0, 200));
    
    return { highlightedHtml: newHtml, highlightCount };
  }, [html, searchTerm]);

  // Call the callback when highlight count changes
  useEffect(() => {
    onHighlightsChange?.(highlightCount);
  }, [highlightCount, onHighlightsChange]);

  return (
    <div 
      ref={contentRef}
      className="prose prose-lg max-w-none"
      dangerouslySetInnerHTML={{ __html: highlightedHtml }}
    />
  );
}

/**
 * Escapes special regex characters in search term
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Hook to manage highlight navigation
 */
export function useHighlightNavigation() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalHighlights, setTotalHighlights] = useState(0);

  const scrollToHighlight = (index: number) => {
    const highlights = document.querySelectorAll('.search-highlight');
    if (highlights[index]) {
      highlights[index].scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      
      // Update styling
      highlights.forEach((h, i) => {
        h.classList.toggle('ring-2', i === index);
        h.classList.toggle('ring-blue-500', i === index);
      });
    }
  };

  const goToNext = () => {
    if (totalHighlights === 0) return;
    const newIndex = currentIndex === totalHighlights - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    scrollToHighlight(newIndex);
  };

  const goToPrevious = () => {
    if (totalHighlights === 0) return;
    const newIndex = currentIndex === 0 ? totalHighlights - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    scrollToHighlight(newIndex);
  };

  useEffect(() => {
    // Count highlights after render
    const timer = setTimeout(() => {
      const highlights = document.querySelectorAll('.search-highlight');
      setTotalHighlights(highlights.length);
      if (highlights.length > 0) {
        scrollToHighlight(0);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return {
    currentIndex,
    totalHighlights,
    setTotalHighlights,
    goToNext,
    goToPrevious,
    scrollToHighlight
  };
}