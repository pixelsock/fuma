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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { highlightedHtml, highlightCount } = useMemo(() => {
    // Only process on client after hydration
    if (!isClient || !html) {
      return { highlightedHtml: html, highlightCount: 0 };
    }

    if (!searchTerm || !searchTerm.trim()) {
      return { highlightedHtml: html, highlightCount: 0 };
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const escapedTerm = escapeRegExp(searchTerm.trim());
    const highlightRegex = new RegExp(`(${escapedTerm})`, 'gi');
    let highlightCount = 0;

    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        if (!text) return;
        highlightRegex.lastIndex = 0;
        if (!highlightRegex.test(text)) return;

        highlightRegex.lastIndex = 0;
        const highlighted = text.replace(
          highlightRegex,
          '<mark class="bg-yellow-200 text-yellow-900 px-1 rounded search-highlight">$1</mark>',
        );

        const span = document.createElement('span');
        span.innerHTML = highlighted;
        highlightCount += (highlighted.match(/<mark/g) || []).length;
        node.parentNode?.replaceChild(span, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        if (['SCRIPT', 'STYLE', 'MARK'].includes(element.tagName)) {
          return;
        }
        Array.from(node.childNodes).forEach(processNode);
      }
    };

    Array.from(tempDiv.childNodes).forEach(processNode);

    return { highlightedHtml: tempDiv.innerHTML, highlightCount };
  }, [html, searchTerm, isClient]);

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
