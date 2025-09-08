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
      // Function to create and show tooltip
      const showTooltip = (element: HTMLElement, message: string) => {
        // Remove any existing tooltips
        const existingTooltip = document.querySelector('.heading-link-tooltip');
        if (existingTooltip) {
          existingTooltip.remove();
        }

        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'heading-link-tooltip';
        tooltip.textContent = message;
        
        // Style the tooltip
        Object.assign(tooltip.style, {
          position: 'absolute',
          backgroundColor: '#333',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '500',
          whiteSpace: 'nowrap',
          zIndex: '10000',
          pointerEvents: 'none',
          opacity: '0',
          transition: 'opacity 0.2s',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        });

        // Position tooltip above the element
        document.body.appendChild(tooltip);
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        tooltip.style.left = `${rect.right - tooltipRect.width / 2 - 10}px`;
        tooltip.style.top = `${rect.top - tooltipRect.height - 8}px`;
        
        // Show tooltip
        requestAnimationFrame(() => {
          tooltip.style.opacity = '1';
        });

        // Hide and remove tooltip after 2 seconds
        setTimeout(() => {
          tooltip.style.opacity = '0';
          setTimeout(() => tooltip.remove(), 200);
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

          // Make focusable for keyboard access
          h2.setAttribute('tabindex', '0');
          h2.setAttribute('role', 'button');
          h2.setAttribute('aria-label', 'Copy link to section');

          // Click to copy
          h2.addEventListener('click', (e) => {
            // Ignore if selecting text
            const selection = window.getSelection();
            if (selection && selection.toString()) return;
            copyLinkToClipboard(h2);
          });

          // Keyboard support
          h2.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              copyLinkToClipboard(h2);
            }
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
