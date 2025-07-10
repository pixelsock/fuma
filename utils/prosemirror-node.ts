import { Node as ProseMirrorNode, Schema } from 'prosemirror-model';

// Define a basic schema for ProseMirror content
const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: {
      content: 'inline*',
      group: 'block',
      parseDOM: [{ tag: 'p' }],
      toDOM() { return ['p', 0]; }
    },
    text: {
      group: 'inline',
    },
    hard_break: {
      inline: true,
      group: 'inline',
      selectable: false,
      parseDOM: [{ tag: 'br' }],
      toDOM() { return ['br']; }
    },
    hardBreak: {
      inline: true,
      group: 'inline',
      selectable: false,
      parseDOM: [{ tag: 'br' }],
      toDOM() { return ['br']; }
    },
    heading: {
      attrs: { level: { default: 1 } },
      content: 'inline*',
      group: 'block',
      defining: true,
      parseDOM: [
        { tag: 'h1', attrs: { level: 1 } },
        { tag: 'h2', attrs: { level: 2 } },
        { tag: 'h3', attrs: { level: 3 } },
        { tag: 'h4', attrs: { level: 4 } },
        { tag: 'h5', attrs: { level: 5 } },
        { tag: 'h6', attrs: { level: 6 } }
      ],
      toDOM(node: any) { return [`h${node.attrs.level}`, 0]; }
    },
    blockquote: {
      content: 'block+',
      group: 'block',
      parseDOM: [{ tag: 'blockquote' }],
      toDOM() { return ['blockquote', 0]; }
    },
    ordered_list: {
      content: 'list_item+',
      group: 'block',
      attrs: { order: { default: 1 } },
      parseDOM: [{ tag: 'ol', getAttrs: (dom: any) => ({ order: dom.hasAttribute('start') ? +dom.getAttribute('start') : 1 }) }],
      toDOM(node: any) {
        return node.attrs.order === 1 ? ['ol', 0] : ['ol', { start: node.attrs.order }, 0];
      }
    },
    bullet_list: {
      content: 'list_item+',
      group: 'block',
      parseDOM: [{ tag: 'ul' }],
      toDOM() { return ['ul', 0]; }
    },
    list_item: {
      content: 'paragraph block*',
      parseDOM: [{ tag: 'li' }],
      toDOM() { return ['li', 0]; }
    },
    code_block: {
      content: 'text*',
      group: 'block',
      code: true,
      defining: true,
      parseDOM: [{ tag: 'pre', preserveWhitespace: 'full' }],
      toDOM() { return ['pre', ['code', 0]]; }
    },
    horizontal_rule: {
      group: 'block',
      parseDOM: [{ tag: 'hr' }],
      toDOM() { return ['hr']; }
    },
  },
  marks: {
    strong: {
      parseDOM: [
        { tag: 'strong' },
        { tag: 'b' },
        { style: 'font-weight', getAttrs: (value: any) => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null }
      ],
      toDOM() { return ['strong']; }
    },
    bold: {
      parseDOM: [
        { tag: 'strong' },
        { tag: 'b' },
        { style: 'font-weight', getAttrs: (value: any) => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null }
      ],
      toDOM() { return ['strong']; }
    },
    em: {
      parseDOM: [{ tag: 'i' }, { tag: 'em' }, { style: 'font-style=italic' }],
      toDOM() { return ['em']; }
    },
    code: {
      parseDOM: [{ tag: 'code' }],
      toDOM() { return ['code']; }
    },
    link: {
      attrs: {
        href: {},
        title: { default: null }
      },
      inclusive: false,
      parseDOM: [{
        tag: 'a[href]',
        getAttrs(dom: any) {
          return { href: dom.getAttribute('href'), title: dom.getAttribute('title') };
        }
      }],
      toDOM(node: any) {
        const { href, title } = node.attrs;
        return ['a', { href, title }, 0];
      }
    }
  }
});

/**
 * Convert ProseMirror JSON to Markdown without requiring DOM
 */
export function proseMirrorToMarkdown(content: any): string {
  try {
    if (!content) {
      return '';
    }

    // If content is already a string, return it
    if (typeof content === 'string') {
      return content;
    }

    // Create ProseMirror node from JSON
    const doc = schema.nodeFromJSON(content);
    
    // Convert to markdown
    return nodeToMarkdown(doc);
  } catch (error) {
    console.error('Error converting ProseMirror to Markdown:', error);
    return '';
  }
}

/**
 * Convert a ProseMirror node to Markdown
 */
function nodeToMarkdown(node: ProseMirrorNode, inlineContent = false): string {
  let markdown = '';

  switch (node.type.name) {
    case 'doc':
      node.forEach((child) => {
        markdown += nodeToMarkdown(child) + '\n\n';
      });
      return markdown.trim();

    case 'paragraph':
      node.forEach((child) => {
        markdown += nodeToMarkdown(child, true);
      });
      return markdown;

    case 'heading':
      const level = node.attrs.level;
      const prefix = '#'.repeat(level) + ' ';
      node.forEach((child) => {
        markdown += nodeToMarkdown(child, true);
      });
      return prefix + markdown;

    case 'text':
      let text = node.text || '';
      // Apply marks
      node.marks.forEach((mark) => {
        switch (mark.type.name) {
          case 'strong':
          case 'bold':
            text = `**${text}**`;
            break;
          case 'em':
            text = `*${text}*`;
            break;
          case 'code':
            text = `\`${text}\``;
            break;
          case 'link':
            text = `[${text}](${mark.attrs.href}${mark.attrs.title ? ` "${mark.attrs.title}"` : ''})`;
            break;
        }
      });
      return text;

    case 'hard_break':
    case 'hardBreak':
      return inlineContent ? '  \n' : '\n';

    case 'blockquote':
      let quoteContent = '';
      node.forEach((child) => {
        const childMd = nodeToMarkdown(child);
        quoteContent += childMd.split('\n').map(line => '> ' + line).join('\n') + '\n\n';
      });
      return quoteContent.trim();

    case 'ordered_list':
      let olContent = '';
      let olIndex = node.attrs.order || 1;
      node.forEach((child) => {
        olContent += `${olIndex}. ${nodeToMarkdown(child)}\n`;
        olIndex++;
      });
      return olContent.trim();

    case 'bullet_list':
      let ulContent = '';
      node.forEach((child) => {
        ulContent += `- ${nodeToMarkdown(child)}\n`;
      });
      return ulContent.trim();

    case 'list_item':
      let liContent = '';
      node.forEach((child, _, i) => {
        const childMd = nodeToMarkdown(child);
        if (i === 0) {
          liContent += childMd;
        } else {
          liContent += '\n   ' + childMd.split('\n').join('\n   ');
        }
      });
      return liContent;

    case 'code_block':
      return '```\n' + (node.textContent || '') + '\n```';

    case 'horizontal_rule':
      return '---';

    default:
      // For unknown node types, just get text content
      return node.textContent || '';
  }
}

/**
 * Convert markdown to MDX with frontmatter
 */
export function markdownToMdx(
  markdown: string,
  options?: {
    addFrontmatter?: Record<string, any>;
  }
): string {
  let mdx = '';

  // Add frontmatter if provided
  if (options?.addFrontmatter) {
    mdx += '---\n';
    for (const [key, value] of Object.entries(options.addFrontmatter)) {
      if (value !== undefined && value !== null) {
        mdx += `${key}: ${JSON.stringify(value)}\n`;
      }
    }
    mdx += '---\n\n';
  }

  // Add the markdown content
  mdx += markdown;

  return mdx;
}