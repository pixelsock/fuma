'use client';

import { useEffect } from 'react';

export function HideSidebar() {
  useEffect(() => {
    // Add the sidebar-hidden class
    document.body.classList.add('sidebar-hidden');
    
    // Also manually hide elements - be specific to only hide the sidebar aside
    const timer = setTimeout(() => {
      // Find the specific sidebar aside element
      const sidebarById = document.getElementById('nd-sidebar');
      const sidebarAside = sidebarById?.closest('aside') || document.querySelector('aside[data-sidebar]') || document.querySelector('aside.fd-sidebar');
      
      if (sidebarAside) {
        (sidebarAside as HTMLElement).style.display = 'none';
      }
      
      const button = document.querySelector('button[aria-label="Collapse Sidebar"]');
      if (button) {
        (button as HTMLElement).style.display = 'none';
      }
      
      // Ensure content takes full width
      const main = document.querySelector('main');
      if (main) {
        main.style.maxWidth = '100%';
        main.style.width = '100%';
      }
      
      // Find the content wrapper and adjust it
      const contentWrapper = main?.parentElement || document.querySelector('[class*="content"]:not(aside)');
      if (contentWrapper && contentWrapper.tagName !== 'ASIDE') {
        (contentWrapper as HTMLElement).style.width = '100%';
        (contentWrapper as HTMLElement).style.maxWidth = '100%';
      }
    }, 100);
    
    return () => {
      clearTimeout(timer);
      document.body.classList.remove('sidebar-hidden');
      
      // Reset styles - be specific about which aside
      const sidebarById = document.getElementById('nd-sidebar');
      const sidebarAside = sidebarById?.closest('aside') || document.querySelector('aside[data-sidebar]') || document.querySelector('aside.fd-sidebar');
      
      if (sidebarAside) {
        (sidebarAside as HTMLElement).style.display = '';
      }
      
      const button = document.querySelector('button[aria-label="Collapse Sidebar"]');
      if (button) {
        (button as HTMLElement).style.display = '';
      }
      
      const main = document.querySelector('main');
      if (main) {
        main.style.maxWidth = '';
        main.style.width = '';
      }
      
      const contentWrapper = main?.parentElement || document.querySelector('[class*="content"]:not(aside)');
      if (contentWrapper && contentWrapper.tagName !== 'ASIDE') {
        (contentWrapper as HTMLElement).style.width = '';
        (contentWrapper as HTMLElement).style.maxWidth = '';
      }
    };
  }, []);
  
  return null;
}