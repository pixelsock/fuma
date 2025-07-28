import type { ReactNode } from 'react';
import { SharedDocsLayout } from '@/components/shared-docs-layout';

export default function Layout({ children }: { children: ReactNode }) {
  // Overlay districts: Hide sidebar and icon
  return (
    <SharedDocsLayout config={{ showSidebar: false, showSidebarIcon: false }}>
      {children}
    </SharedDocsLayout>
  );
}