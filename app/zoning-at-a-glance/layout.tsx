import type { ReactNode } from 'react';
import { SharedDocsLayout } from '@/components/shared-docs-layout';

export default function Layout({ children }: { children: ReactNode }) {
  // Zoning at a glance: Hide sidebar and icon
  return (
    <SharedDocsLayout config={{ showSidebar: false, showSidebarIcon: false }}>
      {children}
    </SharedDocsLayout>
  );
}