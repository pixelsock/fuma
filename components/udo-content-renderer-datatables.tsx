'use client';

import { UDOContentRendererSimple } from './udo-content-renderer-simple';

interface UDOContentRendererProps {
  htmlContent: string;
}

// Component that renders content with simple HTML tables
export function UDOContentRendererDataTables({ htmlContent }: UDOContentRendererProps) {
  return <UDOContentRendererSimple htmlContent={htmlContent} className="udo-content" />;
}