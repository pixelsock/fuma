'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Using the AG Grid content renderer instead
const UDOContentServer = dynamic(
  () => import('./udo-content-with-aggrid').then(mod => mod.UDOContentWithAgGrid),
  { 
    ssr: false,
    loading: () => (
      <div className="prose prose-lg max-w-none">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    )
  }
);

interface UDOContentDynamicProps {
  htmlContent: string;
}

export function UDOContentDynamic({ htmlContent }: UDOContentDynamicProps) {
  return (
    <Suspense fallback={
      <div className="prose prose-lg max-w-none">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    }>
      <UDOContentServer htmlContent={htmlContent} />
    </Suspense>
  );
}