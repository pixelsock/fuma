import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import { baseOptions } from '@/app/layout.config';
import { unifiedSource } from '@/lib/unified-source';
import { SearchNavigationWrapper } from '@/components/search-navigation-wrapper';
import { SidebarVisibilityController } from '@/components/sidebar-visibility-controller-simplified';
import type { ReactNode } from 'react';

export interface SharedDocsLayoutConfig {
  showSidebar?: boolean;
  showSidebarIcon?: boolean;
}

interface SharedDocsLayoutProps {
  children: ReactNode;
  config?: SharedDocsLayoutConfig;
}

// Enable static generation with revalidation for better performance
// Revalidate every 5 minutes (300 seconds)
export const revalidate = 300;

export async function SharedDocsLayout({ children, config = {} }: SharedDocsLayoutProps) {
  // Default configuration - show sidebar by default
  const { 
    showSidebar = true, 
    showSidebarIcon = true 
  } = config;

  // Ensure the page tree is loaded before rendering
  const pageTree = await unifiedSource.getPageTree();
  
  console.log('[SharedDocsLayout] Page tree loaded with', pageTree?.children?.length || 0, 'categories');
  console.log('[SharedDocsLayout] Config:', { showSidebar, showSidebarIcon });
  
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
              title: 'What is the UDO',
              description: 'Learn about the ordinance',
              url: '/what-is-udo',
            },
            {
              title: 'Articles',
              description: 'Browse articles by category',
              url: '/articles-listing',
            },
            {
              title: 'Versions',
              description: 'Prior UDO versions and documents',
              url: '/versions',
            },
            {
              title: 'Text Amendments',
              description: 'Text Amendments',
              url: '/text-amendments',
            },
            // ARCHIVED: Zoning at a Glance page - not critical for launch
            // Uncomment to restore to navigation when ready
            // {
            //   title: 'Zoning at a Glance',
            //   description: 'Zoning at a Glance',
            //   url: '/zoning-at-a-glance',
            // },
            {
              title: 'Advisory Committee',
              description: 'UAC membership and meetings',
              url: '/advisory-committee',
            },
          ],
        }}
      >
        <SidebarVisibilityController showSidebar={showSidebar} showSidebarIcon={showSidebarIcon}>
          {children}
        </SidebarVisibilityController>
      </DocsLayout>
      <SearchNavigationWrapper />
    </>
  );
}