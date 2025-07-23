'use client';

import React from 'react';
import { DefinitionTooltip } from './definition-tooltip-v2';
import { DefinitionErrorBoundary } from './definition-error-boundary';
import { cn } from '@/lib/utils';

interface DefinitionLinkProps {
  definitionId: string;
  children: React.ReactNode;
  className?: string;
}

export function DefinitionLink({ definitionId, children, className }: DefinitionLinkProps) {
  return (
    <DefinitionErrorBoundary>
      <DefinitionTooltip
        definitionId={definitionId}
        className={className}
      >
        {children}
      </DefinitionTooltip>
    </DefinitionErrorBoundary>
  );
}