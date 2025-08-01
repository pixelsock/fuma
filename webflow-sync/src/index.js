/**
 * Charlotte UDO Content Bridge
 * A lightweight JavaScript widget that integrates Directus API content into Webflow sites
 */

import { fetchArticle } from './api-client.js';
import { scanForArticles } from './dom-scanner.js';

(function() {
  'use strict';

  // Widget will be initialized when DOM is ready
  async function initializeWidget() {
    console.log('Charlotte UDO Content Bridge initialized');
    
    // Scan DOM for article elements
    const articleMap = scanForArticles();
    
    if (articleMap.size === 0) {
      console.log('No article elements found');
      return;
    }
    
    console.log(`Found ${articleMap.size} unique article(s) to load`);
    
    // TODO: Implement content renderer
    // For now, we have the API client and DOM scanner ready
  }

  // Early execution strategy - run before DOMContentLoaded if possible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWidget);
  } else {
    // DOM already loaded
    initializeWidget();
  }

})();