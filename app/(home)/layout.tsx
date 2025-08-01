import type { ReactNode } from 'react';
import { SharedDocsLayout } from '@/components/shared-docs-layout';

export default function Layout({ children }: { children: ReactNode }) {
  // Homepage: Hide sidebar
  return (
    <SharedDocsLayout config={{ showSidebar: false, showSidebarIcon: false }}>
      {children}
    </SharedDocsLayout>
  );
}
