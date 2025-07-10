import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';
import type { Plugin } from 'unified';

/**
 * Remark plugin to extract TOC from HTML headings in MDX
 */
export const remarkHtmlHeadings: Plugin<[], Root> = () => {
  return (tree, file) => {
    const toc: any[] = [];
    
    visit(tree, (node: any) => {
      // Check if it's an MDX JSX element
      if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
        const tagName = node.name;
        
        // Check if it's a heading element (h1-h6)
        if (/^h[1-6]$/.test(tagName)) {
          const depth = parseInt(tagName.charAt(1));
          
          // Extract text content from the heading
          let text = '';
          const extractText = (node: any): string => {
            if (node.type === 'text') {
              return node.value;
            }
            if (node.children) {
              return node.children.map(extractText).join('');
            }
            return '';
          };
          
          text = extractText(node);
          
          // Extract id from attributes if present
          let id = '';
          if (node.attributes) {
            const idAttr = node.attributes.find((attr: any) => attr.name === 'id');
            if (idAttr) {
              id = idAttr.value;
            }
          }
          
          // If no id, generate one from text
          if (!id && text) {
            id = text
              .toLowerCase()
              .replace(/[^a-z0-9\s]/g, '')
              .replace(/\s+/g, '-')
              .trim();
          }
          
          if (text && id) {
            toc.push({
              depth,
              value: text.trim(),
              id,
              children: []
            });
          }
        }
      }
    });
    
    // Build nested structure
    const tocTree: any[] = [];
    const stack: any[] = [];
    
    for (const heading of toc) {
      while (stack.length > 0 && stack[stack.length - 1].depth >= heading.depth) {
        stack.pop();
      }
      
      if (stack.length === 0) {
        tocTree.push(heading);
      } else {
        stack[stack.length - 1].children.push(heading);
      }
      
      stack.push(heading);
    }
    
    // Store TOC in file data for later use
    if (!file.data) file.data = {};
    (file.data as any).toc = tocTree;
  };
};