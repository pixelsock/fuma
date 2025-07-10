import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { baseOptions } from '@/app/layout.config';
import { source as originalSource } from '@/lib/source';

export default function Layout({ children }: { children: ReactNode }) {
  // Temporarily revert to original source to fix fs module error
  return (
    <DocsLayout tree={originalSource.pageTree} {...baseOptions}>
      {children}
    </DocsLayout>
  );
}
