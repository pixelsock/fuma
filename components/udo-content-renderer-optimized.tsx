'use client';

import { UDOContentRendererV3Optimized } from './udo-content-renderer-v3-optimized';

interface UDOContentRendererOptimizedProps {
  htmlContent: string;
  className?: string;
}

/**
 * Backwards compatible optimized renderer now backed by the TanStack tables.
 */
export function UDOContentRendererOptimized({
  htmlContent,
  className,
}: UDOContentRendererOptimizedProps) {
  return (
    <UDOContentRendererV3Optimized
      htmlContent={htmlContent}
      className={className}
    />
  );
}
