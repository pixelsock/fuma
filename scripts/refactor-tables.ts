/**
 * Script to refactor basic HTML tables to UDO format
 * Adds proper classes, attributes, colgroup, and wrapper divs
 */

import * as fs from 'fs';
import * as path from 'path';
import { JSDOM } from 'jsdom';

const inputFile = path.join(process.cwd(), 'public/reformat.html');
const outputFile = path.join(process.cwd(), 'public/reformat-output.html');

// Read the HTML file
const html = fs.readFileSync(inputFile, 'utf-8');

// Parse with JSDOM
const dom = new JSDOM(html);
const document = dom.window.document;

// Find all tables
const tables = document.querySelectorAll('table');

console.log(`Found ${tables.length} tables to refactor`);

tables.forEach((table, index) => {
  console.log(`\nProcessing table ${index + 1}...`);
  
  // Add table classes and attributes
  table.setAttribute('class', 'udo-table');
  table.setAttribute('border', '1');
  table.setAttribute('data-table-structured', 'true');
  table.setAttribute('data-ag-enable-search', 'false');
  table.setAttribute('data-table-type', 'tinymce');
  table.setAttribute('tabindex', '-1');
  
  // Calculate column count from first data row (skip title row)
  const rows = table.querySelectorAll('tr');
  let columnCount = 0;
  let firstDataRow: Element | null = null;
  
  for (const row of Array.from(rows)) {
    const cells = row.querySelectorAll('td, th');
    if (cells.length > 0 && !cells[0].classList.contains('table-title-row')) {
      let count = 0;
      cells.forEach(cell => {
        const colspan = parseInt(cell.getAttribute('colspan') || '1');
        count += colspan;
      });
      if (count > columnCount) {
        columnCount = count;
        firstDataRow = row;
      }
    }
  }
  
  console.log(`  Column count: ${columnCount}`);
  
  // Create colgroup with equal widths
  const baseWidth = 200; // Base width per column
  const totalWidth = baseWidth * columnCount;
  
  let colgroup = table.querySelector('colgroup');
  if (!colgroup) {
    colgroup = document.createElement('colgroup');
    table.insertBefore(colgroup, table.firstChild);
  } else {
    colgroup.innerHTML = '';
  }
  
  for (let i = 0; i < columnCount; i++) {
    const col = document.createElement('col');
    col.setAttribute('style', `width: ${baseWidth}px;`);
    colgroup.appendChild(col);
  }
  
  // Set table style
  table.setAttribute('style', 
    `width: ${totalWidth}px; border-collapse: collapse; vertical-align: middle; min-width: 100%;`
  );
  
  // Ensure thead exists
  let thead = table.querySelector('thead');
  if (!thead) {
    thead = document.createElement('thead');
    const tbody = table.querySelector('tbody');
    if (tbody && tbody.previousElementSibling) {
      table.insertBefore(thead, tbody);
    } else {
      table.insertBefore(thead, table.firstChild);
    }
  }
  
  // Process title row - find row with table-title-row class
  const titleCell = table.querySelector('.table-title-row');
  if (titleCell) {
    const titleRow = titleCell.parentElement;
    if (titleRow) {
      // Add header-row class to title row
      titleRow.setAttribute('class', 'header-row');
      
      // Ensure title cell has proper attributes
      titleCell.setAttribute('scope', 'col');
      if (!titleCell.hasAttribute('data-bg-color')) {
        titleCell.setAttribute('data-bg-color', '1E4E79');
      }
      if (!titleCell.hasAttribute('data-align')) {
        titleCell.setAttribute('data-align', 'center');
      }
      
      // Ensure colspan matches column count
      titleCell.setAttribute('colspan', String(columnCount));
      titleCell.setAttribute('data-colspan', String(columnCount));
      
      // Move title row to thead if not already there
      if (titleRow.parentElement !== thead) {
        thead.insertBefore(titleRow, thead.firstChild);
      }
    }
  }
  
  // Wrap table in div.table-wrapper if not already wrapped
  if (!table.parentElement?.classList.contains('table-wrapper')) {
    const wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'table-wrapper');
    table.parentNode?.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  }
  
  console.log(`  ✓ Table ${index + 1} refactored`);
});

// Write output
const output = dom.serialize();
fs.writeFileSync(outputFile, output, 'utf-8');

console.log(`\n✅ Refactored ${tables.length} tables`);
console.log(`📄 Output written to: ${outputFile}`);
