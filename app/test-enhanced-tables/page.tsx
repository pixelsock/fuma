'use client';

import React from 'react';
import { EnhancedTableSimple } from '@/components/enhanced-table-simple';

// Test HTML with various table styles and structures
const testTableHTML = `
<h2>Enhanced Table V2 Test Page</h2>
<p>This page tests the EnhancedTableV2 component with various table structures and features.</p>

<h3>Table 1: Basic Table with Title</h3>
<table>
  <caption>Employee Information</caption>
  <thead>
    <tr>
      <th style="background-color: #1E4E79; color: white;">Name</th>
      <th style="background-color: #1E4E79; color: white;">Department</th>
      <th style="background-color: #1E4E79; color: white;">Position</th>
      <th style="background-color: #1E4E79; color: white;">Start Date</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John Doe</td>
      <td style="color: #0066CC;">Engineering</td>
      <td>Senior Developer</td>
      <td>2020-01-15</td>
    </tr>
    <tr>
      <td>Jane Smith</td>
      <td style="color: #0066CC;">Marketing</td>
      <td>Marketing Manager</td>
      <td>2019-06-20</td>
    </tr>
    <tr>
      <td style="color: red;">Mike Johnson</td>
      <td style="color: #0066CC;">Sales</td>
      <td>Sales Representative</td>
      <td>2021-03-10</td>
    </tr>
  </tbody>
</table>

<h3>Table 2: Complex Table with Colspan</h3>
<table>
  <thead>
    <tr>
      <th colspan="2" style="background-color: #1E4E79; color: white; text-align: center;">Contact Information</th>
      <th colspan="2" style="background-color: #2E7D32; color: white; text-align: center;">Employment Details</th>
    </tr>
    <tr>
      <th style="background-color: #DEEAF6; color: #1F2937;">Name</th>
      <th style="background-color: #DEEAF6; color: #1F2937;">Email</th>
      <th style="background-color: #DEEAF6; color: #1F2937;">Department</th>
      <th style="background-color: #DEEAF6; color: #1F2937;">Position</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John Doe</td>
      <td>john.doe@company.com</td>
      <td style="color: #0066CC;">Engineering</td>
      <td>Senior Developer</td>
    </tr>
    <tr>
      <td>Jane Smith</td>
      <td>jane.smith@company.com</td>
      <td style="color: #0066CC;">Marketing</td>
      <td>Marketing Manager</td>
    </tr>
    <tr>
      <td colspan="2" style="background-color: #FFF3E0; color: #F57C00; text-align: center; font-weight: bold;">Summary</td>
      <td style="background-color: #FFF3E0;">2 Departments</td>
      <td style="background-color: #FFF3E0;">2 Positions</td>
    </tr>
  </tbody>
</table>

<h3>Table 3: UDO-Style Table</h3>
<table>
  <thead>
    <tr>
      <th colspan="5" style="background-color: #1E4E79; color: white; padding: 10px; text-align: center;">Table 4-1: Neighborhood 1 Zoning Districts Lot Standards</th>
    </tr>
    <tr style="background-color: #DEEAF6;">
      <th style="padding: 8px; border: 1px solid #ddd;">District</th>
      <th style="padding: 8px; border: 1px solid #ddd;">Min Lot Size</th>
      <th style="padding: 8px; border: 1px solid #ddd;">Max Height</th>
      <th style="padding: 8px; border: 1px solid #ddd;">Front Setback</th>
      <th style="padding: 8px; border: 1px solid #ddd;">Side Setback</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">N1-A</td>
      <td style="padding: 8px; border: 1px solid #ddd;">8,000 sq ft</td>
      <td style="padding: 8px; border: 1px solid #ddd;">35 ft</td>
      <td style="padding: 8px; border: 1px solid #ddd;">27 ft</td>
      <td style="padding: 8px; border: 1px solid #ddd;">5 ft</td>
    </tr>
    <tr style="background-color: #f9f9f9;">
      <td style="padding: 8px; border: 1px solid #ddd;">N1-B</td>
      <td style="padding: 8px; border: 1px solid #ddd;">6,000 sq ft</td>
      <td style="padding: 8px; border: 1px solid #ddd;">35 ft</td>
      <td style="padding: 8px; border: 1px solid #ddd;">27 ft</td>
      <td style="padding: 8px; border: 1px solid #ddd;">5 ft</td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">N1-C</td>
      <td style="padding: 8px; border: 1px solid #ddd;">5,000 sq ft</td>
      <td style="padding: 8px; border: 1px solid #ddd;">40 ft</td>
      <td style="padding: 8px; border: 1px solid #ddd;">17 ft</td>
      <td style="padding: 8px; border: 1px solid #ddd;">5 ft</td>
    </tr>
  </tbody>
</table>

<p>Note: This table demonstrates the UDO-style formatting with proper headers and data rows.</p>

<h3>Table 4: Wide Table for Horizontal Scrolling Test</h3>
<table>
  <thead>
    <tr>
      <th style="background-color: #1E4E79; color: white;">Column 1</th>
      <th style="background-color: #1E4E79; color: white;">Column 2</th>
      <th style="background-color: #1E4E79; color: white;">Column 3</th>
      <th style="background-color: #1E4E79; color: white;">Column 4</th>
      <th style="background-color: #1E4E79; color: white;">Column 5</th>
      <th style="background-color: #1E4E79; color: white;">Column 6</th>
      <th style="background-color: #1E4E79; color: white;">Column 7</th>
      <th style="background-color: #1E4E79; color: white;">Column 8</th>
      <th style="background-color: #1E4E79; color: white;">Column 9</th>
      <th style="background-color: #1E4E79; color: white;">Column 10</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data 1-1</td>
      <td>Data 1-2</td>
      <td>Data 1-3</td>
      <td>Data 1-4</td>
      <td>Data 1-5</td>
      <td>Data 1-6</td>
      <td>Data 1-7</td>
      <td>Data 1-8</td>
      <td>Data 1-9</td>
      <td>Data 1-10</td>
    </tr>
    <tr>
      <td>Data 2-1</td>
      <td>Data 2-2</td>
      <td>Data 2-3</td>
      <td>Data 2-4</td>
      <td>Data 2-5</td>
      <td>Data 2-6</td>
      <td>Data 2-7</td>
      <td>Data 2-8</td>
      <td>Data 2-9</td>
      <td>Data 2-10</td>
    </tr>
  </tbody>
</table>

<p>This wide table should trigger horizontal scrolling controls.</p>
`;

export default function TestEnhancedTablesPage() {
  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Enhanced Table V2 Test</h1>
      
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Enhanced Table V2 Features:</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Automatic table detection and enhancement</li>
          <li>Column resizing (drag column borders)</li>
          <li>Horizontal scrolling with controls</li>
          <li>Fullscreen mode</li>
          <li>Title extraction from captions or headings</li>
          <li>Footnote extraction and display</li>
          <li>Preserved text and background colors from HTML</li>
          <li>Responsive design</li>
          <li>Clean border styling</li>
        </ul>
      </div>

      <EnhancedTableSimple 
        html={testTableHTML}
        title="Test Tables"
      />
      
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Testing Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>Check if tables are automatically enhanced with the toolbar</li>
          <li>Try resizing columns by dragging the column borders</li>
          <li>Test horizontal scrolling on the wide table</li>
          <li>Try the fullscreen mode button</li>
          <li>Verify that colors and styling are preserved</li>
          <li>Check that titles are extracted and displayed prominently</li>
        </ol>
      </div>
    </div>
  );
}
