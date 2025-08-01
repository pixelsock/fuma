/**
 * DOM Scanner for Charlotte UDO Content Bridge
 * Finds and maps elements with data-article-id attributes
 */

/**
 * Gets all elements in the document with data-article-id attribute
 * @returns {Element[]} Array of DOM elements with data-article-id
 */
export function getArticleElements() {
  return Array.from(document.querySelectorAll('[data-article-id]'));
}

/**
 * Extracts the article ID from an element's data-article-id attribute
 * @param {Element} element - DOM element to extract ID from
 * @returns {string|null} The article ID or null if invalid
 */
export function extractArticleId(element) {
  const id = element.getAttribute('data-article-id');
  
  if (!id || !id.trim()) {
    return null;
  }
  
  return id.trim();
}

/**
 * Scans the DOM for all elements with data-article-id attributes
 * and creates a map of article IDs to their corresponding elements
 * @returns {Map<string, Element[]>} Map of article ID to array of elements
 */
export function scanForArticles() {
  const articleMap = new Map();
  const elements = getArticleElements();
  
  for (const element of elements) {
    const articleId = extractArticleId(element);
    
    if (articleId) {
      if (!articleMap.has(articleId)) {
        articleMap.set(articleId, []);
      }
      articleMap.get(articleId).push(element);
    }
  }
  
  return articleMap;
}

/**
 * Gets unique article IDs from the current DOM
 * @returns {string[]} Array of unique article IDs
 */
export function getUniqueArticleIds() {
  const articleMap = scanForArticles();
  return Array.from(articleMap.keys());
}

/**
 * Counts total number of article elements in the DOM
 * @returns {number} Total count of elements with data-article-id
 */
export function countArticleElements() {
  return getArticleElements().length;
}