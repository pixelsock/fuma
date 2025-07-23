import './polyfills';
import './global.css';
import { Provider } from './provider';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { PerformanceMonitor } from '@/components/performance-monitor';

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
      <body className="flex flex-col min-h-screen">
        <Provider>
          {children}
          {process.env.NODE_ENV === 'development' && <PerformanceMonitor />}
        </Provider>
      </body>
    </html>
  );
}