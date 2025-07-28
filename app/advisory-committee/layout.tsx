import { SharedDocsLayout } from '@/components/shared-docs-layout';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  // Advisory Committee page: Hide sidebar
  return (
    <SharedDocsLayout config={{ showSidebar: false, showSidebarIcon: false }}>
      {children}
    </SharedDocsLayout>
  );
}