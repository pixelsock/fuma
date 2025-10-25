import { SharedDocsLayout } from '@/components/shared-docs-layout';
import type { ReactNode } from 'react';

export default async function SupportingDocumentsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SharedDocsLayout config={{ showSidebar: false, showSidebarIcon: false }}>
      {children}
    </SharedDocsLayout>
  );
}
