'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useTooltip } from './definition-tooltip-context';
import { cn } from '@/lib/utils';
import { DefinitionErrorBoundary } from './definition-error-boundary';

interface DefinitionLinkProps {
  definitionId: string;
  children: React.ReactNode;
  className?: string;
}

function DefinitionLinkInner({ definitionId, children, className }: DefinitionLinkProps) {
  const tooltipContext = useTooltip();
  const linkRef = useRef<HTMLSpanElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  const { currentTooltip, showTooltip, hideTooltip } = tooltipContext;

  // Detect mobile/tablet devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isActive = currentTooltip?.definitionId === definitionId;

  const handleMouseEnter = () => {
    if (!isMobile && linkRef.current) {
      showTooltip(definitionId, linkRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      hideTooltip();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isMobile && linkRef.current) {
      if (isActive) {
        hideTooltip();
      } else {
        showTooltip(definitionId, linkRef.current);
      }
    }
  };

  return (
    <span
      ref={linkRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "definition-link inline text-[var(--color-fd-primary)] underline decoration-dotted underline-offset-2 hover:text-[var(--color-fd-primary)] hover:decoration-solid transition-all",
        isMobile ? "cursor-pointer" : "cursor-help",
        isActive && "decoration-solid",
        className
      )}
      role="button"
      tabIndex={0}
      aria-label={`Show definition for ${children}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e as any);
        }
      }}
    >
      {children}
    </span>
  );
}

export function DefinitionLink(props: DefinitionLinkProps) {
  return (
    <DefinitionErrorBoundary
      fallback={
        <span className={cn("text-[var(--color-fd-primary)] underline decoration-dotted", props.className)}>
          {props.children}
        </span>
      }
    >
      <DefinitionLinkInner {...props} />
    </DefinitionErrorBoundary>
  );
}