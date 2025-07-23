'use client';

import { UDOContentWithAgGrid } from './udo-content-with-aggrid';

interface UDOContentRendererProps {
  htmlContent: string;
  className?: string;
}

// Component that renders content with AG-Grid tables
export function UDOContentRenderer({ htmlContent, className }: UDOContentRendererProps) {
  return <UDOContentWithAgGrid htmlContent={htmlContent} className={className || "udo-content"} />;
}