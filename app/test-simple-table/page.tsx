'use client';

import React from 'react';
import { UDOContentRenderer } from '@/components/udo-content-renderer';

const simpleHTML = `
<h2>Test Article</h2>
<p>This is a paragraph before the table.</p>
<table>
  <thead>
    <tr>
      <th>Column 1</th>
      <th>Column 2</th>
      <th>Column 3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data 1</td>
      <td>Data 2</td>
      <td>Data 3</td>
    </tr>
    <tr>
      <td>Data 4</td>
      <td>Data 5</td>
      <td>Data 6</td>
    </tr>
  </tbody>
</table>
<p>This is a paragraph after the table.</p>
`;

export default function TestSimpleTablePage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Test Simple Table</h1>
      
      <div className="border p-4 rounded bg-gray-50">
        <h2 className="font-semibold mb-2">Raw HTML:</h2>
        <pre className="text-xs overflow-auto">{simpleHTML}</pre>
      </div>
      
      <div className="mt-8 border p-4 rounded">
        <h2 className="font-semibold mb-4">Rendered as HTML:</h2>
        <UDOContentRenderer 
          htmlContent={simpleHTML}
          className="prose max-w-none"
        />
      </div>
    </div>
  );
}