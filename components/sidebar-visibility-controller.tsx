'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';

interface SidebarVisibilityControllerProps {
  children: ReactNode;
  showSidebar: boolean;
  showSidebarIcon: boolean;
}

export function SidebarVisibilityController({ 
  children, 
  showSidebar, 
  showSidebarIcon 
}: SidebarVisibilityControllerProps) {
  useEffect(() => {
    // Wait for the DOM to be ready
    const timer = setTimeout(() => {
      // Add a class to the body to help with CSS targeting
      // Only add/remove if not already set by another component
      if (!showSidebar && !document.body.classList.contains('sidebar-hidden')) {
        document.body.classList.add('sidebar-hidden');
      } else if (showSidebar && document.body.classList.contains('sidebar-hidden')) {
        document.body.classList.remove('sidebar-hidden');
      }
      // Find the sidebar container - it's likely a parent of #nd-sidebar
      const sidebar = document.getElementById('nd-sidebar');
      const sidebarButton = document.querySelector('button[aria-label="Collapse Sidebar"]');
      
      // Also look for the aside element directly
      const asideElement = document.querySelector('aside');
      
      if (sidebar || asideElement) {
        // Find the actual sidebar container (parent elements)
        let sidebarContainer = asideElement || sidebar?.parentElement;
        
        // If we have the sidebar element, traverse up to find the container
        if (!asideElement && sidebar) {
          while (sidebarContainer && !sidebarContainer.classList.contains('fd-sidebar-container')) {
            // Look for the sidebar container by checking for specific classes or styles
            if (sidebarContainer.tagName === 'ASIDE' || 
                sidebarContainer.getAttribute('data-sidebar') || 
                sidebarContainer.classList.toString().includes('sidebar')) {
              break;
            }
            sidebarContainer = sidebarContainer.parentElement;
          }
        }
        
        if (sidebarContainer) {
          if (!showSidebar) {
            sidebarContainer.style.display = 'none';
            
            // Find and adjust the main content container
            // Look for the content wrapper that's a sibling of the sidebar
            const contentWrapper = sidebarContainer.nextElementSibling || 
                                 sidebarContainer.parentElement?.querySelector('[class*="content"]') ||
                                 document.querySelector('main')?.parentElement ||
                                 document.querySelector('[data-content]');
            
            if (contentWrapper) {
              (contentWrapper as HTMLElement).style.width = '100%';
              (contentWrapper as HTMLElement).style.maxWidth = '100%';
              (contentWrapper as HTMLElement).style.marginLeft = '0';
              (contentWrapper as HTMLElement).style.paddingLeft = '0';
            }
            
            // Also adjust the main element
            const mainContent = document.querySelector('main');
            if (mainContent) {
              mainContent.style.maxWidth = '100%';
              mainContent.style.width = '100%';
              mainContent.style.margin = '0 auto';
            }
            
            // Adjust the parent div with min-h-screen classes
            const parentDiv = document.querySelector('.min-h-screen.bg-background.text-foreground');
            if (parentDiv) {
              (parentDiv as HTMLElement).style.width = '100%';
              (parentDiv as HTMLElement).style.maxWidth = '100%';
            }
            
            // No need to adjust flex containers - let them use their default alignment
          } else {
            sidebarContainer.style.display = '';
            
            // Reset styles
            const contentWrapper = sidebarContainer.nextElementSibling || 
                                 sidebarContainer.parentElement?.querySelector('[class*="content"]') ||
                                 document.querySelector('main')?.parentElement ||
                                 document.querySelector('[data-content]');
            
            if (contentWrapper) {
              (contentWrapper as HTMLElement).style.width = '';
              (contentWrapper as HTMLElement).style.maxWidth = '';
              (contentWrapper as HTMLElement).style.marginLeft = '';
              (contentWrapper as HTMLElement).style.paddingLeft = '';
            }
            
            const mainContent = document.querySelector('main');
            if (mainContent) {
              mainContent.style.maxWidth = '';
              mainContent.style.width = '';
              mainContent.style.margin = '';
            }
            
            // Reset the parent div styles
            const parentDiv = document.querySelector('.min-h-screen.bg-background.text-foreground');
            if (parentDiv) {
              (parentDiv as HTMLElement).style.width = '';
              (parentDiv as HTMLElement).style.maxWidth = '';
            }
            
            // No need to reset flex containers
          }
        }
      }
      
      if (sidebarButton) {
        if (!showSidebarIcon) {
          (sidebarButton as HTMLElement).style.display = 'none';
        } else {
          (sidebarButton as HTMLElement).style.display = '';
        }
      }
    }, 100); // Small delay to ensure DOM is ready
    
    return () => {
      clearTimeout(timer);
      // Cleanup: restore visibility on unmount
      document.body.classList.remove('sidebar-hidden');
      const sidebar = document.getElementById('nd-sidebar');
      const asideElement = document.querySelector('aside');
      let sidebarContainer: Element | null = null;
      
      if (sidebar || asideElement) {
        sidebarContainer = asideElement || sidebar?.parentElement || null;
        
        if (!asideElement && sidebar && sidebarContainer) {
          while (sidebarContainer && !sidebarContainer.classList.contains('fd-sidebar-container')) {
            if (sidebarContainer.tagName === 'ASIDE' || 
                sidebarContainer.getAttribute('data-sidebar') || 
                sidebarContainer.classList.toString().includes('sidebar')) {
              break;
            }
            sidebarContainer = sidebarContainer.parentElement;
          }
        }
        
        if (sidebarContainer) {
          (sidebarContainer as HTMLElement).style.display = '';
          
          // Reset content wrapper styles
          const contentWrapper = sidebarContainer.nextElementSibling || 
                               sidebarContainer.parentElement?.querySelector('[class*="content"]') ||
                               document.querySelector('main')?.parentElement ||
                               document.querySelector('[data-content]');
          
          if (contentWrapper) {
            (contentWrapper as HTMLElement).style.width = '';
            (contentWrapper as HTMLElement).style.maxWidth = '';
            (contentWrapper as HTMLElement).style.marginLeft = '';
            (contentWrapper as HTMLElement).style.paddingLeft = '';
          }
        }
      }
      
      const sidebarButton = document.querySelector('button[aria-label="Collapse Sidebar"]');
      if (sidebarButton) {
        (sidebarButton as HTMLElement).style.display = '';
      }
      
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.style.maxWidth = '';
        mainContent.style.width = '';
        mainContent.style.margin = '';
      }
      
      // Reset the parent div styles
      const parentDiv = document.querySelector('.min-h-screen.bg-background.text-foreground');
      if (parentDiv) {
        (parentDiv as HTMLElement).style.width = '';
        (parentDiv as HTMLElement).style.maxWidth = '';
      }
      
      // No need to reset flex containers
    };
  }, [showSidebar, showSidebarIcon]);
  
  return <>{children}</>;
}