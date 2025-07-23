'use client';

import { useEffect, useRef } from 'react';
import { useDefinitionData } from './definition-data-context-optimized';

export function DefinitionPrefetcherOptimized() {
  const { prefetchDefinitions } = useDefinitionData();
  const prefetchedRef = useRef<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Prefetch visible definitions immediately (no delay)
    const prefetchVisibleDefinitions = () => {
      const links = document.querySelectorAll('a.definition-link[data-definition-id]');
      const visibleIds: string[] = [];
      
      links.forEach(link => {
        const id = link.getAttribute('data-definition-id');
        if (id && !prefetchedRef.current.has(id)) {
          // Check if element is in viewport
          const rect = link.getBoundingClientRect();
          const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
          
          if (isVisible) {
            visibleIds.push(id);
            prefetchedRef.current.add(id);
          }
        }
      });
      
      if (visibleIds.length > 0) {
        prefetchDefinitions(visibleIds);
      }
    };

    // Prefetch immediately on mount
    prefetchVisibleDefinitions();

    // Setup intersection observer for lazy prefetching
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const idsToFetch: string[] = [];
        
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-definition-id');
            if (id && !prefetchedRef.current.has(id)) {
              idsToFetch.push(id);
              prefetchedRef.current.add(id);
            }
          }
        });
        
        if (idsToFetch.length > 0) {
          prefetchDefinitions(idsToFetch);
        }
      },
      {
        // Prefetch when element is within 200px of viewport
        rootMargin: '200px',
        threshold: 0
      }
    );

    // Observe all definition links
    const links = document.querySelectorAll('a.definition-link[data-definition-id]');
    links.forEach(link => {
      observerRef.current?.observe(link);
    });

    // Also prefetch on scroll (throttled)
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(prefetchVisibleDefinitions, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observerRef.current?.disconnect();
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [prefetchDefinitions]);

  return null;
}