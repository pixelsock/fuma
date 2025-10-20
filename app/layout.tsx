import './polyfills';
import './global.css';
import '@/styles/sidebar-override.css';
import { Provider } from './provider';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { PerformanceMonitor } from '@/components/performance-monitor';
import { VisualEditingProvider } from '@/components/visual-editing-provider';

export const metadata: Metadata = {
  title: 'Charlotte UDO',
  description: 'Charlotte Unified Development Ordinance',
};

const inter = Inter({
  subsets: ['latin'],
});

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body className="flex flex-col min-h-screen">
        <Provider>
          <VisualEditingProvider />
          {children}
          {process.env.NODE_ENV === 'development' && <PerformanceMonitor />}
        </Provider>
      </body>
    </html>
  );
}