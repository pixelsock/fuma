'use client';

import React, { useEffect } from 'react';
// TOC functionality removed - not needed for static HTML

interface HtmlContentProps {
  html: string;
}

export function HtmlContent({ html }: HtmlContentProps) {
  // Extract headings for TOC
  useEffect(() => {
    // Parse the HTML to extract headings
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    // Create TOC entries from headings
    const tocEntries = Array.from(headings).map((heading) => {
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
    
    // Update the HTML in the document
    const container = document.querySelector('[data-html-content]');
    if (container) {
      container.innerHTML = doc.body.innerHTML;
    }
  }, [html]);

  return (
    <div 
      className="prose max-w-none"
      data-html-content
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}