/**
 * API Client for Charlotte UDO Content Bridge
 * Handles communication with the Directus API
 */

const API_BASE_URL = 'https://admin.charlotteudo.org';
const API_TIMEOUT = 10000; // 10 seconds

/**
 * Fetches an article from the Directus API
 * @param {string} articleId - The ID of the article to fetch
 * @returns {Promise<{id: string, content: string} | null>} Article data or null if not found
 * @throws {Error} For network errors or server errors
 */
export async function fetchArticle(articleId) {
  const url = `${API_BASE_URL}/items/${articleId}`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      credentials: 'omit',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Handle different response codes
    if (response.status === 404) {
      return null; // Article not found
    }
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extract and return the content
    return {
      id: data.data?.id || articleId,
      content: data.data?.content || ''
    };
    
  } catch (error) {
    // Log errors in development mode
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      console.error('[Charlotte UDO Widget] API Error:', error);
    }
    
    // Re-throw the error for the caller to handle
    throw error;
  }
}

/**
 * Fetches multiple articles in a single batch request
 * This is a placeholder for future implementation
 * @param {string[]} articleIds - Array of article IDs to fetch
 * @returns {Promise<Map<string, {id: string, content: string}>>} Map of article ID to article data
 */
export async function fetchArticlesBatch(articleIds) {
  // For now, fetch articles individually
  // TODO: Implement batch API endpoint when available
  const results = new Map();
  
  for (const id of articleIds) {
    try {
      const article = await fetchArticle(id);
      if (article) {
        results.set(id, article);
      }
    } catch (error) {
      // Skip failed articles in batch mode
      if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
        console.error(`[Charlotte UDO Widget] Failed to fetch article ${id}:`, error);
      }
    }
  }
  
  return results;
}