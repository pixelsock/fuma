if (!Array.prototype.at) {
  Object.defineProperty(Array.prototype, 'at', {
    value: function(this: any[], index: number) {
      const len = this.length;
      const relativeIndex = Number(index);
      const k = relativeIndex >= 0 ? relativeIndex : len + relativeIndex;
      if (k < 0 || k >= len) {
        return undefined;
      }
      return this[k];
    },
    writable: true,
    configurable: true,
  });
}

import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { IndentBlock } from '@/components/indent-block';

// Custom image component that handles external images
function CustomImage(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  // Use regular img tag for external images
  if (typeof props.src === 'string' && props.src?.startsWith('http')) {
    return <img {...props} />;
  }
  
  // Use default MDX image component for local images
  const DefaultImage = defaultMdxComponents.img as React.ComponentType<any>;
  return <DefaultImage {...props} />;
}

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    img: CustomImage,
    IndentBlock,
    ...components,
  };
}
