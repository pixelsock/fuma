'use client';

import { Suspense } from 'react';
import { SearchNavigationEnhanced } from './search-navigation-enhanced';

export function SearchNavigationWrapper() {
  return (
    <Suspense fallback={null}>
      <SearchNavigationEnhanced />
    </Suspense>
  );
}