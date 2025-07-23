'use client';

import { RootProvider } from 'fumadocs-ui/provider';
import CustomSearchDialog from '@/components/custom-search-dialog';
import { type ReactNode } from 'react';
import { DefinitionDataProvider } from '@/components/definition-data-context';
import { DefinitionPrefetcher } from '@/components/definition-prefetcher';
import { TooltipProvider } from '@/components/ui/tooltip';

export function Provider({ children }: { children: ReactNode }) {
  return (
    <DefinitionDataProvider>
      <RootProvider
        search={{
          SearchDialog: CustomSearchDialog,
        }}
        theme={{
          enabled: true,
          defaultTheme: 'system',
          themes: ['light', 'dark', 'system'],
          storageKey: 'charlotte-theme',
          attribute: 'class',
          enableColorScheme: true,
          disableTransitionOnChange: false,
        }}
      >
        <TooltipProvider>{children}</TooltipProvider>
      </RootProvider>
      <DefinitionPrefetcher />
    </DefinitionDataProvider>
  );
}