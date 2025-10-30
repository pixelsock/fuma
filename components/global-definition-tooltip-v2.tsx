'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  TooltipProvider,
  TooltipContent,
} from '@/components/ui/tooltip';
import { useTooltip } from './definition-tooltip-context';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { useDefinitionData } from './definition-data-context';

export function GlobalDefinitionTooltipV2() {
  const tooltipContext = useTooltip();
  const { currentTooltip, hideTooltip, showTooltip, cancelHide } = tooltipContext;
  const [mounted, setMounted] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);

  const { definitions, loading, errors, fetchDefinition } = useDefinitionData();
  const definitionId = currentTooltip?.definitionId;
  const definition = definitionId ? definitions[definitionId] : null;
  const isLoading = definitionId ? loading[definitionId] : false;
  const error = definitionId ? errors[definitionId] : null;

  useEffect(() => {
    if (definitionId && !definition && !isLoading && !error) {
      fetchDefinition(definitionId);
    }
  }, [definitionId, definition, isLoading, error, fetchDefinition]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const handleShowTooltip = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { definitionId, element } = customEvent.detail;
      // Cancel any pending hide when showing tooltip
      cancelHide();
      showTooltip(definitionId, element);
    };

    const handleHideTooltip = () => {
      hideTooltip();
    };

    const handleCancelHide = () => {
      cancelHide();
    };

    const handleToggleTooltip = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { definitionId, element } = customEvent.detail;
      if (currentTooltip?.definitionId === definitionId) {
        hideTooltip();
      } else {
        cancelHide();
        showTooltip(definitionId, element);
      }
    };

    document.addEventListener('show-definition-tooltip', handleShowTooltip);
    document.addEventListener('hide-definition-tooltip', handleHideTooltip);
    document.addEventListener('cancel-hide-definition-tooltip', handleCancelHide);
    document.addEventListener('toggle-definition-tooltip', handleToggleTooltip);

    return () => {
      document.removeEventListener('show-definition-tooltip', handleShowTooltip);
      document.removeEventListener('hide-definition-tooltip', handleHideTooltip);
      document.removeEventListener('cancel-hide-definition-tooltip', handleCancelHide);
      document.removeEventListener('toggle-definition-tooltip', handleToggleTooltip);
    };
  }, [mounted, showTooltip, hideTooltip, cancelHide, currentTooltip?.definitionId]);

  const updateAnchorPosition = useCallback(() => {
    if (currentTooltip && anchorRef.current) {
      const rect = currentTooltip.triggerElement.getBoundingClientRect();
      anchorRef.current.style.position = 'fixed';
      // Position anchor at trigger location but don't interfere with pointer events
      anchorRef.current.style.left = `${rect.left + rect.width / 2}px`;
      anchorRef.current.style.top = `${rect.top}px`;
      anchorRef.current.style.width = '0';
      anchorRef.current.style.height = `${rect.height}px`;
      // Make it non-interactive so it doesn't interfere with trigger element
      anchorRef.current.style.pointerEvents = 'none';
    }
  }, [currentTooltip]);

  useEffect(() => {
    updateAnchorPosition();
  }, [currentTooltip, updateAnchorPosition]);

  useEffect(() => {
    if (currentTooltip && mounted) {
      const handleScroll = () => updateAnchorPosition();
      const handleResize = () => updateAnchorPosition();

      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [currentTooltip, mounted, updateAnchorPosition]);

  useEffect(() => {
    if (currentTooltip && mounted) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          currentTooltip.triggerElement &&
          !currentTooltip.triggerElement.contains(event.target as Node)
        ) {
          hideTooltip();
        }
      };

      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [currentTooltip, mounted, hideTooltip]);

  if (!mounted || !currentTooltip) return null;

  const tooltipContent = (
    <TooltipProvider delayDuration={0}>
      <TooltipPrimitive.Root open={true}>
        <TooltipPrimitive.Trigger asChild>
          <div 
            ref={anchorRef} 
            aria-hidden="true"
          />
        </TooltipPrimitive.Trigger>
        <TooltipContent 
          className="max-w-sm border border-[var(--color-fd-border)] bg-[var(--color-fd-popover)] text-[var(--color-fd-popover-foreground)] z-[9999] shadow-2xl"
          side="top"
          sideOffset={8}
          align="center"
          onMouseEnter={cancelHide}
          onMouseLeave={hideTooltip}
          onPointerDownOutside={(e) => {
            if (currentTooltip.triggerElement && currentTooltip.triggerElement.contains(e.target as Node)) {
              e.preventDefault();
            }
          }}
        >
          <div className="p-2">
            {isLoading && (
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
        </TooltipContent>
      </TooltipPrimitive.Root>
    </TooltipProvider>
  );

  return createPortal(tooltipContent, document.body);
}