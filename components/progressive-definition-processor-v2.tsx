'use client';

import React, { useEffect, useRef } from 'react';

interface ProgressiveDefinitionProcessorProps {
  content: React.ReactNode;
}

export function ProgressiveDefinitionProcessorV2({ content }: ProgressiveDefinitionProcessorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobileRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check if mobile
    const checkMobile = () => {
      isMobileRef.current = window.innerWidth < 768 || 'ontouchstart' in window;
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const processDefinitionLinks = () => {
      const links = containerRef.current!.querySelectorAll('a.definition-link[data-definition-id]');
      
      links.forEach((link) => {
        const anchor = link as HTMLAnchorElement;
        
        // Skip if already enhanced
        if (anchor.getAttribute('data-enhanced') === 'true') return;
        
        const definitionId = anchor.getAttribute('data-definition-id');
        
        if (definitionId) {
          // Add enhanced styles
          anchor.classList.add(
            'text-[var(--color-fd-primary)]',
            'underline',
            'decoration-dotted',
            'underline-offset-2',
            'hover:text-[var(--color-fd-primary)]',
            'hover:decoration-solid',
            'transition-all',
            'cursor-help'
          );
          
          // Mark as enhanced
          anchor.setAttribute('data-enhanced', 'true');
        }
      });
    };

    // Event delegation for handling all definition links
    const handleInteraction = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a.definition-link[data-definition-id]');
      
      if (!link) return;
      
      e.preventDefault();
      const definitionId = link.getAttribute('data-definition-id');
      
      if (definitionId) {
        if (e.type === 'click' && isMobileRef.current) {
          // Mobile: toggle on click
          document.dispatchEvent(new CustomEvent('toggle-definition-tooltip', {
            detail: { definitionId, element: link }
          }));
        }
      }
    };

    const handleMouseEnter = (e: MouseEvent) => {
      if (isMobileRef.current) return;
      
      const target = e.target as HTMLElement;
      const link = target.closest('a.definition-link[data-definition-id]');
      
      if (!link) return;
      
      const definitionId = link.getAttribute('data-definition-id');
      if (definitionId) {
        document.dispatchEvent(new CustomEvent('show-definition-tooltip', {
          detail: { definitionId, element: link }
        }));
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (isMobileRef.current) return;
      
      const target = e.target as HTMLElement;
      const link = target.closest('a.definition-link[data-definition-id]');
      
      if (!link) return;
      
      document.dispatchEvent(new CustomEvent('hide-definition-tooltip'));
    };

    // Process existing links
    processDefinitionLinks();

    // Add event listeners
    containerRef.current.addEventListener('click', handleInteraction);
    containerRef.current.addEventListener('touchstart', handleInteraction);
    containerRef.current.addEventListener('mouseenter', handleMouseEnter, true);
    containerRef.current.addEventListener('mouseleave', handleMouseLeave, true);

    // Use MutationObserver to handle dynamic content
    const observer = new MutationObserver(() => {
      processDefinitionLinks();
    });
    
    observer.observe(containerRef.current, {
      childList: true,
      subtree: true,
    });
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      if (containerRef.current) {
        containerRef.current.removeEventListener('click', handleInteraction);
        containerRef.current.removeEventListener('touchstart', handleInteraction);
        containerRef.current.removeEventListener('mouseenter', handleMouseEnter, true);
        containerRef.current.removeEventListener('mouseleave', handleMouseLeave, true);
      }
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef}>
      {content}
    </div>
  );
}