import { SharedDocsLayout } from '@/components/shared-docs-layout';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  // What is UDO page: Hide sidebar
  return (
    <SharedDocsLayout config={{ showSidebar: false, showSidebarIcon: false }}>
      {children}
    </SharedDocsLayout>
  );
}