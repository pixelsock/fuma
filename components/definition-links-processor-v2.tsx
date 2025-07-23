'use client';

import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { DefinitionLink } from './definition-link-v2';

interface DefinitionLinksProcessorProps {
  content: React.ReactNode;
}

export function DefinitionLinksProcessorV2({ content }: DefinitionLinksProcessorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rootsRef = useRef<Map<HTMLElement, ReturnType<typeof createRoot>>>(new Map());

  useEffect(() => {
    if (!containerRef.current) return;

    const processDefinitionLinks = () => {
      const links = containerRef.current!.querySelectorAll('a.definition-link[data-definition-id]');
      
      links.forEach((link) => {
        const anchor = link as HTMLAnchorElement;
        
        // Skip if already processed
        if (anchor.getAttribute('data-processed') === 'true') return;
        
        const definitionId = anchor.getAttribute('data-definition-id');
        const linkText = anchor.textContent;
        
        if (definitionId && linkText) {
          // Create a wrapper span
          const wrapper = document.createElement('span');
          wrapper.setAttribute('data-definition-wrapper', 'true');
          
          // Replace the link with our wrapper
          if (anchor.parentNode) {
            anchor.parentNode.insertBefore(wrapper, anchor);
            anchor.remove();
            
            // Create React root and render
            const root = createRoot(wrapper);
            rootsRef.current.set(wrapper, root);
            
            root.render(
              <DefinitionLink definitionId={definitionId}>
                {linkText}
              </DefinitionLink>
            );
            
            // Mark original link as processed
            anchor.setAttribute('data-processed', 'true');
          }
        }
      });
    };

    // Process on mount
    processDefinitionLinks();
    
    // Use MutationObserver to handle dynamic content
    const observer = new MutationObserver(() => {
      processDefinitionLinks();
    });
    
    observer.observe(containerRef.current, {
      childList: true,
      subtree: true,
    });
    
    return () => {
      observer.disconnect();
      // Clean up React roots
      rootsRef.current.forEach((root) => {
        root.unmount();
      });
      rootsRef.current.clear();
    };
  }, []);

  return (
    <div ref={containerRef}>
      {content}
    </div>
  );
}