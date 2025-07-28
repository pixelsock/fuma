'use client';

import React, { useEffect, useRef } from 'react';
import { LinkIcon } from 'lucide-react';

interface ContentWithHeadingLinksProps {
  children: React.ReactNode;
}

export function ContentWithHeadingLinks({ children }: ContentWithHeadingLinksProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    // Find all h2 elements
    const headings = contentRef.current.querySelectorAll('h2[id]');
    
    headings.forEach((heading) => {
      const h2 = heading as HTMLHeadingElement;
      
      // Skip if already has a copy button
      if (h2.querySelector('.heading-copy-button')) return;
      
      // Create wrapper for button and tooltip
      const wrapper = document.createElement('span');
      wrapper.className = 'relative inline-block ml-2';
      
      // Create the copy button
      const button = document.createElement('button');
      button.className = 'heading-copy-button inline-flex items-center justify-center p-1 rounded-md transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none';
      button.setAttribute('aria-label', 'Copy link to section');
      
      // Create the link icon
      const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500 dark:text-gray-400"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`;
      button.innerHTML = iconSvg;
      
      // Create tooltip with theme orange color
      const tooltip = document.createElement('span');
      tooltip.className = 'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white rounded-md opacity-0 pointer-events-none transition-opacity duration-200 whitespace-nowrap shadow-lg z-50';
      tooltip.style.backgroundColor = 'var(--sandy-brown)';
      tooltip.style.zIndex = '9999';
      tooltip.innerHTML = `
        Copy to clipboard
        <span class="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
          <svg class="w-2 h-1" viewBox="0 0 8 4" style="color: var(--sandy-brown);">
            <path fill="currentColor" d="M4 4L0 0h8L4 4z"/>
          </svg>
        </span>
      `;
      
      // Add click handler
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        const id = h2.getAttribute('id');
        if (!id) return;
        
        const url = `${window.location.origin}${window.location.pathname}#${id}`;
        
        try {
          await navigator.clipboard.writeText(url);
          
          // Show tooltip
          tooltip.classList.remove('opacity-0');
          tooltip.classList.add('opacity-100');
          
          // Hide tooltip after 2 seconds
          setTimeout(() => {
            tooltip.classList.remove('opacity-100');
            tooltip.classList.add('opacity-0');
          }, 2000);
        } catch (err) {
          console.error('Failed to copy URL:', err);
        }
      });
      
      // Assemble the elements
      wrapper.appendChild(button);
      wrapper.appendChild(tooltip);
      
      // Append the wrapper inline after the heading text
      h2.appendChild(wrapper);
    });
    
    // Cleanup function
    return () => {
      const wrappers = contentRef.current?.querySelectorAll('.heading-copy-button').forEach(button => {
        button.parentElement?.remove();
      });
    };
  }, [children]);

  return (
    <div ref={contentRef}>
      {children}
    </div>
  );
}