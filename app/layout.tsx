import './polyfills';
import './global.css';
import '@/styles/sidebar-override.css';
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
        <script defer dangerouslySetInnerHTML={{
          __html: `document.addEventListener('load', function(d, s, id) {var js, fjs = d.getElementsByTagName(s)[0];if (d.getElementById(id)) return;js = d.createElement(s); js.id = id;js.src = "https://widget.prod.equally.ai/equally-widget.min.js";fjs.parentNode.insertBefore(js, fjs);}(document, 'script', 'equallyWidget'));!window.EQUALLY_AI_API_KEY&&(window.EQUALLY_AI_API_KEY="racqlctj3uwloxn2prgc3bi8jt90sovk",intervalId=setInterval(function(){window.EquallyAi&&(clearInterval(intervalId),window.EquallyAi=new EquallyAi)},500));`
        }} />
      </body>
    </html>
  );
}