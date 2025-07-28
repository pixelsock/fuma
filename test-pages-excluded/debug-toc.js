// Debug script to check TOC popover active state
// Run this in the browser console

function debugTOCPopover() {
  // Check for TOC popover button
  const tocPopoverButton = document.querySelector('[data-toc-popover]') || 
                           document.querySelector('button[aria-label*="Table of Contents"]') ||
                           document.querySelector('button[aria-label*="TOC"]') ||
                           document.querySelector('button[aria-label*="toc"]');
  
  console.log('TOC Popover button:', tocPopoverButton);
  
  if (tocPopoverButton) {
    // Click to open popover
    tocPopoverButton.click();
    
    setTimeout(() => {
      // Look for TOC items in popover
      const popoverContent = document.querySelector('[role="dialog"]') || 
                           document.querySelector('[data-state="open"]') ||
                           document.querySelector('.popover-content');
      
      console.log('Popover content:', popoverContent);
      
      if (popoverContent) {
        const tocLinks = popoverContent.querySelectorAll('a[href^="#"]');
        console.log('TOC links in popover:', tocLinks.length);
        
        // Check for active state
        const activeLinks = popoverContent.querySelectorAll('[data-active="true"]');
        console.log('Active TOC links in popover:', activeLinks.length);
        
        tocLinks.forEach((link, i) => {
          console.log(`Link ${i}:`, link.textContent, 'Active:', link.getAttribute('data-active'));
        });
      }
    }, 500);
  }
  
  // Also check for any TOC elements on the page
  const allTocElements = document.querySelectorAll('[class*="toc"]');
  console.log('All elements with "toc" in class:', allTocElements.length);
  allTocElements.forEach(el => {
    console.log('TOC element:', el.className, el);
  });
}

debugTOCPopover();