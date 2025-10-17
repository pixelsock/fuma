'use client';

import { useEffect, useState } from 'react';

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

      // Function to create and show tooltip
      const showTooltip = (element: HTMLElement, message: string) => {
        // Clean up any existing tooltip first
        if (activeTooltipCleanup) {
          activeTooltipCleanup();
          activeTooltipCleanup = null;
        }

        // Remove any existing tooltip containers
        document.querySelectorAll('.heading-link-tooltip').forEach(el => el.remove());

        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'heading-link-tooltip';
        tooltip.textContent = message;
        
        // Style the tooltip to match shadcn design
        Object.assign(tooltip.style, {
          position: 'absolute',
          backgroundColor: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))',
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '500',
          whiteSpace: 'nowrap',
          zIndex: '10000',
          pointerEvents: 'none',
          opacity: '0',
          transition: 'opacity 0.15s',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        });

        // Get the position of the element
        const rect = element.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        document.body.appendChild(tooltip);
        const tooltipRect = tooltip.getBoundingClientRect();
        
        // Position tooltip above the icon at the right edge of the heading
        tooltip.style.left = `${rect.right + scrollX - 20 - tooltipRect.width / 2}px`;
        tooltip.style.top = `${rect.top + scrollY - tooltipRect.height - 8}px`;
        
        // Show tooltip with animation
        requestAnimationFrame(() => {
          tooltip.style.opacity = '1';
        });

        // Create cleanup function
        const cleanup = () => {
          tooltip.style.opacity = '0';
          setTimeout(() => tooltip.remove(), 150);
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
