import { visit } from 'unist-util-visit';

/**
 * Remark plugin that skips processing for Directus-hosted images
 * by preserving their original URLs without any transformation
 */
export function remarkSkipDirectusImages() {
  return (tree) => {
    visit(tree, 'image', (node) => {
      // Check if the image URL is from Directus
      if (node.url && (
        node.url.includes('admin.charlotteudo.org/assets/') ||
        node.url.includes('udoclt.tofustack.com/assets/')
      )) {
        // Add a flag to skip processing
        node.data = node.data || {};
        node.data.skipProcessing = true;
        
        // Optionally, you can also ensure the URL is absolute
        if (!node.url.startsWith('http')) {
          node.url = `https://${node.url}`;
        }
      }
    });
  };
}