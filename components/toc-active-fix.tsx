'use client';

import { useEffect } from 'react';

export function TOCActiveFix() {
  useEffect(() => {
    // Function to update TOC active states based on scroll position
    const updateActiveTOC = () => {
      const headings = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
      const tocLinks = document.querySelectorAll('nav a[href^="#"], [data-toc-container] a[href^="#"]');
      
      if (!headings.length || !tocLinks.length) return;
      
      // Get current scroll position with offset for fixed header
      const scrollPosition = window.scrollY + 150; // Adjust based on your header height
      
      let currentHeading = null;
      
      // Find the current heading based on scroll position
      for (let i = headings.length - 1; i >= 0; i--) {
        const heading = headings[i] as HTMLElement;
        if (heading.offsetTop <= scrollPosition) {
          currentHeading = heading;
          break;
        }
      }
      
      // Update TOC links
      tocLinks.forEach(link => {
        const linkElement = link as HTMLAnchorElement;
        const href = linkElement.getAttribute('href');
        
        if (href && currentHeading) {
          const isActive = href === `#${currentHeading.id}`;
          linkElement.setAttribute('data-active', isActive ? 'true' : 'false');
          
          // Also update parent containers if needed
          const parentLi = linkElement.closest('li');
          if (parentLi) {
            parentLi.setAttribute('data-active', isActive ? 'true' : 'false');
          }
        }
      });
    };
    
    // Initial update
    updateActiveTOC();
    
    // Update on scroll with debounce
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updateActiveTOC, 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Also update on hash change
    window.addEventListener('hashchange', updateActiveTOC);
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('hashchange', updateActiveTOC);
      clearTimeout(scrollTimeout);
    };
  }, []);
  
  return null;
}