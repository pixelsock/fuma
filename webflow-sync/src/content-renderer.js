/**
 * Content Renderer for Charlotte UDO Content Bridge
 * Safely injects content into DOM elements with sanitization
 */

// CSS classes for styling hooks
const CLASSES = {
  loading: 'udo-content-loading',
  loaded: 'udo-content-loaded',
  error: 'udo-content-error'
};

// Allowed HTML tags for sanitization
const ALLOWED_TAGS = [
  'p', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'strong', 'em', 'b', 'i', 'u', 'br', 'hr',
  'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  'a', 'img', 'blockquote', 'pre', 'code',
  'article', 'section', 'nav', 'aside', 'header', 'footer'
];

// Allowed attributes for specific tags
const ALLOWED_ATTRIBUTES = {
  a: ['href', 'title', 'target', 'rel', 'class'],
  img: ['src', 'alt', 'title', 'width', 'height', 'class'],
  div: ['class', 'id'],
  span: ['class', 'id'],
  p: ['class', 'id'],
  h1: ['class', 'id'],
  h2: ['class', 'id'],
  h3: ['class', 'id'],
  h4: ['class', 'id'],
  h5: ['class', 'id'],
  h6: ['class', 'id'],
  table: ['class', 'id'],
  tr: ['class'],
  td: ['class', 'colspan', 'rowspan'],
  th: ['class', 'colspan', 'rowspan']
};

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param {string} html - Raw HTML content
 * @returns {string} Sanitized HTML
 */
export function sanitizeHTML(html) {
  if (!html) return '';
  
  // Create a temporary element to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  // Remove all script tags and their content
  const scripts = temp.querySelectorAll('script');
  scripts.forEach(script => script.remove());
  
  // Process all elements
  const allElements = temp.querySelectorAll('*');
  allElements.forEach(element => {
    const tagName = element.tagName.toLowerCase();
    
    // Remove disallowed tags
    if (!ALLOWED_TAGS.includes(tagName)) {
      element.remove();
      return;
    }
    
    // Remove all attributes except allowed ones
    const allowedAttrs = ALLOWED_ATTRIBUTES[tagName] || [];
    const attributes = Array.from(element.attributes);
    
    attributes.forEach(attr => {
      if (!allowedAttrs.includes(attr.name)) {
        element.removeAttribute(attr.name);
      } else {
        // Additional checks for specific attributes
        if (attr.name === 'href' || attr.name === 'src') {
          // Remove javascript: URLs
          if (attr.value.toLowerCase().includes('javascript:')) {
            element.removeAttribute(attr.name);
          }
        }
      }
    });
  });
  
  return temp.innerHTML;
}

/**
 * Renders content into a DOM element with proper sanitization
 * @param {Element} element - Target DOM element
 * @param {string} content - HTML content to render
 */
export function renderContent(element, content) {
  // Sanitize the content
  const sanitizedContent = sanitizeHTML(content);
  
  // Clear existing content and set new content
  element.innerHTML = sanitizedContent;
  
  // Update classes
  element.classList.remove(CLASSES.loading, CLASSES.error);
  element.classList.add(CLASSES.loaded);
}

/**
 * Renders an error message in the element
 * @param {Element} element - Target DOM element
 * @param {Error|null} error - Error object or null for not found
 */
export function renderError(element, error) {
  let errorMessage;
  
  if (error === null) {
    // Content not found (404)
    errorMessage = 'Content not found';
  } else {
    // Generic error message (don't expose technical details)
    errorMessage = 'Unable to load content';
  }
  
  element.innerHTML = `<div class="udo-error-message">${errorMessage}</div>`;
  
  // Update classes
  element.classList.remove(CLASSES.loading, CLASSES.loaded);
  element.classList.add(CLASSES.error);
}

/**
 * Renders article content into an element
 * @param {Element} element - Target DOM element
 * @param {Object|null} article - Article object with id and content
 */
export function renderArticleContent(element, article) {
  if (!article) {
    renderError(element, null);
    return;
  }
  
  renderContent(element, article.content || '');
}

/**
 * Clears element content and sets loading state
 * @param {Element} element - Target DOM element
 */
export function clearElementContent(element) {
  element.innerHTML = '';
  element.classList.remove(CLASSES.loaded, CLASSES.error);
  element.classList.add(CLASSES.loading);
}

/**
 * Creates a loading indicator element
 * @returns {string} HTML for loading indicator
 */
export function createLoadingIndicator() {
  return '<div class="udo-loading-indicator">Loading content...</div>';
}