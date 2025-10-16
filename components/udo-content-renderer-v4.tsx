'use client';

import { UDOContentRendererV3Optimized } from './udo-content-renderer-v3-optimized';

interface UDOContentRendererV4Props {
  htmlContent: string;
  className?: string;
}

/**
 * Legacy V4 renderer mapped to the optimized TanStack implementation.
 */
export function UDOContentRendererV4({
  htmlContent,
  className,
}: UDOContentRendererV4Props) {
  return (
    <UDOContentRendererV3Optimized
      htmlContent={htmlContent}
      className={className}
    />
  );
}
