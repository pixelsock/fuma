'use client';

import { UDOContentRendererV3Optimized } from './udo-content-renderer-v3-optimized';

interface UDOContentRendererV3Props {
  htmlContent: string;
  className?: string;
}

/**
 * Legacy export preserved for compatibility. Internally delegates to the
 * TanStack-powered renderer.
 */
export function UDOContentRendererV3({
  htmlContent,
  className,
}: UDOContentRendererV3Props) {
  return (
    <UDOContentRendererV3Optimized
      htmlContent={htmlContent}
      className={className}
    />
  );
}
