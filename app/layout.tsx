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
            
            // Remove Webflow badge if it appears
            function removeWebflowBadge() {
              // Safety check - don't run if we're breaking the app
              try {
              // Target the specific Webflow badge pattern
              const badgeSelectors = [
                'a[href*="webflow.com"]',
                'a[href*="utm_campaign=brandjs"]',
                '.w-webflow-badge',
                '.webflow-badge',
                '#webflow-badge',
                '[class*="webflow"]',
                '[class*="made-in-webflow"]'
              ];
              
              // Remove by selectors first
              badgeSelectors.forEach(function(selector) {
                const elements = document.querySelectorAll(selector);
                elements.forEach(function(el) {
                  el.remove();
                });
              });
              
              // More aggressive approach - find elements with Webflow images
              const webflowImages = document.querySelectorAll('img[src*="webflow-badge"], img[alt*="Made in Webflow"], img[src*="d3e54v103j8qbb.cloudfront.net"]');
              webflowImages.forEach(function(img) {
                // Remove the parent anchor if it exists
                const parentAnchor = img.closest('a');
                if (parentAnchor && parentAnchor.href && parentAnchor.href.includes('webflow.com')) {
                  parentAnchor.remove();
                } else {
                  img.remove();
                }
              });
              
              // Find all links that go to webflow.com and contain images
              const webflowLinks = document.querySelectorAll('a[href*="webflow.com"]');
              webflowLinks.forEach(function(link) {
                // Check if it contains webflow badge images
                const hasWebflowImages = link.querySelector('img[src*="webflow-badge"], img[src*="d3e54v103j8qbb.cloudfront.net"]');
                if (hasWebflowImages) {
                  link.remove();
                }
              });
              
              // Remove any fixed position elements that look like badges
              const fixedElements = document.querySelectorAll('*');
              fixedElements.forEach(function(el) {
                const style = window.getComputedStyle(el);
                if (style.position === 'fixed' && 
                    (style.bottom === '12px' || style.right === '12px') &&
                    el.querySelector('img[src*="webflow"]')) {
                  el.remove();
                }
              });
              
              // Remove any style tags that contain webflow badge styles
              const styleTags = document.querySelectorAll('style');
              styleTags.forEach(function(styleTag) {
                if (styleTag.textContent && 
                    styleTag.textContent.includes('webflow.com?utm_campaign=brandjs')) {
                  styleTag.remove();
                }
              });
              
              // More selective script removal - only remove inline scripts with webflow badge code
              const scripts = document.querySelectorAll('script:not([src])');
              scripts.forEach(function(script) {
                if (script.textContent && 
                    script.textContent.includes('webflow.com?utm_campaign=brandjs') &&
                    script.textContent.includes('d3e54v103j8qbb.cloudfront.net')) {
                  script.remove();
                }
              });
              
              // Remove elements by CloudFront CDN source (Webflow's CDN)
              const cloudFrontImages = document.querySelectorAll('img[src*="d3e54v103j8qbb.cloudfront.net"]');
              cloudFrontImages.forEach(function(img) {
                const parentLink = img.closest('a');
                if (parentLink) {
                  parentLink.remove();
                } else {
                  img.remove();
                }
              });
              } catch (error) {
                // Silently fail to avoid breaking the application
                console.warn('Badge removal failed:', error);
              }
            }
            
            // Don't run immediately - wait for app to load first
            // removeWebflowBadge();
            
            // Run after DOM is loaded
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', removeWebflowBadge);
            }
            
            // Run after page is fully loaded (in case badge is injected later)
            window.addEventListener('load', function() {
              removeWebflowBadge();
              // Keep checking for a few seconds in case badge loads async
              setTimeout(removeWebflowBadge, 1000);
              setTimeout(removeWebflowBadge, 3000);
              setTimeout(removeWebflowBadge, 5000);
            });
            
            // Use MutationObserver to catch dynamically added badges
            if (typeof MutationObserver !== 'undefined') {
              const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                  if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    removeWebflowBadge();
                  }
                });
              });
              
              observer.observe(document.body, {
                childList: true,
                subtree: true
              });
            }
          `
        }} />
      </body>
    </html>
  );
}