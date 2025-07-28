// Debug script to check heading structure and TOC data
// Run this in the browser console

function debugHeadingsAndTOC() {
  console.log('=== HEADING DEBUG ===');
  
  // Check all headings
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  console.log('Total headings found:', headings.length);
  
  headings.forEach((heading, i) => {
    console.log(`Heading ${i}:`, {
      tag: heading.tagName,
      id: heading.id,
      text: heading.textContent?.trim(),
      hasId: !!heading.id
    });
  });
  
  console.log('\n=== TOC DATA DEBUG ===');
  
  // Check for TOC data in window or data attributes
  const tocContainer = document.querySelector('[data-toc-container]') || 
                      document.querySelector('.toc-container') ||
                      document.querySelector('[class*="toc"]');
  
  console.log('TOC container:', tocContainer);
  
  // Check for popover TOC button
  const tocPopover = document.querySelector('[aria-label*="Table of Contents"]') ||
                    document.querySelector('[aria-label*="TOC"]') ||
                    document.querySelector('button[class*="toc"]');
  
  console.log('TOC popover button:', tocPopover);
  
  // Check if fumadocs added data to window
  if (window.__fumadocs_toc) {
    console.log('Fumadocs TOC data:', window.__fumadocs_toc);
  }
  
  // Check for any elements with href="#something"
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  console.log('Anchor links found:', anchorLinks.length);
  anchorLinks.forEach((link, i) => {
    console.log(`Link ${i}:`, {
      href: link.getAttribute('href'),
      text: link.textContent?.trim(),
      dataActive: link.getAttribute('data-active'),
      dataToc: link.hasAttribute('data-toc')
    });
  });
}

debugHeadingsAndTOC();