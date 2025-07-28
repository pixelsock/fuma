'use client';

import React, { Suspense } from 'react';
import { UDOContentWithAgGrid } from '@/components/udo-content-with-aggrid';

// Test HTML with various table styles and colors
const testTableHTML = `
<h2>Test AG-Grid Table Integration</h2>
<p>This page tests the AG-Grid integration for rendering HTML tables with column resize and color preservation.</p>

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
      <th style="background-color: #DEEAF6; color: #1F2937;">Product Name</th>
      <th style="background-color: #DEEAF6; color: #1F2937;">Category</th>
      <th style="background-color: #DEEAF6; color: #1F2937;">Q1 Sales</th>
      <th style="background-color: #DEEAF6; color: #1F2937;">Q2 Sales</th>
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
    <tr>
      <td style="color: #2E7D32; background-color: #E8F5E9;">Completed</td>
      <td style="background-color: #E8F5E9;">45</td>
      <td style="background-color: #E8F5E9;">75%</td>
    </tr>
    <tr>
      <td style="color: #F57C00; background-color: #FFF3E0;">In Progress</td>
      <td style="background-color: #FFF3E0;">10</td>
      <td style="background-color: #FFF3E0;">16.7%</td>
    </tr>
    <tr>
      <td style="color: #C62828; background-color: #FFEBEE;">Pending</td>
      <td style="background-color: #FFEBEE;">5</td>
      <td style="background-color: #FFEBEE;">8.3%</td>
    </tr>
  </tbody>
</table>

<h3>Table 4: Table with Colspan</h3>
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

<h3>Table 5: Complex Colspan Example</h3>
<table>
  <thead>
    <tr>
      <th rowspan="2" style="background-color: #1E4E79; color: white;">Product</th>
      <th colspan="3" style="background-color: #2E7D32; color: white; text-align: center;">Q1 2024</th>
      <th colspan="3" style="background-color: #7B1FA2; color: white; text-align: center;">Q2 2024</th>
    </tr>
    <tr>
      <th style="background-color: #DEEAF6; color: #1F2937;">Jan</th>
      <th style="background-color: #DEEAF6; color: #1F2937;">Feb</th>
      <th style="background-color: #DEEAF6; color: #1F2937;">Mar</th>
      <th style="background-color: #DEEAF6; color: #1F2937;">Apr</th>
      <th style="background-color: #DEEAF6; color: #1F2937;">May</th>
      <th style="background-color: #DEEAF6; color: #1F2937;">Jun</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="color: #008000; font-weight: bold;">Widget A</td>
      <td style="color: #008000;">$4,200</td>
      <td style="color: #008000;">$4,100</td>
      <td style="color: #008000;">$4,200</td>
      <td style="color: #008000;">$5,100</td>
      <td style="color: #008000;">$5,000</td>
      <td style="color: #008000;">$5,100</td>
    </tr>
    <tr>
      <td style="color: #008000; font-weight: bold;">Widget B</td>
      <td style="color: #FF0000;">$2,800</td>
      <td style="color: #FF0000;">$2,900</td>
      <td style="color: #008000;">$3,200</td>
      <td style="color: #008000;">$3,100</td>
      <td style="color: #008000;">$3,200</td>
      <td style="color: #008000;">$3,100</td>
    </tr>
    <tr>
      <td colspan="7" style="background-color: #E3F2FD; color: #1565C0; text-align: center; font-weight: bold;">Total: $54,200</td>
    </tr>
  </tbody>
</table>

<h3>Table 6: Full Column Groups Example</h3>
<table>
  <thead>
    <tr>
      <th rowspan="3" style="background-color: #1E4E79; color: white; vertical-align: middle;">Employee</th>
      <th colspan="6" style="background-color: #2E7D32; color: white; text-align: center;">Performance Data</th>
      <th colspan="3" style="background-color: #7B1FA2; color: white; text-align: center;">Benefits</th>
    </tr>
    <tr>
      <th colspan="3" style="background-color: #66BB6A; color: white; text-align: center;">Sales (2023)</th>
      <th colspan="3" style="background-color: #81C784; color: white; text-align: center;">Sales (2024)</th>
      <th colspan="2" style="background-color: #BA68C8; color: white; text-align: center;">Health</th>
      <th rowspan="2" style="background-color: #CE93D8; color: white; vertical-align: middle;">Vacation</th>
    </tr>
    <tr>
      <th style="background-color: #DEEAF6; color: #1F2937;">Q1</th>
      <th style="background-color: #DEEAF6; color: #1F2937;">Q2</th>
      <th style="background-color: #DEEAF6; color: #1F2937;">Total</th>
      <th style="background-color: #DEEAF6; color: #1F2937;">Q1</th>
      <th style="background-color: #DEEAF6; color: #1F2937;">Q2</th>
      <th style="background-color: #DEEAF6; color: #1F2937;">Total</th>
      <th style="background-color: #DEEAF6; color: #1F2937;">Plan</th>
      <th style="background-color: #DEEAF6; color: #1F2937;">Premium</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="color: #008000; font-weight: bold;">John Smith</td>
      <td style="color: #008000;">$45,000</td>
      <td style="color: #008000;">$52,000</td>
      <td style="color: #008000; font-weight: bold;">$97,000</td>
      <td style="color: #008000;">$48,000</td>
      <td style="color: #008000;">$55,000</td>
      <td style="color: #008000; font-weight: bold;">$103,000</td>
      <td>Basic</td>
      <td style="color: #FF6B35;">$250</td>
      <td style="color: #2E7D32;">25 days</td>
    </tr>
    <tr>
      <td style="color: #008000; font-weight: bold;">Sarah Johnson</td>
      <td style="color: #008000;">$38,000</td>
      <td style="color: #008000;">$42,000</td>
      <td style="color: #008000; font-weight: bold;">$80,000</td>
      <td style="color: #008000;">$41,000</td>
      <td style="color: #008000;">$46,000</td>
      <td style="color: #008000; font-weight: bold;">$87,000</td>
      <td>Premium</td>
      <td style="color: #FF6B35;">$450</td>
      <td style="color: #2E7D32;">30 days</td>
    </tr>
    <tr>
      <td style="color: #008000; font-weight: bold;">Mike Davis</td>
      <td style="color: #FF0000;">$32,000</td>
      <td style="color: #FF0000;">$35,000</td>
      <td style="color: #FF0000; font-weight: bold;">$67,000</td>
      <td style="color: #008000;">$39,000</td>
      <td style="color: #008000;">$44,000</td>
      <td style="color: #008000; font-weight: bold;">$83,000</td>
      <td>Basic</td>
      <td style="color: #FF6B35;">$250</td>
      <td style="color: #2E7D32;">20 days</td>
    </tr>
    <tr>
      <td colspan="10" style="background-color: #E3F2FD; color: #1565C0; text-align: center; font-weight: bold; padding: 12px;">
        Department Total: $267,000 (2023) → $273,000 (2024) | Growth: +2.2%
      </td>
    </tr>
  </tbody>
</table>

<h3>Table 7: Advanced Column Groups Features</h3>
<table>
  <thead>
    <tr>
      <th colspan="4" style="background-color: #1E4E79; color: white; text-align: center;">Team Overview</th>
      <th colspan="6" style="background-color: #2E7D32; color: white; text-align: center;">Detailed Metrics (Expandable)</th>
    </tr>
    <tr>
      <th style="background-color: #DEEAF6; color: #1F2937;">Name</th>
      <th style="background-color: #DEEAF6; color: #1F2937;">Role</th>
      <th style="background-color: #DEEAF6; color: #1F2937;">Team</th>
      <th style="background-color: #DEEAF6; color: #1F2937;">Status</th>
      <th style="background-color: #66BB6A; color: white;">Summary</th>
      <th style="background-color: #66BB6A; color: white;">Tasks</th>
      <th style="background-color: #66BB6A; color: white;">Hours</th>
      <th style="background-color: #66BB6A; color: white;">Efficiency</th>
      <th style="background-color: #66BB6A; color: white;">Quality</th>
      <th style="background-color: #66BB6A; color: white;">Rating</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="color: #008000; font-weight: bold;">Alice Johnson</td>
      <td>Lead Developer</td>
      <td style="color: #0066CC;">Frontend</td>
      <td style="color: #2E7D32;">Active</td>
      <td style="color: #008000; font-weight: bold;">Excellent</td>
      <td style="color: #008000;">45</td>
      <td style="color: #008000;">40h</td>
      <td style="color: #008000;">95%</td>
      <td style="color: #008000;">A+</td>
      <td style="color: #008000;">★★★★★</td>
    </tr>
    <tr>
      <td style="color: #008000; font-weight: bold;">Bob Smith</td>
      <td>Senior Developer</td>
      <td style="color: #0066CC;">Backend</td>
      <td style="color: #2E7D32;">Active</td>
      <td style="color: #008000; font-weight: bold;">Good</td>
      <td style="color: #008000;">38</td>
      <td style="color: #008000;">40h</td>
      <td style="color: #008000;">88%</td>
      <td style="color: #008000;">A</td>
      <td style="color: #008000;">★★★★☆</td>
    </tr>
    <tr>
      <td style="color: #008000; font-weight: bold;">Carol Davis</td>
      <td>QA Engineer</td>
      <td style="color: #7B1FA2;">Testing</td>
      <td style="color: #F57C00;">On Leave</td>
      <td style="color: #FF6B35;">Pending</td>
      <td style="color: #666;">--</td>
      <td style="color: #666;">--</td>
      <td style="color: #666;">--</td>
      <td style="color: #666;">--</td>
      <td style="color: #666;">--</td>
    </tr>
  </tbody>
</table>

<p>AG-Grid features include column resizing, sorting, and proper color preservation. The column widths are automatically saved.</p>
`;

export default function TestAgGridPage() {
  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">AG-Grid Table Test</h1>
      
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">AG-Grid Native Features:</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Column resizing (drag column borders)</li>
          <li>Column sorting (click column headers)</li>
          <li>Preserved text and background colors from HTML</li>
          <li><strong>Native column spanning</strong> using AG-Grid's colSpan property</li>
          <li><strong>Native column groups</strong> for hierarchical headers</li>
          <li><strong>Expandable groups</strong> with show/hide functionality</li>
          <li><strong>Group tooltips</strong> and auto-height headers</li>
          <li><strong>Married children</strong> - columns stay together when moved</li>
          <li>Proper cell merging and visual continuity</li>
          <li>Responsive layout</li>
          <li>Charlotte UDO theme integration</li>
        </ul>
      </div>

      <Suspense fallback={<div>Loading tables...</div>}>
        <UDOContentWithAgGrid 
          htmlContent={testTableHTML}
        />
      </Suspense>
      
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Implementation Notes:</h3>
        <p className="text-sm mb-2">
          This implementation uses AG-Grid's native column spanning and column groups features:
        </p>
        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
          <li><strong>Column Groups:</strong> Multi-row headers create hierarchical column groups with proper nesting</li>
          <li><strong>Column Spanning:</strong> Individual cells use AG-Grid's colSpan callback for proper cell merging</li>
          <li><strong>Complex Headers:</strong> Table 6 shows 3-level nested headers with rowspan and colspan</li>
          <li><strong>Advanced Groups:</strong> Table 7 demonstrates expandable groups with show/hide columns</li>
          <li><strong>Group Features:</strong> Auto-height headers, tooltips, married children, and sticky labels</li>
          <li><strong>Smart Behavior:</strong> Summary columns appear when closed, details when expanded</li>
          <li><strong>Style Preservation:</strong> All HTML colors, fonts, and alignment preserved through AG-Grid's styling system</li>
          <li><strong>Full Functionality:</strong> Sorting, filtering, resizing, and column moving work seamlessly</li>
          <li><strong>Performance:</strong> Native AG-Grid features ensure optimal rendering and memory usage</li>
        </ul>
      </div>
      
      <div className="mt-4 p-4 bg-green-50 rounded-lg">
        <h3 className="font-semibold mb-2">Advanced Column Group Features:</h3>
        <p className="text-sm mb-2">
          The AG-Grid implementation includes advanced column group features from the official documentation:
        </p>
        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
          <li><strong>Expandable Groups:</strong> Click "Detailed Metrics" header to expand/collapse columns</li>
          <li><strong>Column Show/Hide:</strong> Summary shows when closed, detailed metrics when open</li>
          <li><strong>Group Defaults:</strong> All groups inherit default styling and behavior</li>
          <li><strong>Auto-Height Headers:</strong> Headers automatically resize for content</li>
          <li><strong>Tooltips:</strong> Hover over group headers to see descriptive tooltips</li>
          <li><strong>Married Children:</strong> Columns within groups stay together when moved</li>
          <li><strong>Group IDs:</strong> Each group has unique ID for programmatic access</li>
          <li><strong>Smart Defaults:</strong> Overview groups open by default, detailed groups collapsible</li>
        </ul>
      </div>
      
      <div className="mt-4 p-4 bg-amber-50 rounded-lg">
        <h3 className="font-semibold mb-2">Color Preservation Test:</h3>
        <p className="text-sm">
          The AG-Grid tables above demonstrate preservation of:
        </p>
        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
          <li>Blue headers with white text (#1E4E79 background)</li>
          <li>Light blue headers (#DEEAF6 background)</li>
          <li>Green color variations (#2E7D32, #66BB6A, #81C784) for hierarchical grouping</li>
          <li>Purple color variations (#7B1FA2, #BA68C8, #CE93D8) for nested column groups</li>
          <li>Colored text in cells (red, green, blue) with proper contrast</li>
          <li>Cell background colors (light green, orange, red) maintained</li>
          <li>Colspan cells with maintained styling across merged columns</li>
          <li>Complex 3-level headers with rowspan and colspan combinations</li>
          <li>Summary rows with full-width spanning and special formatting</li>
        </ul>
      </div>
    </div>
  );
}