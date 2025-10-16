import { unifiedSource } from '@/lib/unified-source';
import { DocsPage, DocsBody } from 'fumadocs-ui/page';
import { UDOContentRendererSSR } from '@/components/udo-content-renderer-ssr';
import { UDOContentRendererV3 } from '@/components/udo-content-renderer-v3';
import { DefinitionDataProvider } from '@/components/definition-data-context-optimized';
import { DefinitionPrefetcherOptimized } from '@/components/definition-prefetcher-optimized';

export default async function PerformanceTestPage() {
  // Get a sample article with tables
  const testSlug = ['part-iii-neighborhood-zoning-districts', 'article-4-neighborhood-1-zoning-districts'];
  const directusPage = await unifiedSource.getPage(testSlug);
  
  if (!directusPage) {
    return (
      <DocsPage>
        <DocsBody>
          <h1>Performance Test Page</h1>
          <p>No test article found. Please ensure the article exists.</p>
        </DocsBody>
      </DocsPage>
    );
  }

  return (
    <DocsPage>
      <DocsBody>
        <h1 className="text-2xl font-bold mb-4">Performance Test Comparison</h1>
        <p className="mb-8">
          This page compares the original renderer (V3) with the optimized renderer. 
          Open DevTools Console to see performance metrics.
        </p>
        
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold mb-4">Original Renderer (V3)</h2>
            <div className="border rounded-lg p-4">
              <DefinitionDataProvider>
                <UDOContentRendererV3 
                  htmlContent={directusPage.data.content || ''} 
                />
              </DefinitionDataProvider>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Optimized Renderer</h2>
            <div className="border rounded-lg p-4">
              <DefinitionDataProvider>
                <UDOContentRendererSSR 
                  htmlContent={directusPage.data.content || ''}
                />
                <DefinitionPrefetcherOptimized />
              </DefinitionDataProvider>
            </div>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">Performance Improvements:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>✅ Server-side table pre-processing prevents content flash</li>
            <li>✅ Progressive table loading with skeleton UI</li>
            <li>✅ Immediate definition prefetching (no 500ms delay)</li>
            <li>✅ Batch definition fetching reduces API calls</li>
            <li>✅ Session storage caching for definitions</li>
            <li>✅ Lazy loading of AG-Grid components</li>
            <li>✅ Smooth animations prevent jarring transitions</li>
          </ul>
        </div>
      </DocsBody>
    </DocsPage>
  );
}
