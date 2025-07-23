'use client';

import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { DefinitionLink } from './definition-link';
import { TooltipProvider } from './definition-tooltip-context';
import { GlobalDefinitionTooltip } from './global-definition-tooltip';
import { DefinitionErrorBoundary } from './definition-error-boundary';

interface EnhancedDefinitionProcessorProps {
  children: React.ReactNode;
}

export function EnhancedDefinitionProcessor({ children }: EnhancedDefinitionProcessorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const processedLinksRef = useRef<Set<HTMLElement>>(new Set());
  const reactRootsRef = useRef<Map<HTMLElement, ReturnType<typeof createRoot>>>(new Map());

  useEffect(() => {
    const processDefinitionLinks = () => {
      if (!containerRef.current) return;

      // Find all definition links that haven't been processed yet
      const links = containerRef.current.querySelectorAll('a.definition-link[data-definition-id]');
      
      links.forEach((link) => {
        const linkElement = link as HTMLAnchorElement;
        
        // Skip if already processed
        if (processedLinksRef.current.has(linkElement)) return;
        
        const definitionId = linkElement.getAttribute('data-definition-id');
        const linkText = linkElement.textContent || '';
        
        if (definitionId && linkText) {
          // Enhance the original link instead of replacing it
          linkElement.style.cursor = 'help';
          linkElement.style.textDecoration = 'underline';
          linkElement.style.textDecorationStyle = 'dotted';
          linkElement.style.color = 'var(--color-fd-primary)';
          linkElement.style.transition = 'all 0.2s ease';
          
          // Add hover and click handlers directly to the original link
          const handleMouseEnter = () => {
            const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;
            if (!isMobile) {
              // Show tooltip on hover for desktop
              const event = new CustomEvent('show-definition-tooltip', {
                detail: { definitionId, element: linkElement }
              });
              document.dispatchEvent(event);
            }
          };
          
          const handleMouseLeave = () => {
            const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;
            if (!isMobile) {
              // Hide tooltip on mouse leave for desktop
              const event = new CustomEvent('hide-definition-tooltip');
              document.dispatchEvent(event);
            }
          };
          
          const handleClick = (e: Event) => {
            e.preventDefault();
            const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;
            if (isMobile) {
              // Toggle tooltip on click for mobile
              const event = new CustomEvent('toggle-definition-tooltip', {
                detail: { definitionId, element: linkElement }
              });
              document.dispatchEvent(event);
            }
          };
          
          // Add event listeners to the original link
          linkElement.addEventListener('mouseenter', handleMouseEnter);
          linkElement.addEventListener('mouseleave', handleMouseLeave);
          linkElement.addEventListener('click', handleClick);
          
          // Store cleanup function
          const cleanup = () => {
            linkElement.removeEventListener('mouseenter', handleMouseEnter);
            linkElement.removeEventListener('mouseleave', handleMouseLeave);
            linkElement.removeEventListener('click', handleClick);
          };
          
          // Track the processed link and its cleanup
          processedLinksRef.current.add(linkElement);
          reactRootsRef.current.set(linkElement, { unmount: cleanup } as any);
        }
      });
    };

    // Process links on mount and when content changes
    processDefinitionLinks();
    
    // Use MutationObserver to handle dynamic content
    const observer = new MutationObserver((mutations) => {
      // Check if any mutations added new definition links
      let shouldProcess = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              // Check if the added node contains definition links
              if (element.querySelector?.('a.definition-link[data-definition-id]') || 
                  element.matches?.('a.definition-link[data-definition-id]')) {
                shouldProcess = true;
              }
            }
          });
        }
      });
      
      if (shouldProcess) {
        // Small delay to ensure DOM is stable
        setTimeout(processDefinitionLinks, 10);
      }
    });
    
    if (containerRef.current) {
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
      });
    }
    
    return () => {
      observer.disconnect();
      
      // Clean up event listeners
      reactRootsRef.current.forEach((cleanup) => {
        try {
          if (cleanup && typeof cleanup.unmount === 'function') {
            cleanup.unmount();
          }
        } catch (error) {
          console.warn('Error cleaning up definition link:', error);
        }
      });
      reactRootsRef.current.clear();
      processedLinksRef.current.clear();
    };
  }, []);

  return (
    <TooltipProvider>
      <div ref={containerRef} className="definition-links-container">
        {children}
      </div>
      <GlobalDefinitionTooltip />
    </TooltipProvider>
  );
}