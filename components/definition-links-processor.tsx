'use client';

import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { DefinitionTooltip } from './definition-tooltip';

interface DefinitionLinksProcessorProps {
  children: React.ReactNode;
}

export function DefinitionLinksProcessor({ children }: DefinitionLinksProcessorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const processedLinksRef = useRef<Set<HTMLElement>>(new Set());
  const rootsRef = useRef<Map<HTMLElement, ReturnType<typeof createRoot>>>(new Map());

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
          // Create a container for the React component
          const container = document.createElement('span');
          container.style.display = 'inline';
          
          // Replace the link with our container
          if (linkElement.parentNode) {
            linkElement.parentNode.insertBefore(container, linkElement);
            linkElement.style.display = 'none'; // Hide original link instead of removing
            
            // Create React root and render the tooltip component
            const root = createRoot(container);
            root.render(
              <DefinitionTooltip definitionId={definitionId}>
                {linkText}
              </DefinitionTooltip>
            );
            
            // Track the processed link and its root
            processedLinksRef.current.add(linkElement);
            rootsRef.current.set(linkElement, root);
          }
        }
      });
    };

    // Process links on mount and when content changes
    processDefinitionLinks();
    
    // Use MutationObserver to handle dynamic content
    const observer = new MutationObserver(() => {
      processDefinitionLinks();
    });
    
    if (containerRef.current) {
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
      });
    }
    
    return () => {
      observer.disconnect();
      
      // Clean up React roots
      rootsRef.current.forEach((root) => {
        root.unmount();
      });
      rootsRef.current.clear();
      processedLinksRef.current.clear();
    };
  }, []);

  return (
    <div ref={containerRef} className="definition-links-container">
      {children}
    </div>
  );
}