import { ArticlesLayoutWrapper } from './layout-wrapper';
import type { ReactNode } from 'react';

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Layout({ children }: { children: ReactNode }) {
  return <ArticlesLayoutWrapper>{children}</ArticlesLayoutWrapper>;
}