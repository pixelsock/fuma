'use client';

import { UDOContentRendererV3 } from '@/components/udo-content-renderer-v3';
import { UDOContentRendererV4 } from '@/components/udo-content-renderer-v4';
import { DefinitionDataProvider } from '@/components/definition-data-context';
import { DefinitionDataProvider as DefinitionDataProviderV2 } from '@/components/definition-data-context-v2';
import { DefinitionPrefetcher } from '@/components/definition-prefetcher';

export default function PerformanceTestPageV2() {
  // Sample content with tables and definitions
  const sampleContent = `
    <h2 id="test-section">Test Section with Tables</h2>
    <p>This is a test article with <a href="#" class="definition-link" data-definition-id="1">zoning</a> definitions.</p>
    
    <div class="table-wrapper">
      <p class="table-title">Table 4-1: Sample Zoning Requirements</p>
      <table>
        <thead>
          <tr>
            <th>Zone</th>
            <th>Min Lot Size</th>
            <th>Max Height</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>R-1</td>
            <td>7,500 sq ft</td>
            <td>35 ft</td>
          </tr>
          <tr>
            <td>R-2</td>
            <td>5,000 sq ft</td>
            <td>40 ft</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <p>Additional content with more <a href="#" class="definition-link" data-definition-id="2">setback</a> requirements.</p>
  `;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-2xl font-bold mb-4">Performance Test Comparison V2</h1>
        <p className="mb-8">
          This page compares the original renderer (V3) with the optimized renderer (V4). 
          Open DevTools Console to see performance metrics.
        </p>
        
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold mb-4">Original Renderer (V3)</h2>
            <div className="border rounded-lg p-4 bg-white">
              <DefinitionDataProvider>
                <UDOContentRendererV3 
                  htmlContent={sampleContent} 
                />
                <DefinitionPrefetcher />
              </DefinitionDataProvider>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Optimized Renderer (V4)</h2>
            <div className="border rounded-lg p-4 bg-white">
              <DefinitionDataProviderV2>
                <UDOContentRendererV4 
                  htmlContent={sampleContent}
                />
                <DefinitionPrefetcher />
              </DefinitionDataProviderV2>
            </div>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">Performance Improvements V4:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>✅ Progressive table rendering with reserved space</li>
            <li>✅ Tables show loading skeleton until ready</li>
            <li>✅ Smooth opacity transitions prevent jarring changes</li>
            <li>✅ Definition prefetching starts immediately (no 500ms delay)</li>
            <li>✅ Viewport-based prefetching with Intersection Observer</li>
            <li>✅ Batch definition fetching reduces API calls</li>
            <li>✅ Session storage caching for definitions (1hr TTL)</li>
            <li>✅ requestIdleCallback for better performance</li>
          </ul>
        </div>
    </div>
  );
}