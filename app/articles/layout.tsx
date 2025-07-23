import { ArticlesLayoutWrapper } from './layout-wrapper';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return <ArticlesLayoutWrapper>{children}</ArticlesLayoutWrapper>;
}