'use client';

import { useEffect } from 'react';

export function PerformanceMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.performance) return;

    // Measure and log performance metrics
    const measurePerformance = () => {
      const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (perfData) {
        const metrics = {
          // Navigation timing
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          domComplete: perfData.domComplete - perfData.domInteractive,
          loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
          
          // First paint metrics
          firstPaint: 0,
          firstContentfulPaint: 0,
          largestContentfulPaint: 0,
          
          // Table rendering metrics
          tableRenderStart: 0,
          tableRenderEnd: 0,
          definitionPrefetchStart: 0,
          definitionPrefetchEnd: 0
        };

        // Get paint metrics
        const paintEntries = window.performance.getEntriesByType('paint');
        paintEntries.forEach(entry => {
          if (entry.name === 'first-paint') {
            metrics.firstPaint = entry.startTime;
          } else if (entry.name === 'first-contentful-paint') {
            metrics.firstContentfulPaint = entry.startTime;
          }
        });

        // Get LCP
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          metrics.largestContentfulPaint = lastEntry.startTime;
          
          // Log all metrics
          console.group('🚀 Performance Metrics');
          console.log('DOM Content Loaded:', metrics.domContentLoaded, 'ms');
          console.log('DOM Complete:', metrics.domComplete, 'ms');
          console.log('Page Load Complete:', metrics.loadComplete, 'ms');
          console.log('First Paint:', metrics.firstPaint.toFixed(2), 'ms');
          console.log('First Contentful Paint:', metrics.firstContentfulPaint.toFixed(2), 'ms');
          console.log('Largest Contentful Paint:', metrics.largestContentfulPaint.toFixed(2), 'ms');
          console.groupEnd();
          
          // Check performance targets
          const targets = {
            firstContentfulPaint: 1500, // Target: < 1.5s
            largestContentfulPaint: 2500, // Target: < 2.5s
            domComplete: 3000 // Target: < 3s
          };
          
          console.group('📊 Performance Targets');
          Object.entries(targets).forEach(([metric, target]) => {
            const value = metrics[metric as keyof typeof metrics];
            const passed = value <= target;
            console.log(
              `${metric}: ${value.toFixed(2)}ms / ${target}ms`,
              passed ? '✅' : '❌'
            );
          });
          console.groupEnd();
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Cleanup
        return () => observer.disconnect();
      }
    };

    // Wait for page to fully load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, []);

  // Monitor table rendering performance
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const markTableRenderStart = () => {
      performance.mark('table-render-start');
    };

    const markTableRenderEnd = () => {
      performance.mark('table-render-end');
      performance.measure('table-render', 'table-render-start', 'table-render-end');
      
      const measure = performance.getEntriesByName('table-render')[0];
      if (measure) {
        console.log('⚡ Table Render Time:', measure.duration.toFixed(2), 'ms');
      }
    };

    // Listen for custom events
    window.addEventListener('table-render-start', markTableRenderStart);
    window.addEventListener('table-render-end', markTableRenderEnd);

    return () => {
      window.removeEventListener('table-render-start', markTableRenderStart);
      window.removeEventListener('table-render-end', markTableRenderEnd);
    };
  }, []);

  return null;
}