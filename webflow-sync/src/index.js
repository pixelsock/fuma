/**
 * Charlotte UDO Content Bridge
 * A lightweight JavaScript widget that integrates Directus API content into Webflow sites
 */

// Main widget functionality will be implemented in upcoming tasks
// For now, we create a basic structure to test the build system

(function() {
  'use strict';

  // Widget will be initialized when DOM is ready
  function initializeWidget() {
    console.log('Charlotte UDO Content Bridge initialized');
    // TODO: Implement API client, DOM scanner, and content renderer
  }

  // Early execution strategy - run before DOMContentLoaded if possible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWidget);
  } else {
    // DOM already loaded
    initializeWidget();
  }

})();