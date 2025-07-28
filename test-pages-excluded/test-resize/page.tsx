'use client';

import React from 'react';
import { UDOContentWithAgGrid } from '@/components/udo-content-with-aggrid';

// Test HTML with various table styles and colors
const testTableHTML = `
<h2>Test Table with Column Resize</h2>
<p>This page tests the column resize functionality and color preservation.</p>

<h3>Table 1: Basic Table with Colored Headers</h3>
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

<h3>Table 2: Complex Table with Multiple Colors</h3>
<table>
  <thead>
    <tr>
      <th colspan="2" style="background-color: #DEEAF6; color: #1F2937;">Product Information</th>
      <th colspan="2" style="background-color: #DEEAF6; color: #1F2937;">Sales Data</th>
    </tr>
    <tr>
      <th>Product Name</th>
      <th>Category</th>
      <th>Q1 Sales</th>
      <th>Q2 Sales</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="color: #008000; font-weight: bold;">Widget A</td>
      <td>Electronics</td>
      <td style="color: #FF0000;">$12,500</td>
      <td style="color: #008000;">$15,200</td>
    </tr>
    <tr>
      <td style="color: #008000; font-weight: bold;">Widget B</td>
      <td>Home & Garden</td>
      <td style="color: #008000;">$8,900</td>
      <td style="color: #008000;">$9,400</td>
    </tr>
    <tr>
      <td style="color: #008000; font-weight: bold;">Widget C</td>
      <td>Sports</td>
      <td style="color: #FF0000;">$6,200</td>
      <td style="color: #FF0000;">$5,800</td>
    </tr>
  </tbody>
</table>

<h3>Table 3: Table with Background Colors</h3>
<table>
  <thead>
    <tr>
      <th>Status</th>
      <th>Count</th>
      <th>Percentage</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background-color: #E8F5E9;">
      <td style="color: #2E7D32;">Completed</td>
      <td>45</td>
      <td>75%</td>
    </tr>
    <tr style="background-color: #FFF3E0;">
      <td style="color: #F57C00;">In Progress</td>
      <td>10</td>
      <td>16.7%</td>
    </tr>
    <tr style="background-color: #FFEBEE;">
      <td style="color: #C62828;">Pending</td>
      <td>5</td>
      <td>8.3%</td>
    </tr>
  </tbody>
</table>

<p>Try dragging the column borders to resize them. The column widths will be saved and restored when you refresh the page.</p>
`;

export default function TestResizePage() {
  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Table Column Resize Test</h1>
      
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Instructions:</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Hover over the right edge of any table header (except the last column)</li>
          <li>Click and drag to resize the column</li>
          <li>Column widths are automatically saved to localStorage</li>
          <li>Click "Reset column widths" to restore default widths</li>
          <li>Notice how text colors and background colors are preserved</li>
        </ul>
      </div>

      <UDOContentWithAgGrid 
        htmlContent={testTableHTML}
      />
      
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Color Preservation Test:</h3>
        <p className="text-sm">
          The tables above demonstrate various color styles that should be preserved:
        </p>
        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
          <li>Blue headers with white text (#1E4E79 background)</li>
          <li>Light blue subheaders (#DEEAF6 background)</li>
          <li>Colored text in cells (red, green, blue)</li>
          <li>Row background colors (light green, orange, red)</li>
        </ul>
      </div>
    </div>
  );
}