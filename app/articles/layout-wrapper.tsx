import { SharedDocsLayout } from '@/components/shared-docs-layout';
import type { ReactNode } from 'react';

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function ArticlesLayoutWrapper({ children }: { children: ReactNode }) {
  // Always show sidebar - individual pages will control visibility
  return (
    <SharedDocsLayout config={{ showSidebar: true, showSidebarIcon: true }}>
      {children}
    </SharedDocsLayout>
  );
}