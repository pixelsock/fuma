/**
 * Highlights search terms in text content
 */
export function highlightSearchTerms(text: string, searchTerm: string): string {
  if (!searchTerm || !text) return text;
  
  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
  return text.replace(regex, '<mark class="bg-fd-accent text-fd-accent-foreground px-1 rounded font-medium">$1</mark>');
}

/**
 * Escapes special regex characters in search term
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Highlights search terms in DOM elements on the page
 */
export function highlightInPage(searchTerm: string): () => void {
  console.log('highlightInPage called with:', searchTerm);
  if (!searchTerm) return () => {};
  
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function(node) {
        // Skip script, style, and already highlighted elements
        const parent = node.parentElement;
        if (!parent || ['SCRIPT', 'STYLE', 'MARK'].includes(parent.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const textNodes: Text[] = [];
  let node: Node | null;
  
  while (node = walker.nextNode()) {
    if (node.textContent && node.textContent.toLowerCase().includes(searchTerm.toLowerCase())) {
      textNodes.push(node as Text);
    }
  }
  
  console.log('Found text nodes to highlight:', textNodes.length);

  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
  
  textNodes.forEach(textNode => {
    const parent = textNode.parentElement;
    if (!parent) return;
    
    const text = textNode.textContent || '';
    if (regex.test(text)) {
      const highlightedHtml = text.replace(regex, '<mark class="bg-fd-accent text-fd-accent-foreground px-1 rounded search-highlight font-medium" data-search-term="true">$1</mark>');
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = highlightedHtml;
      
      while (tempDiv.firstChild) {
        parent.insertBefore(tempDiv.firstChild, textNode);
      }
      parent.removeChild(textNode);
    }
  });

  // Return cleanup function
  return () => {
    const highlights = document.querySelectorAll('.search-highlight');
    highlights.forEach(highlight => {
      const parent = highlight.parentElement;
      if (parent) {
        parent.replaceChild(document.createTextNode(highlight.textContent || ''), highlight);
        parent.normalize(); // Merge adjacent text nodes
      }
    });
  };
}

/**
 * Gets all highlighted elements on the page for navigation
 */
export function getHighlightedElements(): Element[] {
  return Array.from(document.querySelectorAll('.search-highlight'));
}

/**
 * Scrolls to a specific highlighted element
 */
export function scrollToHighlight(index: number): void {
  const highlights = getHighlightedElements();
  if (highlights[index]) {
    highlights[index].scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
    
    // Add temporary active styling
    highlights.forEach((h, i) => {
      h.classList.toggle('ring-2', i === index);
      h.classList.toggle('ring-fd-primary', i === index);
      h.classList.toggle('shadow-md', i === index);
    });
  }
}