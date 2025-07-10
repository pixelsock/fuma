/**
 * Simple ProseMirror to Markdown converter that extracts text content
 * without requiring DOM or complex schema matching
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

    // Convert ProseMirror JSON to markdown
    const rawMarkdown = convertNode(content);
    
    // Post-process to handle indentation markers
    return postProcessIndentation(rawMarkdown);
  } catch (error) {
    console.error('Error converting ProseMirror to Markdown:', error);
    return '';
  }
}

function convertNode(node: any, depth = 0): string {
  if (!node || typeof node !== 'object') {
    return '';
  }

  let result = '';

  switch (node.type) {
    case 'doc':
      if (node.content && Array.isArray(node.content)) {
        result = node.content.map((n: any) => convertNode(n, depth)).join('\n\n').trim();
      }
      break;

    case 'paragraph':
      if (node.content && Array.isArray(node.content)) {
        const content = node.content.map((n: any) => convertNode(n, depth)).join('');
        
        // Check if this paragraph has indentation attributes from Directus
        const indent = node.attrs?.indent || 0;
        
        if (indent > 0) {
          // For indented content, we need to handle it carefully in MDX
          // Using HTML divs inline can cause parsing issues
          // Instead, we'll use a marker that can be post-processed
          result = `:::indent${indent}\n${content}\n:::`;
        } else {
          result = content;
        }
      }
      break;

    case 'heading':
      const level = node.attrs?.level || 1;
      const prefix = '#'.repeat(level) + ' ';
      if (node.content && Array.isArray(node.content)) {
        const headingText = node.content.map((n: any) => convertNode(n, depth)).join('');
        // Clean up heading text - remove all wrapping asterisks
        const cleanedText = headingText
          .replace(/^\*\*+/, '') // Remove leading asterisks
          .replace(/\*\*+$/, '') // Remove trailing asterisks
          .trim();
        result = prefix + cleanedText;
      }
      break;

    case 'text':
      result = node.text || '';
      // Apply marks if any
      if (node.marks && Array.isArray(node.marks)) {
        node.marks.forEach((mark: any) => {
          switch (mark.type) {
            case 'bold':
            case 'strong':
              // Clean up the text before applying bold
              result = result.trim();
              result = `**${result}**`;
              break;
            case 'italic':
            case 'em':
              result = `*${result}*`;
              break;
            case 'code':
              result = `\`${result}\``;
              break;
            case 'link':
              result = `[${result}](${mark.attrs?.href || '#'})`;
              break;
          }
        });
      }
      break;

    case 'hardBreak':
    case 'hard_break':
      result = '  \n';
      break;

    case 'blockquote':
      if (node.content && Array.isArray(node.content)) {
        const content = node.content.map((n: any) => convertNode(n, depth + 1)).join('\n');
        result = content.split('\n').map((line: string) => '> ' + line).join('\n');
      }
      break;

    case 'bulletList':
    case 'bullet_list':
      if (node.content && Array.isArray(node.content)) {
        result = node.content.map((n: any) => convertNode(n, depth + 1)).join('\n');
      }
      break;

    case 'orderedList':
    case 'ordered_list':
      if (node.content && Array.isArray(node.content)) {
        result = node.content.map((n: any, i: number) => {
          const content = convertNode(n, depth + 1);
          // Replace the "- " prefix with numbered prefix
          return content.replace(/^- /, `${i + 1}. `);
        }).join('\n');
      }
      break;

    case 'listItem':
    case 'list_item':
      if (node.content && Array.isArray(node.content)) {
        const content = node.content.map((n: any) => convertNode(n, depth)).join('\n');
        // Add proper indentation for nested content
        const lines = content.split('\n');
        result = lines.map((line: string, i: number) => {
          if (i === 0) return '- ' + line;
          return '  ' + line;
        }).join('\n');
      }
      break;

    case 'codeBlock':
    case 'code_block':
      const lang = node.attrs?.language || '';
      if (node.content && Array.isArray(node.content)) {
        const code = node.content.map((n: any) => n.text || '').join('');
        result = '```' + lang + '\n' + code + '\n```';
      }
      break;

    case 'horizontalRule':
    case 'horizontal_rule':
      result = '---';
      break;

    case 'image':
      let src = node.attrs?.src || '';
      const alt = node.attrs?.alt || '';
      const title = node.attrs?.title || '';
      
      // Convert Directus asset paths to full URLs
      if (src.startsWith('/assets/')) {
        const directusUrl = process.env.DIRECTUS_URL || 'https://udo-backend-y1w0.onrender.com';
        src = `${directusUrl}${src}`;
      }
      
      result = `![${alt}](${src}${title ? ` "${title}"` : ''})`;
      break;

    case 'table':
      if (node.content && Array.isArray(node.content)) {
        const rows: string[] = [];
        let headerRowIndex = -1;
        let maxColumns = 0;
        let skipFirstColumn = false;
        let skipLastColumn = false;
        
        // First, check if this is a UDO-style table with empty first/last columns
        // by looking for the pattern where we have N1-A through N1-F headers
        let isUDOTable = false;
        node.content.forEach((rowNode: any, index: number) => {
          if (rowNode.content && Array.isArray(rowNode.content)) {
            const cells = rowNode.content.map((cell: any) => convertNode(cell, depth).trim());
            // Check if this row contains the zoning district headers
            if (cells.some((cell: string) => cell.includes('N1-A') && cells.some((c: string) => c.includes('N1-F')))) {
              isUDOTable = true;
              // For UDO tables, we know the structure: empty, label, 6 districts, empty
              skipFirstColumn = true;
              skipLastColumn = true;
            }
          }
        });
        
        // Count actual columns
        node.content.forEach((rowNode: any, index: number) => {
          if (rowNode.content && Array.isArray(rowNode.content)) {
            maxColumns = Math.max(maxColumns, rowNode.content.length);
            
            // Check if this row contains header cells
            const hasHeaderCells = rowNode.content.some((cell: any) => 
              cell.type === 'tableHeader' || cell.type === 'table_header'
            );
            if (hasHeaderCells && headerRowIndex === -1) {
              headerRowIndex = index;
            }
          }
        });
        
        // Adjust maxColumns based on empty column detection
        const startCol = skipFirstColumn ? 1 : 0;
        const endCol = skipLastColumn ? -1 : undefined;
        if (skipFirstColumn || skipLastColumn) {
          maxColumns = maxColumns - (skipFirstColumn ? 1 : 0) - (skipLastColumn ? 1 : 0);
        }
        
        // Second pass: process rows and normalize column count
        node.content.forEach((rowNode: any, index: number) => {
          if (rowNode.content && Array.isArray(rowNode.content)) {
            // Extract cells based on column boundaries
            const allCells = rowNode.content;
            const relevantCells = skipLastColumn 
              ? allCells.slice(startCol, -1)
              : allCells.slice(startCol);
            
            const cells = relevantCells.slice(0, maxColumns).map((cell: any) => {
              const cellContent = convertNode(cell, depth).trim();
              // Clean up any bold formatting issues
              return cellContent
                .replace(/\*\*\s+/g, '**') // Remove spaces after opening **
                .replace(/\s+\*\*/g, '**') // Remove spaces before closing **
                .replace(/\*\*\*\*/g, '**'); // Replace double bold with single bold
            });
            
            // Skip rows that have only one cell spanning the full width (title rows)
            if (cells.length === 1 && maxColumns > 1 && cells[0].includes('Table')) {
              // This is likely a title row, skip it
              return;
            }
            
            // Pad rows with empty cells if needed (up to maxColumns)
            while (cells.length < maxColumns) {
              cells.push('');
            }
            
            const rowContent = '| ' + cells.join(' | ') + ' |';
            rows.push(rowContent);
          }
        });
        
        // Add separator after header row
        if (rows.length > 0 && maxColumns > 0) {
          const separatorIndex = headerRowIndex >= 0 ? headerRowIndex + 1 : 0;
          if (separatorIndex <= rows.length) {
            const separator = '|' + ' --- |'.repeat(maxColumns);
            rows.splice(separatorIndex, 0, separator);
          }
        }
        
        result = rows.join('\n');
      }
      break;

    case 'tableRow':
    case 'table_row':
      if (node.content && Array.isArray(node.content)) {
        result = '| ' + node.content.map((n: any) => convertNode(n, depth).trim()).join(' | ') + ' |';
      }
      break;

    case 'tableCell':
    case 'table_cell':
    case 'tableHeader':
    case 'table_header':
      if (node.content && Array.isArray(node.content)) {
        // Clean up cell content - remove newlines and extra spaces
        const cellContent = node.content.map((n: any) => convertNode(n, depth)).join('').trim();
        // Use self-closing br tags for MDX compatibility
        result = cellContent.replace(/\n/g, '<br />');
      }
      break;

    default:
      // For unknown node types, try to extract text content
      if (node.content && Array.isArray(node.content)) {
        result = node.content.map((n: any) => convertNode(n, depth)).join('');
      } else if (node.text) {
        result = node.text;
      }
  }

  return result;
}

/**
 * Post-process markdown to handle indentation markers
 * This converts our temporary markers into proper MDX-safe div elements
 */
function postProcessIndentation(markdown: string): string {
  const lines = markdown.split('\n');
  const processedLines: string[] = [];
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    const indentMatch = line.match(/^:::indent(\d+)$/);
    
    if (indentMatch) {
      const indentLevel = indentMatch[1];
      const contentLines: string[] = [];
      i++; // Move to content line
      
      // Collect all lines until we hit the closing marker
      while (i < lines.length && lines[i] !== ':::') {
        contentLines.push(lines[i]);
        i++;
      }
      
      // Add the indented content with proper MDX formatting
      if (contentLines.length > 0) {
        processedLines.push('');  // Empty line before div
        processedLines.push(`<div className="indent-block-${indentLevel}">`);
        processedLines.push('');  // Empty line after opening div
        processedLines.push(...contentLines);
        processedLines.push('');  // Empty line before closing div
        processedLines.push('</div>');
        processedLines.push('');  // Empty line after div
      }
      
      i++; // Skip the closing :::
    } else {
      processedLines.push(line);
      i++;
    }
  }
  
  // Clean up excessive empty lines
  return processedLines
    .join('\n')
    .replace(/\n{4,}/g, '\n\n\n')  // Replace 4+ newlines with 3
    .trim();
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