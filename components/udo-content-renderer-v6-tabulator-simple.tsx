'use client';

import { UDOContentRendererV3Optimized } from './udo-content-renderer-v3-optimized';

interface UDOContentRendererV6TabulatorSimpleProps {
  htmlContent: string;
  className?: string;
}

/**
 * Legacy tabulator-based renderer redirected to the unified TanStack renderer.
 */
export function UDOContentRendererV6TabulatorSimple({
  htmlContent,
  className,
}: UDOContentRendererV6TabulatorSimpleProps) {
  return (
    <UDOContentRendererV3Optimized
      htmlContent={htmlContent}
      className={className}
    />
  );
}
