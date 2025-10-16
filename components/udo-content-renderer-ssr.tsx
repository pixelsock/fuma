'use client';

import { UDOContentRendererV3Optimized } from './udo-content-renderer-v3-optimized';

interface UDOContentRendererSSRProps {
  htmlContent: string;
  className?: string;
}

/**
 * Maintained for compatibility with older SSR code paths.
 */
export function UDOContentRendererSSR({
  htmlContent,
  className,
}: UDOContentRendererSSRProps) {
  return (
    <UDOContentRendererV3Optimized
      htmlContent={htmlContent}
      className={className}
    />
  );
}
