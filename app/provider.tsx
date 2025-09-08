'use client';

import { RootProvider } from 'fumadocs-ui/provider';
import CustomSearchDialog from '@/components/custom-search-dialog';
import { type ReactNode } from 'react';
import { DefinitionDataProvider } from '@/components/definition-data-context';
import { DefinitionPrefetcher } from '@/components/definition-prefetcher';
import { TooltipProvider } from '@/components/ui/tooltip';
import { HeadingLinkHandler } from '@/components/heading-link-handler';
import { TableEnhancementProviderV2 } from '@/components/table-enhancement-provider-v2';

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
        <HeadingLinkHandler />
        <TableEnhancementProviderV2 />
      </RootProvider>
      <DefinitionPrefetcher />
    </DefinitionDataProvider>
  );
}