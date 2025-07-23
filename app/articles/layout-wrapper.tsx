import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import { baseOptions } from '@/app/layout.config';
import { unifiedSource } from '@/lib/unified-source';
import { SearchNavigationWrapper } from '@/components/search-navigation-wrapper';
import type { ReactNode } from 'react';

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function ArticlesLayoutWrapper({ children }: { children: ReactNode }) {
  // Ensure the page tree is loaded before rendering
  const pageTree = await unifiedSource.getPageTree();
  
  console.log('[ArticlesLayoutWrapper] Page tree loaded with', pageTree?.children?.length || 0, 'categories');
  
  return (
    <>
      <DocsLayout
        {...baseOptions}
        tabMode="navbar"
        tree={pageTree as any}
        nav={{...baseOptions.nav, mode:'top'}}
        sidebar={{
          tabs: [
            {
              title: 'Home',
              description: 'Home',
              url: '/',
            },
            {
              title: 'Articles',
              description: 'Browse articles by category',
              url: '/articles',
            },
            {
              title: 'Text Amendments',
              description: 'Text Amendments',
              url: '/text-amendments',
            },
            {
              title: 'Search Articles',
              description: 'Enhanced search with grid/list views',
              url: '/articles-enhanced',
            },
            {
              title: 'Overlay Districts',
              description: 'Administration and enforcement',
              url: '/overlay-districts',
            },
          ],
        }}
      >
        {children}
      </DocsLayout>
      <SearchNavigationWrapper />
    </>
  );
}