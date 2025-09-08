'use client';

import React, { useState, useEffect } from 'react';
import { UDOContentRendererV3Optimized } from '@/components/udo-content-renderer-v3-optimized';

// Test HTML with multiple tables for performance testing
const generateTestTables = (count: number) => {
  let html = `<h2>Table Performance Test - ${count} Tables</h2><p>This page tests the performance of table enhancement with ${count} tables.</p>`;
  
  for (let i = 1; i <= count; i++) {
    html += `
      <h3>Table ${i}: Performance Test Table</h3>
      <table>
        <caption>Table ${i} - Employee Data</caption>
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
            <td>John Doe ${i}</td>
            <td style="color: #0066CC;">Engineering</td>
            <td>Senior Developer</td>
            <td style="color: #008000;">$95,000</td>
            <td>2020-01-15</td>
            <td style="color: #2E7D32;">Active</td>
          </tr>
          <tr>
            <td>Jane Smith ${i}</td>
            <td style="color: #0066CC;">Marketing</td>
            <td>Marketing Manager</td>
            <td style="color: #008000;">$85,000</td>
            <td>2019-06-20</td>
            <td style="color: #2E7D32;">Active</td>
          </tr>
          <tr>
            <td>Mike Johnson ${i}</td>
            <td style="color: #0066CC;">Sales</td>
            <td>Sales Representative</td>
            <td style="color: #008000;">$75,000</td>
            <td>2021-03-10</td>
            <td style="color: #F57C00;">On Leave</td>
          </tr>
          <tr>
            <td>Sarah Wilson ${i}</td>
            <td style="color: #0066CC;">HR</td>
            <td>HR Specialist</td>
            <td style="color: #008000;">$70,000</td>
            <td>2022-01-05</td>
            <td style="color: #2E7D32;">Active</td>
          </tr>
          <tr>
            <td>David Brown ${i}</td>
            <td style="color: #0066CC;">Finance</td>
            <td>Financial Analyst</td>
            <td style="color: #008000;">$80,000</td>
            <td>2021-09-12</td>
            <td style="color: #2E7D32;">Active</td>
          </tr>
        </tbody>
      </table>
      
      <p>Note: This is table ${i} of ${count} tables for performance testing.</p>
    `;
  }
  
  return html;
};

export default function TestTablePerformancePage() {
  const [tableCount, setTableCount] = useState(5);
  const [renderTime, setRenderTime] = useState<number | null>(null);
  const [enhancedTables, setEnhancedTables] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const testContent = generateTestTables(tableCount);

  // Performance measurement
  useEffect(() => {
    const startTime = performance.now();
    setIsLoading(true);
    
    // Reset enhanced tables count
    setEnhancedTables(0);
    
    // Measure table enhancement
    const checkEnhancedTables = () => {
      const enhanced = document.querySelectorAll('.enhanced-table-container').length;
      setEnhancedTables(enhanced);
      
      if (enhanced === tableCount) {
        const endTime = performance.now();
        setRenderTime(endTime - startTime);
        setIsLoading(false);
      } else {
        // Check again in 100ms
        setTimeout(checkEnhancedTables, 100);
      }
    };
    
    // Start checking after a short delay
    setTimeout(checkEnhancedTables, 200);
  }, [tableCount]);

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Table Performance Test</h1>
      
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Performance Controls</h2>
        <div className="flex items-center gap-4 mb-4">
          <label htmlFor="tableCount" className="font-medium">
            Number of Tables:
          </label>
          <select
            id="tableCount"
            value={tableCount}
            onChange={(e) => setTableCount(Number(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded"
            disabled={isLoading}
          >
            <option value={5}>5 Tables</option>
            <option value={10}>10 Tables</option>
            <option value={20}>20 Tables</option>
            <option value={50}>50 Tables</option>
            <option value={100}>100 Tables</option>
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-white rounded border">
            <div className="text-sm text-gray-600">Tables to Render</div>
            <div className="text-2xl font-bold text-blue-600">{tableCount}</div>
          </div>
          <div className="p-3 bg-white rounded border">
            <div className="text-sm text-gray-600">Enhanced Tables</div>
            <div className="text-2xl font-bold text-green-600">{enhancedTables}</div>
          </div>
          <div className="p-3 bg-white rounded border">
            <div className="text-sm text-gray-600">Render Time</div>
            <div className="text-2xl font-bold text-purple-600">
              {renderTime ? `${renderTime.toFixed(0)}ms` : 'Measuring...'}
            </div>
          </div>
        </div>
        
        {isLoading && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span>Enhancing tables...</span>
            </div>
          </div>
        )}
        
        {renderTime && !isLoading && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <div className="text-sm">
              <strong>Performance Summary:</strong> Enhanced {enhancedTables} tables in {renderTime.toFixed(0)}ms 
              (avg: {(renderTime / enhancedTables).toFixed(1)}ms per table)
            </div>
          </div>
        )}
      </div>

      <div className="mb-4 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Performance Features Being Tested:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Automatic table detection and enhancement</li>
          <li>Column resizing functionality</li>
          <li>Horizontal scrolling controls</li>
          <li>Title extraction and display</li>
          <li>Footnote detection and rendering</li>
          <li>Memory management and cleanup</li>
          <li>DOM manipulation efficiency</li>
        </ul>
      </div>

      <UDOContentRendererV3Optimized 
        htmlContent={testContent}
      />
      
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Testing Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Try different table counts to test scalability</li>
          <li>Check that all tables are enhanced with toolbars</li>
          <li>Test column resizing on multiple tables</li>
          <li>Verify horizontal scrolling works on wide tables</li>
          <li>Check that titles are extracted and displayed</li>
          <li>Monitor browser performance with developer tools</li>
          <li>Test fullscreen mode on various tables</li>
        </ol>
      </div>
    </div>
  );
}
