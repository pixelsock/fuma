'use client';

import React, { useState } from 'react';
import { UDOContentRendererV3Optimized } from '@/components/udo-content-renderer-v3-optimized';

// Test HTML with various table features
const testTableHTML = `
<h2>Enhanced Table Features Test</h2>
<p>This page demonstrates all the enhanced table features including search, sorting, resizing, and more.</p>

<h3>Table 1: Basic Table with Search and Sort</h3>
<table>
  <caption>Employee Directory</caption>
  <thead>
    <tr>
      <th style="background-color: #1E4E79; color: white;">Name</th>
      <th style="background-color: #1E4E79; color: white;">Department</th>
      <th style="background-color: #1E4E79; color: white;">Position</th>
      <th style="background-color: #1E4E79; color: white;">Salary</th>
      <th style="background-color: #1E4E79; color: white;">Start Date</th>
      <th style="background-color: #1E4E79; color: white;">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John Doe</td>
      <td style="color: #0066CC;">Engineering</td>
      <td>Senior Developer</td>
      <td style="color: #008000;">$95,000</td>
      <td>2020-01-15</td>
      <td style="color: #2E7D32;">Active</td>
    </tr>
    <tr>
      <td>Jane Smith</td>
      <td style="color: #0066CC;">Marketing</td>
      <td>Marketing Manager</td>
      <td style="color: #008000;">$85,000</td>
      <td>2019-06-20</td>
      <td style="color: #2E7D32;">Active</td>
    </tr>
    <tr>
      <td>Mike Johnson</td>
      <td style="color: #0066CC;">Sales</td>
      <td>Sales Representative</td>
      <td style="color: #008000;">$75,000</td>
      <td>2021-03-10</td>
      <td style="color: #F57C00;">On Leave</td>
    </tr>
    <tr>
      <td>Sarah Wilson</td>
      <td style="color: #0066CC;">HR</td>
      <td>HR Specialist</td>
      <td style="color: #008000;">$70,000</td>
      <td>2022-01-05</td>
      <td style="color: #2E7D32;">Active</td>
    </tr>
    <tr>
      <td>David Brown</td>
      <td style="color: #0066CC;">Finance</td>
      <td>Financial Analyst</td>
      <td style="color: #008000;">$80,000</td>
      <td>2021-09-12</td>
      <td style="color: #2E7D32;">Active</td>
    </tr>
    <tr>
      <td>Lisa Davis</td>
      <td style="color: #0066CC;">Engineering</td>
      <td>Frontend Developer</td>
      <td style="color: #008000;">$88,000</td>
      <td>2022-03-15</td>
      <td style="color: #2E7D32;">Active</td>
    </tr>
    <tr>
      <td>Robert Miller</td>
      <td style="color: #0066CC;">Marketing</td>
      <td>Content Writer</td>
      <td style="color: #008000;">$65,000</td>
      <td>2021-11-08</td>
      <td style="color: #C62828;">Inactive</td>
    </tr>
  </tbody>
</table>

<h3>Table 2: Wide Table for Horizontal Scrolling</h3>
<table>
  <thead>
    <tr>
      <th style="background-color: #1E4E79; color: white;">Product</th>
      <th style="background-color: #1E4E79; color: white;">Q1 Sales</th>
      <th style="background-color: #1E4E79; color: white;">Q2 Sales</th>
      <th style="background-color: #1E4E79; color: white;">Q3 Sales</th>
      <th style="background-color: #1E4E79; color: white;">Q4 Sales</th>
      <th style="background-color: #1E4E79; color: white;">Total</th>
      <th style="background-color: #1E4E79; color: white;">Growth</th>
      <th style="background-color: #1E4E79; color: white;">Category</th>
      <th style="background-color: #1E4E79; color: white;">Region</th>
      <th style="background-color: #1E4E79; color: white;">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Widget A</td>
      <td style="color: #008000;">$12,500</td>
      <td style="color: #008000;">$15,200</td>
      <td style="color: #008000;">$18,100</td>
      <td style="color: #008000;">$20,500</td>
      <td style="color: #008000; font-weight: bold;">$66,300</td>
      <td style="color: #008000;">+15.2%</td>
      <td>Electronics</td>
      <td>North</td>
      <td style="color: #2E7D32;">Active</td>
    </tr>
    <tr>
      <td>Widget B</td>
      <td style="color: #FF0000;">$8,900</td>
      <td style="color: #008000;">$9,400</td>
      <td style="color: #008000;">$10,200</td>
      <td style="color: #008000;">$11,100</td>
      <td style="color: #008000; font-weight: bold;">$39,600</td>
      <td style="color: #008000;">+8.7%</td>
      <td>Home & Garden</td>
      <td>South</td>
      <td style="color: #2E7D32;">Active</td>
    </tr>
    <tr>
      <td>Widget C</td>
      <td style="color: #FF0000;">$6,200</td>
      <td style="color: #FF0000;">$5,800</td>
      <td style="color: #008000;">$7,100</td>
      <td style="color: #008000;">$8,300</td>
      <td style="color: #008000; font-weight: bold;">$27,400</td>
      <td style="color: #FF0000;">-2.1%</td>
      <td>Sports</td>
      <td>East</td>
      <td style="color: #F57C00;">Review</td>
    </tr>
  </tbody>
</table>

<h3>Table 3: UDO-Style Zoning Table</h3>
<table>
  <thead>
    <tr>
      <th colspan="6" style="background-color: #1E4E79; color: white; padding: 10px; text-align: center;">Table 4-1: Neighborhood 1 Zoning Districts Lot Standards</th>
    </tr>
    <tr style="background-color: #DEEAF6;">
      <th style="padding: 8px; border: 1px solid #ddd;">District</th>
      <th style="padding: 8px; border: 1px solid #ddd;">Min Lot Size</th>
      <th style="padding: 8px; border: 1px solid #ddd;">Max Height</th>
      <th style="padding: 8px; border: 1px solid #ddd;">Front Setback</th>
      <th style="padding: 8px; border: 1px solid #ddd;">Side Setback</th>
      <th style="padding: 8px; border: 1px solid #ddd;">Rear Setback</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">N1-A</td>
      <td style="padding: 8px; border: 1px solid #ddd;">8,000 sq ft</td>
      <td style="padding: 8px; border: 1px solid #ddd;">35 ft</td>
      <td style="padding: 8px; border: 1px solid #ddd;">27 ft</td>
      <td style="padding: 8px; border: 1px solid #ddd;">5 ft</td>
      <td style="padding: 8px; border: 1px solid #ddd;">15 ft</td>
    </tr>
    <tr style="background-color: #f9f9f9;">
      <td style="padding: 8px; border: 1px solid #ddd;">N1-B</td>
      <td style="padding: 8px; border: 1px solid #ddd;">6,000 sq ft</td>
      <td style="padding: 8px; border: 1px solid #ddd;">35 ft</td>
      <td style="padding: 8px; border: 1px solid #ddd;">27 ft</td>
      <td style="padding: 8px; border: 1px solid #ddd;">5 ft</td>
      <td style="padding: 8px; border: 1px solid #ddd;">15 ft</td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">N1-C</td>
      <td style="padding: 8px; border: 1px solid #ddd;">5,000 sq ft</td>
      <td style="padding: 8px; border: 1px solid #ddd;">40 ft</td>
      <td style="padding: 8px; border: 1px solid #ddd;">17 ft</td>
      <td style="padding: 8px; border: 1px solid #ddd;">5 ft</td>
      <td style="padding: 8px; border: 1px solid #ddd;">15 ft</td>
    </tr>
    <tr style="background-color: #f9f9f9;">
      <td style="padding: 8px; border: 1px solid #ddd;">N1-D</td>
      <td style="padding: 8px; border: 1px solid #ddd;">4,000 sq ft</td>
      <td style="padding: 8px; border: 1px solid #ddd;">45 ft</td>
      <td style="padding: 8px; border: 1px solid #ddd;">15 ft</td>
      <td style="padding: 8px; border: 1px solid #ddd;">3 ft</td>
      <td style="padding: 8px; border: 1px solid #ddd;">10 ft</td>
    </tr>
  </tbody>
</table>

<p>Note: This table demonstrates UDO-style formatting with proper headers and data rows.</p>

<h3>Table 4: Complex Table with Colspan</h3>
<table>
  <thead>
    <tr>
      <th colspan="3" style="background-color: #1E4E79; color: white; text-align: center;">Contact Information</th>
      <th colspan="3" style="background-color: #2E7D32; color: white; text-align: center;">Employment Details</th>
    </tr>
    <tr>
      <th style="background-color: #DEEAF6; color: #1F2937;">Name</th>
      <th style="background-color: #DEEAF6; color: #1F2937;">Email</th>
      <th style="background-color: #DEEAF6; color: #1F2937;">Phone</th>
      <th style="background-color: #DEEAF6; color: #1F2937;">Department</th>
      <th style="background-color: #DEEAF6; color: #1F2937;">Position</th>
      <th style="background-color: #DEEAF6; color: #1F2937;">Manager</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John Doe</td>
      <td>john.doe@company.com</td>
      <td>(555) 123-4567</td>
      <td style="color: #0066CC;">Engineering</td>
      <td>Senior Developer</td>
      <td>Alice Johnson</td>
    </tr>
    <tr>
      <td>Jane Smith</td>
      <td>jane.smith@company.com</td>
      <td>(555) 234-5678</td>
      <td style="color: #0066CC;">Marketing</td>
      <td>Marketing Manager</td>
      <td>Bob Wilson</td>
    </tr>
    <tr>
      <td colspan="3" style="background-color: #FFF3E0; color: #F57C00; text-align: center; font-weight: bold;">Summary</td>
      <td style="background-color: #FFF3E0;">2 Departments</td>
      <td style="background-color: #FFF3E0;">2 Positions</td>
      <td style="background-color: #FFF3E0;">2 Managers</td>
    </tr>
  </tbody>
</table>

<p>This table demonstrates colspan functionality and complex header structures.</p>
`;

export default function TestTableFeaturesPage() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const features = [
    {
      id: 'search',
      name: 'Search Functionality',
      description: 'Search across all table content with real-time filtering',
      icon: '🔍'
    },
    {
      id: 'sort',
      name: 'Column Sorting',
      description: 'Click column headers to sort data ascending/descending',
      icon: '↕️'
    },
    {
      id: 'resize',
      name: 'Column Resizing',
      description: 'Drag column borders to resize columns',
      icon: '↔️'
    },
    {
      id: 'scroll',
      name: 'Horizontal Scrolling',
      description: 'Scroll controls for wide tables',
      icon: '↩️'
    },
    {
      id: 'fullscreen',
      name: 'Fullscreen Mode',
      description: 'View tables in fullscreen for better visibility',
      icon: '⛶'
    },
    {
      id: 'titles',
      name: 'Title Extraction',
      description: 'Automatic extraction and display of table titles',
      icon: '📋'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Enhanced Table Features Test</h1>
      
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Available Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div
              key={feature.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                activeFeature === feature.id
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
              onClick={() => setActiveFeature(activeFeature === feature.id ? null : feature.id)}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{feature.icon}</span>
                <h3 className="font-semibold text-gray-900">{feature.name}</h3>
              </div>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {activeFeature && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">
            Testing: {features.find(f => f.id === activeFeature)?.name}
          </h3>
          <p className="text-sm text-green-700">
            {features.find(f => f.id === activeFeature)?.description}
          </p>
        </div>
      )}

      <UDOContentRendererV3Optimized 
        htmlContent={testTableHTML}
      />
      
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Testing Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li><strong>Search:</strong> Use the search box in the toolbar to filter table content</li>
          <li><strong>Sort:</strong> Click on column headers to sort data (click again to reverse)</li>
          <li><strong>Resize:</strong> Hover over column borders and drag to resize columns</li>
          <li><strong>Scroll:</strong> Use the left/right arrow buttons for horizontal scrolling</li>
          <li><strong>Fullscreen:</strong> Click the maximize button to view tables in fullscreen</li>
          <li><strong>Titles:</strong> Notice how table titles are extracted and displayed prominently</li>
          <li><strong>Responsive:</strong> Test on different screen sizes to see responsive behavior</li>
        </ol>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Performance Notes:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>All table enhancements are applied automatically</li>
          <li>Search and sort operations are optimized for performance</li>
          <li>Column resizing uses throttled updates for smooth interaction</li>
          <li>Memory is properly cleaned up when tables are removed</li>
          <li>Tables work seamlessly with the existing UDO content system</li>
        </ul>
      </div>
    </div>
  );
}
