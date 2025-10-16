import { UDOContentRendererV3Optimized } from './udo-content-renderer-v3-optimized';

interface UDOContentWithAgGridProps {
  htmlContent: string;
  className?: string;
}

/**
 * Backwards compatible wrapper that now delegates to the TanStack-based renderer.
 * Retained so legacy test pages continue to function without AG Grid.
 */
export function UDOContentWithAgGrid({
  htmlContent,
  className,
}: UDOContentWithAgGridProps) {
  return (
    <UDOContentRendererV3Optimized
      htmlContent={htmlContent}
      className={className}
    />
  );
}
