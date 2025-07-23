'use client';

import React, { useEffect, useRef } from 'react';
import { TooltipProvider } from './definition-tooltip-context';
import { GlobalDefinitionTooltip } from './global-definition-tooltip';

interface ProgressiveDefinitionProcessorProps {
  children: React.ReactNode;
}

export function ProgressiveDefinitionProcessor({ children }: ProgressiveDefinitionProcessorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const processedLinksRef = useRef<Set<HTMLElement>>(new Set());
  const cleanupFunctionsRef = useRef<Map<HTMLElement, () => void>>(new Map());

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
        
        if (definitionId) {
          // Enhance the original link with tooltip functionality
          enhanceDefinitionLink(linkElement, definitionId);
          
          // Track the processed link
          processedLinksRef.current.add(linkElement);
        }
      });
    };

    const enhanceDefinitionLink = (linkElement: HTMLAnchorElement, definitionId: string) => {
      // Add visual styling to indicate it's a definition link
      linkElement.style.color = 'var(--color-fd-primary)';
      linkElement.style.textDecoration = 'underline';
      linkElement.style.textDecorationStyle = 'dotted';
      linkElement.style.textUnderlineOffset = '2px';
      linkElement.style.cursor = 'help';
      linkElement.style.transition = 'all 0.2s ease';
      
      // Consolidated event handlers to prevent conflicts
      const handleMouseEnter = () => {
        // Visual feedback
        linkElement.style.textDecorationStyle = 'solid';
        
        // Show tooltip
        const event = new CustomEvent('show-definition-tooltip', {
          detail: { definitionId, element: linkElement }
        });
        document.dispatchEvent(event);
      };
      
      const handleMouseLeave = () => {
        // Visual feedback
        linkElement.style.textDecorationStyle = 'dotted';
        
        // Hide tooltip
        const event = new CustomEvent('hide-definition-tooltip');
        document.dispatchEvent(event);
      };
      
      const handleClick = (e: Event) => {
        // Prevent default link behavior for definition links
        e.preventDefault();
      };
      
      // Add event listeners (consolidated)
      linkElement.addEventListener('mouseenter', handleMouseEnter);
      linkElement.addEventListener('mouseleave', handleMouseLeave);
      linkElement.addEventListener('click', handleClick);
      
      // Store cleanup function
      const cleanup = () => {
        linkElement.removeEventListener('mouseenter', handleMouseEnter);
        linkElement.removeEventListener('mouseleave', handleMouseLeave);
        linkElement.removeEventListener('click', handleClick);
      };
      
      cleanupFunctionsRef.current.set(linkElement, cleanup);
    };

    // Process links on mount and when content changes
    processDefinitionLinks();
    
    // Use MutationObserver to handle dynamic content
    const observer = new MutationObserver((mutations) => {
      let shouldProcess = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.querySelector?.('a.definition-link[data-definition-id]') || 
                  element.matches?.('a.definition-link[data-definition-id]')) {
                shouldProcess = true;
              }
            }
          });
        }
      });
      
      if (shouldProcess) {
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
      
      // Clean up all event listeners
      cleanupFunctionsRef.current.forEach((cleanup) => {
        try {
          cleanup();
        } catch (error) {
          console.warn('Error cleaning up definition link:', error);
        }
      });
      cleanupFunctionsRef.current.clear();
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