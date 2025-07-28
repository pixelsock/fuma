import type { ReactNode } from 'react';
import { SharedDocsLayout } from '@/components/shared-docs-layout';

export default function Layout({ children }: { children: ReactNode }) {
  // Articles enhanced: Show sidebar and icon (it's an articles listing page)
  return (
    <SharedDocsLayout config={{ showSidebar: true, showSidebarIcon: true }}>
      {children}
    </SharedDocsLayout>
  );
}