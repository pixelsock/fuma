'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTooltip } from './definition-tooltip-context';

interface Definition {
  id: string;
  term: string;
  definition: string;
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
        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.charlotteudo.org';
        const response = await fetch(`${directusUrl}/items/definitions/${definitionId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'force-cache',
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

export function GlobalDefinitionTooltip() {
  const tooltipContext = useTooltip();
  const { currentTooltip, hideTooltip, showTooltip, cancelHide } = tooltipContext;
  const [finalPosition, setFinalPosition] = useState({ top: 0, left: 0 });
  const [isAbove, setIsAbove] = useState(true);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const { definition, loading, error } = useDefinition(currentTooltip?.definitionId || null);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen to custom events from enhanced links
  useEffect(() => {
    if (!mounted) return;

    const handleShowTooltip = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { definitionId, element } = customEvent.detail;
      showTooltip(definitionId, element);
    };

    const handleHideTooltip = () => {
      hideTooltip();
    };

    const handleToggleTooltip = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { definitionId, element } = customEvent.detail;
      if (currentTooltip?.definitionId === definitionId) {
        hideTooltip();
      } else {
        showTooltip(definitionId, element);
      }
    };

    document.addEventListener('show-definition-tooltip', handleShowTooltip);
    document.addEventListener('hide-definition-tooltip', handleHideTooltip);
    document.addEventListener('toggle-definition-tooltip', handleToggleTooltip);

    return () => {
      document.removeEventListener('show-definition-tooltip', handleShowTooltip);
      document.removeEventListener('hide-definition-tooltip', handleHideTooltip);
      document.removeEventListener('toggle-definition-tooltip', handleToggleTooltip);
    };
  }, [mounted, showTooltip, hideTooltip, currentTooltip?.definitionId]);

  const calculateFinalPosition = useCallback(() => {
    if (!currentTooltip || !tooltipRef.current) return;

    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const triggerRect = currentTooltip.triggerElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 0.5rem = 8px gap above the link
    const gap = 8;

    // Calculate center position based on trigger element
    // Using position: fixed, coordinates are relative to viewport
    let left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
    // Position tooltip directly above the link with gap
    let top = triggerRect.top - tooltipRect.height - gap;
    let showAbove = true;

    // Check horizontal bounds - keep tooltip within viewport
    if (left + tooltipRect.width > viewportWidth - 16) {
      left = viewportWidth - tooltipRect.width - 16;
    }
    if (left < 16) {
      left = 16;
    }

    // Check vertical bounds - flip to below if no room above
    if (top < 16) {
      // Show below if no room above
      top = triggerRect.bottom + gap;
      showAbove = false;
    }
    
    // Also check if tooltip goes below viewport when shown below
    if (!showAbove && top + tooltipRect.height > viewportHeight - 16) {
      // If it doesn't fit below either, show above anyway but constrained
      top = Math.max(16, triggerRect.top - tooltipRect.height - gap);
      showAbove = true;
    }

    setFinalPosition({ top, left });
    setIsAbove(showAbove);
  }, [currentTooltip]);

  useEffect(() => {
    if (currentTooltip && mounted) {
      // Small delay to ensure tooltip is rendered
      const timer = setTimeout(calculateFinalPosition, 10);
      return () => clearTimeout(timer);
    }
  }, [currentTooltip, mounted, calculateFinalPosition]);

  // Recalculate position when definition content loads
  useEffect(() => {
    if (definition && currentTooltip && mounted) {
      // Recalculate position after content loads
      calculateFinalPosition();
    }
  }, [definition, currentTooltip, mounted, calculateFinalPosition]);

  // Handle scroll and resize
  useEffect(() => {
    if (currentTooltip && mounted) {
      const handleScroll = () => calculateFinalPosition();
      const handleResize = () => calculateFinalPosition();

      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [currentTooltip, mounted, calculateFinalPosition]);

  // Handle click outside to close
  useEffect(() => {
    if (currentTooltip && mounted) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          tooltipRef.current &&
          currentTooltip.triggerElement &&
          !tooltipRef.current.contains(event.target as Node) &&
          !currentTooltip.triggerElement.contains(event.target as Node)
        ) {
          hideTooltip();
        }
      };

      // Add event listeners
      document.addEventListener('click', handleClickOutside);
      // Removed scroll listener - position update is handled in the previous useEffect

      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [currentTooltip, mounted, hideTooltip]);

  if (!mounted || !currentTooltip) return null;

  const tooltipContent = (
    <div
      ref={tooltipRef}
      className="definition-tooltip fixed z-[9999] max-w-sm animate-in fade-in-0 zoom-in-95"
      style={{
        top: `${finalPosition.top}px`,
        left: `${finalPosition.left}px`,
      }}
      onMouseEnter={() => {
        // Cancel hide timeout on hover
        cancelHide();
      }}
    >
      <div className="relative overflow-hidden rounded-lg border border-[var(--color-fd-border)] bg-[var(--color-fd-popover)] text-[var(--color-fd-popover-foreground)] shadow-lg">
        {/* Arrow */}
        <div
          className={`absolute left-1/2 h-0 w-0 -translate-x-1/2 border-x-8 border-x-transparent ${
            isAbove 
              ? '-bottom-2 border-t-8 border-t-[var(--color-fd-border)]' 
              : '-top-2 border-b-8 border-b-[var(--color-fd-border)]'
          }`}
          aria-hidden="true"
        />
        <div
          className={`absolute left-1/2 h-0 w-0 -translate-x-1/2 border-x-[7px] border-x-transparent ${
            isAbove 
              ? '-bottom-[7px] border-t-[7px] border-t-[var(--color-fd-popover)]' 
              : '-top-[7px] border-b-[7px] border-b-[var(--color-fd-popover)]'
          }`}
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
  );

  return createPortal(tooltipContent, document.body);
}