import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { IndentBlock } from '@/components/indent-block';
import React from 'react';

// Custom image component that renders all images as regular HTML img tags
function CustomImage(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  // Just render a regular img tag for all images
  // This bypasses any build-time image processing
  return <img {...props} />;
}

// Custom heading components to fix nested anchor issue
function createHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
  const Tag = `h${level}` as const;
  return function Heading(props: React.HTMLAttributes<HTMLHeadingElement>) {
    // Extract text content from children, avoiding nested links
    const extractText = (children: React.ReactNode): string => {
      if (typeof children === 'string') return children;
      if (typeof children === 'number') return String(children);
      if (React.isValidElement(children)) {
        if (children.type === 'a') {
          // If it's a link, extract its text content
          return extractText((children.props as any).children);
        }
        return extractText((children.props as any).children);
      }
      if (Array.isArray(children)) {
        return children.map(extractText).join('');
      }
      return '';
    };

    // Just render the heading with text content, no nested anchors
    const textContent = extractText(props.children);
    return <Tag {...props}>{textContent}</Tag>;
  };
}

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    img: CustomImage,
    h1: createHeading(1),
    h2: createHeading(2),
    h3: createHeading(3),
    h4: createHeading(4),
    h5: createHeading(5),
    h6: createHeading(6),
    // Allow raw HTML elements for when we need to bypass React
    dangerouslySetInnerHTML: ({ __html }: { __html: string }) => (
      <div dangerouslySetInnerHTML={{ __html }} />
    ),
    IndentBlock,
    ...components,
  };
}