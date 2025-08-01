# Spec Summary (Lite)

Implement the foundational JavaScript widget that fetches article content from the Directus API at admin.charlotteudo.org and renders it into Webflow DOM elements marked with data-article-id attributes. The widget must execute early to prevent content flash, handle API errors gracefully, and work as a simple script tag inclusion without requiring backend infrastructure.