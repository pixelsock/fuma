'use client';

import React from 'react';
import { UDOContentRenderer } from '@/components/udo-content-renderer';

const testContent = `
<h2>Test Article with Tables</h2>
<p>This is a test to verify that tables render correctly as plain HTML.</p>

<table style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #1E4E79; color: white;">
      <th colspan="5" style="padding: 10px; text-align: center;">Table 4-1: Neighborhood 1 Zoning Districts Lot Standards</th>
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

<p>Additional content after the table.</p>

<h3>Another Table Example</h3>

<table style="border-collapse: collapse; width: 100%;">
  <tr>
    <th style="padding: 8px; border: 1px solid #ddd; background-color: #1E4E79; color: white;">Feature</th>
    <th style="padding: 8px; border: 1px solid #ddd; background-color: #1E4E79; color: white;">Value</th>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;">Simple HTML</td>
    <td style="padding: 8px; border: 1px solid #ddd;">✓ Working</td>
  </tr>
  <tr style="background-color: #f9f9f9;">
    <td style="padding: 8px; border: 1px solid #ddd;">No JavaScript Required</td>
    <td style="padding: 8px; border: 1px solid #ddd;">✓ Working</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;">Fast Loading</td>
    <td style="padding: 8px; border: 1px solid #ddd;">✓ Working</td>
  </tr>
</table>
`;

export default function TestSimpleTablesPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Test Simple HTML Tables</h1>
      
      <div className="mb-6 bg-green-50 p-4 rounded-lg">
        <p className="text-green-800">
          ✓ Tables now render as plain HTML without any third-party libraries!
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <UDOContentRenderer htmlContent={testContent} />
      </div>
    </div>
  );
}