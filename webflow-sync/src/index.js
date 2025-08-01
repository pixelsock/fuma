/**
 * Charlotte UDO Content Bridge
 * A lightweight JavaScript widget that integrates Directus API content into Webflow sites
 */

import { fetchArticle } from './api-client.js';

(function() {
  'use strict';

  // Widget will be initialized when DOM is ready
  async function initializeWidget() {
    console.log('Charlotte UDO Content Bridge initialized');
    
    // TODO: Implement DOM scanner and content renderer
    // For now, the API client is available for use
  }

  // Early execution strategy - run before DOMContentLoaded if possible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWidget);
  } else {
    // DOM already loaded
    initializeWidget();
  }

})();