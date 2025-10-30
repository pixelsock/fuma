#!/usr/bin/env tsx
/**
 * Script to convert Article 9 tables to the proper format
 * Based on the formatting applied to Table 9-1
 */

import * as fs from 'fs';
import * as path from 'path';
import { JSDOM } from 'jsdom';

const INPUT_FILE = path.join(process.cwd(), 'public', 'reformat.html');
const OUTPUT_FILE = path.join(process.cwd(), 'public', 'reformat-converted.html');

interface TableInfo {
  tableNumber: string;
  hasFootnotes: boolean;
}

function convertTable(tableWrapper: Element, dom: Document): void {
  const table = tableWrapper.querySelector('table.udo-table');
  if (!table) return;

  // Find title row in thead
  const titleRow = table.querySelector('thead tr.header-row');
  if (titleRow) {
    const titleCell = titleRow.querySelector('.table-title-row');
    if (titleCell && titleCell.tagName.toLowerCase() === 'td') {
      // Convert td to th
      const th = dom.createElement('th');
      th.className = titleCell.className;
      th.setAttribute('style', titleCell.getAttribute('style') || '');
      th.setAttribute('colspan', titleCell.getAttribute('colspan') || '1');
      th.setAttribute('scope', 'col');
      th.setAttribute('data-bg-color', titleCell.getAttribute('data-bg-color') || '1E4E79');
      th.setAttribute('data-align', titleCell.getAttribute('data-align') || 'center');
      th.setAttribute('data-colspan', titleCell.getAttribute('colspan') || '1');
      th.innerHTML = titleCell.innerHTML;
      
      titleCell.replaceWith(th);
    }
  }

  // Process tbody rows
  const tbody = table.querySelector('tbody');
  if (!tbody) return;

  const rows = Array.from(tbody.querySelectorAll('tr'));
  
  rows.forEach((row, index) => {
    const cells = Array.from(row.querySelectorAll('td, th'));
    
    cells.forEach((cell) => {
      const cellEl = cell as HTMLElement;
      const currentStyle = cellEl.getAttribute('style') || '';
      
      // Check if this is a header-like cell (contains only bold text or is first column with letter)
      const text = cellEl.textContent?.trim() || '';
      const isSectionHeader = /^[A-Z]$/.test(text) && cellEl.querySelector('strong');
      const isSubHeader = cellEl.querySelector('strong') && !cellEl.querySelector('sup');
      
      // Apply background colors based on patterns
      if (isSectionHeader) {
        // Section headers (A, B, C, etc.) - light blue background
        if (!currentStyle.includes('background-color: #ddeaf6')) {
          const newStyle = currentStyle + (currentStyle ? '; ' : '') + 'background-color: #ddeaf6;';
          cellEl.setAttribute('style', newStyle);
        }
        if (!cellEl.hasAttribute('data-align') && currentStyle.includes('text-align: center')) {
          cellEl.setAttribute('data-align', 'center');
        }
      } else if (text === '&nbsp;' || text === '') {
        // Empty cells - check context for appropriate background
        const prevCell = cells[cells.indexOf(cell) - 1] as HTMLElement;
        if (prevCell && prevCell.textContent?.trim().match(/^[A-Z]$/)) {
          // Empty cell next to section header - light blue
          if (!currentStyle.includes('background-color')) {
            const newStyle = currentStyle + (currentStyle ? '; ' : '') + 'background-color: #ddeaf6;';
            cellEl.setAttribute('style', newStyle);
          }
        } else if (currentStyle.includes('background-color: #d9d9d9') || cellEl.hasAttribute('data-bg-color')) {
          // Already has gray background - keep it
          if (!cellEl.hasAttribute('data-bg-color')) {
            cellEl.setAttribute('data-bg-color', 'D9D9D9');
          }
        }
      }
      
      // Convert inline footnote numbers to superscript
      let html = cellEl.innerHTML;
      
      // Pattern: <strong>1</strong> or <strong>2, 3</strong> at end of text (not in a sup already)
      html = html.replace(/<strong>(\d+(?:,\s*\d+)*)<\/strong>(?!<\/sup>)/g, (match, numbers) => {
        // Check if this is likely a footnote reference (appears after text, not standalone)
        const beforeMatch = html.substring(0, html.indexOf(match));
        const afterMatch = html.substring(html.indexOf(match) + match.length);
        
        // If it's at the end or followed by whitespace/closing tags, it's likely a footnote
        if (afterMatch.trim() === '' || afterMatch.match(/^\s*<\//) || beforeMatch.trim().length > 10) {
          return `<sup><strong>${numbers}</strong></sup>`;
        }
        return match;
      });
      
      // Also handle pattern: (feet) <strong>1</strong>
      html = html.replace(/\)\s*<strong>(\d+(?:,\s*\d+)*)<\/strong>/g, ') <sup><strong>$1</strong></sup>');
      
      cellEl.innerHTML = html;
      
      // Clean up double semicolons in style
      if (currentStyle.includes(';;')) {
        const cleanedStyle = currentStyle.replace(/;;+/g, ';');
        cellEl.setAttribute('style', cleanedStyle);
      }
      
      // Ensure data attributes are present
      if (cellEl.hasAttribute('colspan') && !cellEl.hasAttribute('data-colspan')) {
        cellEl.setAttribute('data-colspan', cellEl.getAttribute('colspan') || '1');
      }
      if (cellEl.hasAttribute('rowspan') && !cellEl.hasAttribute('data-rowspan')) {
        cellEl.setAttribute('data-rowspan', cellEl.getAttribute('rowspan') || '1');
      }
      if (currentStyle.includes('text-align: center') && !cellEl.hasAttribute('data-align')) {
        cellEl.setAttribute('data-align', 'center');
      }
      if (currentStyle.includes('background-color') && !cellEl.hasAttribute('data-bg-color')) {
        const bgMatch = currentStyle.match(/background-color:\s*#([0-9a-fA-F]{6})/);
        if (bgMatch) {
          cellEl.setAttribute('data-bg-color', bgMatch[1].toUpperCase());
        }
      }
    });
  });
}

function convertFootnoteTable(tableWrapper: Element, dom: Document): boolean {
  const table = tableWrapper.querySelector('table.udo-table');
  if (!table) return false;
  
  // Check if title row contains "Insert Title Row Text Here" - strong indicator of footnote table
  const titleCell = table.querySelector('.table-title-row');
  const hasPlaceholderTitle = titleCell?.textContent?.includes('Insert Title Row Text Here');
  
  const tbody = table.querySelector('tbody');
  if (!tbody) return false;
  
  const rows = Array.from(tbody.querySelectorAll('tr'));
  if (rows.length === 0) return false;
  
  // Check if this looks like a footnote table (has numbered rows in first column)
  const firstCell = rows[0]?.querySelector('td');
  const firstCellHTML = firstCell?.innerHTML || '';
  const firstText = firstCell?.textContent?.trim() || '';
  
  // Look for superscript numbers or plain numbers in first cell
  const hasSupNumber = firstCellHTML.includes('<sup>');
  const isPlainNumber = /^[\d]+$/.test(firstText);
  
  if (!hasPlaceholderTitle && !hasSupNumber && !isPlainNumber) {
    return false; // Not a footnote table
  }
  
  // Create footnote div structure
  const footnoteDiv = dom.createElement('div');
  footnoteDiv.className = 'footnote';
  
  rows.forEach(row => {
    const cells = Array.from(row.querySelectorAll('td'));
    if (cells.length >= 2) {
      const numberCell = cells[0] as HTMLElement;
      const contentCell = cells[1] as HTMLElement;
      
      const itemDiv = dom.createElement('div');
      
      // Extract footnote number (may already be in <sup> tags)
      let numberHTML = numberCell.innerHTML.trim();
      
      // If already has sup tags, use as is, otherwise wrap in sup
      if (numberHTML.includes('<sup>')) {
        // Extract just the number from the sup tag
        const match = numberHTML.match(/<sup>.*?(\d+).*?<\/sup>/);
        if (match) {
          itemDiv.innerHTML = `<sup>${match[1]}</sup> ${contentCell.innerHTML}`;
        } else {
          itemDiv.innerHTML = `${numberHTML} ${contentCell.innerHTML}`;
        }
      } else {
        // Plain number, wrap in sup
        const number = numberCell.textContent?.trim().replace(/<\/?strong>/g, '') || '';
        itemDiv.innerHTML = `<sup>${number}</sup> ${contentCell.innerHTML}`;
      }
      
      footnoteDiv.appendChild(itemDiv);
    }
  });
  
  // Replace the entire table with the footnote div
  table.remove();
  tableWrapper.appendChild(footnoteDiv);
  
  return true;
}

function processHTML(html: string): string {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  // Find all table wrappers
  const tableWrappers = Array.from(document.querySelectorAll('div.table-wrapper'));
  
  console.log(`Found ${tableWrappers.length} table wrappers`);
  
  let footnoteTablesConverted = 0;
  let mainTablesConverted = 0;
  
  for (let i = 0; i < tableWrappers.length; i++) {
    const wrapper = tableWrappers[i];
    const table = wrapper.querySelector('table.udo-table');
    
    if (!table) continue;
    
    // Check if this table itself is a footnote table
    const titleCell = table.querySelector('.table-title-row');
    const hasPlaceholderTitle = titleCell?.textContent?.includes('Insert Title Row Text Here');
    const firstCell = table.querySelector('tbody tr td');
    const firstCellHTML = firstCell?.innerHTML || '';
    const hasSupNumber = firstCellHTML.includes('<sup>');
    
    if (hasPlaceholderTitle || hasSupNumber) {
      // This is a footnote table
      const converted = convertFootnoteTable(wrapper, document);
      if (converted) {
        footnoteTablesConverted++;
      }
    } else {
      // This is a main table
      convertTable(wrapper, document);
      mainTablesConverted++;
    }
  }
  
  console.log(`Converted ${mainTablesConverted} main tables`);
  console.log(`Converted ${footnoteTablesConverted} footnote tables`);
  
  // Return the full HTML
  return dom.serialize();
}

async function main() {
  try {
    console.log('Reading input file:', INPUT_FILE);
    const html = fs.readFileSync(INPUT_FILE, 'utf-8');
    
    console.log('Processing HTML...');
    const converted = processHTML(html);
    
    console.log('Writing output file:', OUTPUT_FILE);
    fs.writeFileSync(OUTPUT_FILE, converted, 'utf-8');
    
    console.log('✅ Conversion complete!');
    console.log(`Output written to: ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('❌ Error during conversion:', error);
    process.exit(1);
  }
}

main();
