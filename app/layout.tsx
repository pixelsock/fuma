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
        <script dangerouslySetInnerHTML={{
          __html: `
            // Cloudflare Workers optimized Equally AI widget loader
            window.EQUALLY_AI_API_KEY = "racqlctj3uwloxn2prgc3bi8jt90sovk";
            
            // Only load if not in Cloudflare Workers context or if specifically allowed
            if (typeof caches === 'undefined' || typeof window !== 'undefined') {
              // Defer loading to avoid blocking
              setTimeout(function() {
                try {
                  var script = document.createElement('script');
                  script.id = 'equallyWidget';
                  script.src = 'https://widget.prod.equally.ai/equally-widget.min.js';
                  script.async = true;
                  script.defer = true;
                  
                  // Add timeout to prevent indefinite loading
                  var loadTimeout = setTimeout(function() {
                    console.warn('Equally AI widget failed to load within timeout');
                  }, 15000);
                  
                  script.onload = function() {
                    clearTimeout(loadTimeout);
                    console.log('Equally AI widget loaded successfully');
                    
                    // Initialize with retry logic and timeout
                    var initAttempts = 0;
                    var maxAttempts = 20;
                    
                    function initWidget() {
                      initAttempts++;
                      if (typeof window.EquallyAi !== 'undefined') {
                        try {
                          window.EquallyAi = new window.EquallyAi();
                          console.log('Equally AI widget initialized');
                        } catch (e) {
                          console.error('Error initializing Equally AI widget:', e);
                        }
                      } else if (initAttempts < maxAttempts) {
                        setTimeout(initWidget, 250);
                      } else {
                        console.warn('Equally AI widget initialization timeout after', maxAttempts, 'attempts');
                      }
                    }
                    
                    initWidget();
                  };
                  
                  script.onerror = function() {
                    clearTimeout(loadTimeout);
                    console.error('Failed to load Equally AI widget script');
                  };
                  
                  document.head.appendChild(script);
                } catch (e) {
                  console.error('Error setting up Equally AI widget:', e);
                }
              }, 1000); // Delay initial load by 1 second
            }
          `
        }} />
      </body>
    </html>
  );
}