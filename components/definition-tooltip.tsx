'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface Definition {
  id: string;
  term: string;
  definition: string;
}

interface DefinitionTooltipProps {
  definitionId: string;
  children: React.ReactNode;
  className?: string;
}

// Custom hook to fetch definition data
function useDefinition(definitionId: string | null) {
  const [definition, setDefinition] = useState<Definition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!definitionId) {
      setDefinition(null);
      return;
    }

    const fetchDefinition = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8056';
        const response = await fetch(`${directusUrl}/items/definitions/${definitionId}`, {
          headers: {
            'Content-Type': 'application/json',
            // No authentication needed for public read access to definitions
          },
          cache: 'force-cache', // Cache definitions since they don't change often
        });

        if (!response.ok) {
          throw new Error('Failed to fetch definition');
        }

        const data = await response.json();
        setDefinition(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load definition');
        console.error('Error fetching definition:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDefinition();
  }, [definitionId]);

  return { definition, loading, error };
}

export function DefinitionTooltip({ definitionId, children, className }: DefinitionTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { definition, loading, error } = useDefinition(isVisible ? definitionId : null);

  // Detect mobile/tablet devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    // Position directly above the trigger with precise alignment
    let top = triggerRect.top + scrollY - tooltipRect.height - 12; // 12px gap above for arrow
    let left = triggerRect.left + scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2);

    // Check if tooltip goes off right edge
    if (left + tooltipRect.width > viewportWidth + scrollX - 16) {
      left = viewportWidth + scrollX - tooltipRect.width - 16;
    }

    // Check if tooltip goes off left edge
    if (left < scrollX + 16) {
      left = scrollX + 16;
    }

    // Check if tooltip goes off top edge - if so, show below
    if (top < scrollY + 16) {
      top = triggerRect.bottom + scrollY + 12; // Show below with arrow space
    }

    setPosition({ top, left });
  }, []);

  const toggleTooltip = useCallback(() => {
    setIsVisible(!isVisible);
  }, [isVisible]);

  // Desktop hover handlers
  const showTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(true);
  }, []);

  const hideTooltip = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 200); // Small delay to allow moving to tooltip
  }, []);

  const cancelHide = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      // Small delay to ensure tooltip DOM is fully rendered
      const positionTimeout = setTimeout(() => {
        calculatePosition();
      }, 10);
      
      const handleScroll = () => calculatePosition();
      const handleResize = () => calculatePosition();
      const handleClickOutside = (event: MouseEvent) => {
        // Only handle click outside for mobile
        if (isMobile && 
          triggerRef.current &&
          tooltipRef.current &&
          !triggerRef.current.contains(event.target as Node) &&
          !tooltipRef.current.contains(event.target as Node)
        ) {
          setIsVisible(false);
        }
      };
      
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      
      if (isMobile) {
        document.addEventListener('click', handleClickOutside);
      }
      
      return () => {
        clearTimeout(positionTimeout);
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
        if (isMobile) {
          document.removeEventListener('click', handleClickOutside);
        }
      };
    }
  }, [isVisible, calculatePosition, isMobile]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);


  return (
    <>
      <span
        ref={triggerRef}
        onClick={(e) => {
          e.preventDefault();
          if (isMobile) {
            toggleTooltip();
          }
        }}
        onMouseEnter={!isMobile ? showTooltip : undefined}
        onMouseLeave={!isMobile ? hideTooltip : undefined}
        className={cn(
          "definition-tooltip-trigger text-[var(--color-fd-primary)] underline decoration-dotted underline-offset-2 hover:text-[var(--color-fd-primary)] hover:decoration-solid transition-all",
          isMobile ? "cursor-pointer" : "cursor-help",
          className
        )}
      >
        {children}
      </span>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          onMouseEnter={!isMobile ? cancelHide : undefined}
          onMouseLeave={!isMobile ? hideTooltip : undefined}
          className="definition-tooltip fixed z-[100] max-w-sm animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          <div className="relative overflow-hidden rounded-lg border border-[var(--color-fd-border)] bg-[var(--color-fd-popover)] text-[var(--color-fd-popover-foreground)] shadow-lg">
            {/* Arrow pointing down */}
            <div
              className="absolute -bottom-2 left-1/2 h-0 w-0 -translate-x-1/2 border-x-8 border-t-8 border-x-transparent border-t-[var(--color-fd-border)]"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-[7px] left-1/2 h-0 w-0 -translate-x-1/2 border-x-[7px] border-t-[7px] border-x-transparent border-t-[var(--color-fd-popover)]"
              aria-hidden="true"
            />
            
            <div className="p-4">
              {loading && (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-fd-primary)] border-t-transparent" />
                  <span className="text-sm text-[var(--color-fd-muted-foreground)]">Loading...</span>
                </div>
              )}
              
              {error && (
                <div className="text-sm text-red-500">
                  Error: {error}
                </div>
              )}
              
              {definition && (
                <>
                  <div className="mb-2 font-semibold text-[var(--color-fd-foreground)]">
                    {definition.term}
                  </div>
                  <div className="text-sm text-[var(--color-fd-muted-foreground)]">
                    {definition.definition}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Component to process and render content with definition tooltips
export function DefinitionLinkWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Find all definition links and wrap them with tooltips
    const processDefinitionLinks = () => {
      const links = document.querySelectorAll('a.definition-link[data-definition-id]');
      
      links.forEach((link) => {
        // Skip if already processed
        if (link.getAttribute('data-processed') === 'true') return;
        
        const definitionId = link.getAttribute('data-definition-id');
        const linkText = link.textContent;
        
        if (definitionId && linkText) {
          // Create a wrapper span
          const wrapper = document.createElement('span');
          wrapper.setAttribute('data-definition-wrapper', 'true');
          
          // Replace the link with our wrapper
          if (link.parentNode) {
            link.parentNode.insertBefore(wrapper, link);
            link.remove();
            
            // Mark as processed
            link.setAttribute('data-processed', 'true');
          }
        }
      });
    };

    // Process on mount and when content changes
    processDefinitionLinks();
    
    // Use MutationObserver to handle dynamic content
    const observer = new MutationObserver(() => {
      processDefinitionLinks();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
    
    return () => {
      observer.disconnect();
    };
  }, []);

  return <>{children}</>;
}