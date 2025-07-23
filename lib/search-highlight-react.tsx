'use client';

import React, { useEffect, useRef, useState } from 'react';

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
  const [highlightedHtml, setHighlightedHtml] = useState(html);

  useEffect(() => {
    console.log('HighlightedContent - searchTerm:', searchTerm);
    console.log('HighlightedContent - html length:', html?.length);
    
    if (!searchTerm || !html) {
      // Even without search term, ensure headings have IDs
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach(heading => {
        if (!heading.id && heading.textContent) {
          const id = heading.textContent
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 50); // Match the ID generation in directus-only-source.ts
          heading.id = id;
        }
      });
      
      setHighlightedHtml(tempDiv.innerHTML);
      onHighlightsChange?.(0);
      return;
    }

    // Create a temporary div to parse HTML safely
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // First, ensure all headings have IDs for TOC
    const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(heading => {
      if (!heading.id && heading.textContent) {
        // Generate ID from heading text
        const id = heading.textContent
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '')
          .substring(0, 50); // Match the ID generation in directus-only-source.ts
        heading.id = id;
      }
    });

    let highlightCount = 0;
    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');

    // Process text nodes recursively
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
    const newHtml = tempDiv.innerHTML;
    console.log('HighlightedContent - highlightCount:', highlightCount);
    console.log('HighlightedContent - sample of newHtml:', newHtml.substring(0, 200));
    setHighlightedHtml(newHtml);
    onHighlightsChange?.(highlightCount);

  }, [html, searchTerm, onHighlightsChange]);

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