'use client';

import { useEffect, useState } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { createRoot } from 'react-dom/client';

export function HeadingLinkHandler() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Ensure we're on the client and hydration is complete
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Don't run until after hydration
    if (!isMounted) return;

    const setupHeadingHandlers = () => {
      // Store active tooltip cleanup function
      let activeTooltipCleanup: (() => void) | null = null;

      // Function to create and show tooltip using Radix UI
      const showTooltip = (element: HTMLElement, message: string) => {
        // Clean up any existing tooltip first
        if (activeTooltipCleanup) {
          activeTooltipCleanup();
          activeTooltipCleanup = null;
        }

        // Remove any existing tooltip containers
        document.querySelectorAll('.heading-link-tooltip-container').forEach(el => el.remove());

        // Create a container for the tooltip
        const container = document.createElement('div');
        container.className = 'heading-link-tooltip-container';
        container.style.position = 'absolute';
        container.style.zIndex = '10000';
        
        // Get the position of the element
        const rect = element.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        // Position container near the icon (right edge of heading)
        container.style.left = `${rect.right + scrollX - 20}px`;
        container.style.top = `${rect.top + scrollY}px`;
        
        document.body.appendChild(container);
        
        // Create React root and render Radix Tooltip
        const root = createRoot(container);
        root.render(
          <TooltipPrimitive.Provider delayDuration={0}>
            <TooltipPrimitive.Root open={true}>
              <TooltipPrimitive.Trigger asChild>
                <div style={{ width: 1, height: 1 }} />
              </TooltipPrimitive.Trigger>
              <TooltipPrimitive.Portal>
                <TooltipPrimitive.Content
                  side="top"
                  sideOffset={8}
                  className="z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95"
                >
                  {message}
                </TooltipPrimitive.Content>
              </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
          </TooltipPrimitive.Provider>
        );

        // Create cleanup function
        const cleanup = () => {
          root.unmount();
          container.remove();
        };

        // Store cleanup function
        activeTooltipCleanup = cleanup;

        // Hide and remove tooltip after 2 seconds
        setTimeout(() => {
          cleanup();
          if (activeTooltipCleanup === cleanup) {
            activeTooltipCleanup = null;
          }
        }, 2000);
      };

      // Function to copy link to clipboard
      const copyLinkToClipboard = async (heading: HTMLElement) => {
        const id = heading.getAttribute('id');
        if (!id) return;

        const url = `${window.location.origin}${window.location.pathname}#${id}`;
        
        try {
          await navigator.clipboard.writeText(url);
          showTooltip(heading, 'Link copied to clipboard!');
        } catch (err) {
          console.error('Failed to copy URL:', err);
          showTooltip(heading, 'Failed to copy link');
        }
      };

      // Attach interactive behaviors to h2 headings with IDs without mutating structure
      const addHeadingBehaviors = () => {
        const headings = document.querySelectorAll('.udo-content h2[id]');
        
        headings.forEach((heading) => {
          const h2 = heading as HTMLHeadingElement;
          // Use a data-flag to prevent double-binding
          if ((h2 as any)._linkHandlerAttached) return;
          (h2 as any)._linkHandlerAttached = true;

          // Click to copy (don't modify DOM attributes to avoid hydration mismatch)
          h2.addEventListener('click', (e) => {
            // Ignore if selecting text
            const selection = window.getSelection();
            if (selection && selection.toString()) return;
            copyLinkToClipboard(h2);
          });

          // Hover effect to show icon via CSS
          h2.addEventListener('mouseenter', () => h2.classList.add('link-icon-hover'));
          h2.addEventListener('mouseleave', () => h2.classList.remove('link-icon-hover'));
        });
      };

      // Initial setup
      addHeadingBehaviors();

      // Watch for dynamic content changes
      const observer = new MutationObserver(() => {
        addHeadingBehaviors();
      });

      // Start observing
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Return cleanup function
      return () => {
        observer.disconnect();
        
        // Remove tooltips
        document.querySelectorAll('.heading-link-tooltip').forEach(el => el.remove());
      };
    };

    // Add a small delay to ensure DOM is fully ready
    let cleanupFn: (() => void) | null = null;
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(() => {
        cleanupFn = setupHeadingHandlers();
      });
    }, 100);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      if (cleanupFn) {
        cleanupFn();
      }
      // Remove tooltips
      document.querySelectorAll('.heading-link-tooltip').forEach(el => el.remove());
    };
  }, [isMounted]);

  return null;
}
