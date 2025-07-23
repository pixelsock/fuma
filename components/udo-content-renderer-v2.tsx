'use client';

import React from 'react';
import { ProgressiveDefinitionProcessor } from './progressive-definition-processor';

interface UDOContentRendererV2Props {
  htmlContent: string;
  className?: string;
}

export function UDOContentRendererV2({ htmlContent, className }: UDOContentRendererV2Props) {
  return (
    <ProgressiveDefinitionProcessor>
      <div 
        className={className}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </ProgressiveDefinitionProcessor>
  );
}