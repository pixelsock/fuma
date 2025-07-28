'use client';

import { Suspense } from 'react';
import { UDOContentRenderer } from '@/components/udo-content-renderer';

// Test HTML content with tables that should render with AG Grid
const testContent = `
<h2>Test AG Grid Integration</h2>
<p>This page tests the AG Grid integration with various table structures.</p>

<table>
  <tr>
    <td colspan="4">Table 1: Simple Header Groups</td>
  </tr>
  <tr>
    <th class="header-cell" colspan="2">Group A</th>
    <th class="header-cell" colspan="2">Group B</th>
  </tr>
  <tr>
    <th class="header-cell">Column 1</th>
    <th class="header-cell">Column 2</th>
    <th class="header-cell">Column 3</th>
    <th class="header-cell">Column 4</th>
  </tr>
  <tr>
    <td>Data 1-1</td>
    <td>Data 1-2</td>
    <td>Data 1-3</td>
    <td>Data 1-4</td>
  </tr>
  <tr>
    <td>Data 2-1</td>
    <td>Data 2-2</td>
    <td>Data 2-3</td>
    <td>Data 2-4</td>
  </tr>
</table>

<p>Another paragraph between tables.</p>

<table>
  <tr>
    <td colspan="3">Table 2: Cell Spanning Example</td>
  </tr>
  <tr>
    <th class="header-cell">Name</th>
    <th class="header-cell">Details</th>
    <th class="header-cell">Status</th>
  </tr>
  <tr>
    <td>Item 1</td>
    <td colspan="2">This cell spans two columns</td>
  </tr>
  <tr>
    <td>Item 2</td>
    <td>Regular cell</td>
    <td>Active</td>
  </tr>
  <tr>
    <td colspan="3" style="text-align: center; font-weight: bold;">Summary Row</td>
  </tr>
</table>

<p>This demonstrates the AG Grid features including:</p>
<ul>
  <li>Title extraction from first row</li>
  <li>Column groups with proper headers</li>
  <li>Cell spanning</li>
  <li>Search functionality</li>
  <li>Fullscreen mode</li>
  <li>Proper borders on all cells</li>
</ul>
`;

export default function TestAgGridFrontendPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">AG Grid Frontend Integration Test</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <UDOContentRenderer htmlContent={testContent} />
      </Suspense>
    </div>
  );
}