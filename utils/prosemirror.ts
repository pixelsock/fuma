import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';

/**
 * Converts ProseMirror JSON content to Markdown string
 * This function uses Tiptap's markdown extension to properly convert
 * ProseMirror document structure to clean Markdown
 */
export function proseMirrorToMarkdown(proseMirrorContent: any): string {
  if (!proseMirrorContent) {
    return '';
  }

  try {
    // Create a temporary Tiptap editor instance with Markdown support
    const editor = new Editor({
      extensions: [
        StarterKit,
        Markdown.configure({
          html: true, // Allow HTML in markdown for rich content
          tightLists: true, // More compact list rendering
          bulletListMarker: '-', // Use dashes for bullets
          breaks: false, // Don't convert line breaks to <br>
          linkify: false, // Don't auto-convert URLs to links
        }),
      ],
      // Skip element creation for server-side rendering
    });

    // Set the ProseMirror content
    editor.commands.setContent(proseMirrorContent);
    
    // Extract markdown from the editor
    const markdown = editor.storage.markdown.getMarkdown();
    
    // Clean up the editor instance
    editor.destroy();
    
    return markdown;
  } catch (error) {
    console.error('Error converting ProseMirror to Markdown:', error);
    return '';
  }
}

/**
 * Legacy function name for backward compatibility
 * @deprecated Use proseMirrorToMarkdown instead
 */
export function proseMirrorToHtml(proseMirrorContent: any): string {
  console.warn('proseMirrorToHtml is deprecated. Use proseMirrorToMarkdown instead.');
  return proseMirrorToMarkdown(proseMirrorContent);
}

/**
 * Converts ProseMirror content to Markdown with additional sanitization
 * This is useful when you want extra safety for user-generated content
 */
export function proseMirrorToSafeMarkdown(proseMirrorContent: any): string {
  const markdown = proseMirrorToMarkdown(proseMirrorContent);
  
  // Basic markdown sanitization - remove potentially dangerous patterns
  return markdown
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // Remove iframe tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
}

/**
 * Converts markdown content to be compatible with FumaDocs/MDX
 * Handles special MDX syntax and components if needed
 */
export function markdownToMdx(markdown: string, options?: {
  wrapInComponents?: boolean;
  addFrontmatter?: { [key: string]: any };
}): string {
  let mdx = markdown;
  
  // Add frontmatter if provided
  if (options?.addFrontmatter) {
    const frontmatter = Object.entries(options.addFrontmatter)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join('\n');
    mdx = `---\n${frontmatter}\n---\n\n${mdx}`;
  }
  
  // Wrap in MDX components if requested
  if (options?.wrapInComponents) {
    mdx = `import { MDXComponents } from '@/mdx-components'\n\n${mdx}`;
  }
  
  return mdx;
}
