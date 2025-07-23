import { UDOContentRendererV2 } from '@/components/udo-content-renderer-v2';

export default function TestScrollTooltips() {
  // Create content with many definition links to test scrolling
  const testContent = `
    <div class="prose prose-lg max-w-none">
      <h2>Tooltip Scroll Test</h2>
      <p>This page tests tooltips on a long scrollable page with many definition links.</p>
      
      <h3>Section 1 - Top of Page</h3>
      <p>
        Test link 1: <a class="definition-link" href="#" data-definition-id="1dc99f44-551c-4606-87f7-5a84649d6740">prescribed conditions</a>
      </p>
      
      <div style="height: 400px; background: #f0f0f0; padding: 20px; margin: 20px 0;">
        <p>Spacer content to create scroll area</p>
      </div>
      
      <h3>Section 2 - Middle of Page</h3>
      <p>
        Test link 2: <a class="definition-link" href="#" data-definition-id="0012e3f5-1c4a-4e07-93a5-54618d8c6c46">Commercial Vehicles, Large</a>
      </p>
      
      <div style="height: 400px; background: #e0e0e0; padding: 20px; margin: 20px 0;">
        <p>More spacer content</p>
      </div>
      
      <h3>Section 3 - Further Down</h3>
      <p>
        Test link 3: <a class="definition-link" href="#" data-definition-id="004ee12c-ed07-4041-814f-7d14cb724f2d">Luminaire</a>
      </p>
      
      <div style="height: 400px; background: #d0d0d0; padding: 20px; margin: 20px 0;">
        <p>Even more spacer content</p>
      </div>
      
      <h3>Section 4 - Near Bottom</h3>
      <p>
        Test link 4: <a class="definition-link" href="#" data-definition-id="015d84b4-abcf-4432-9bcb-517db2fc3191">Large Maturing Shade Tree</a>
      </p>
      
      <div style="height: 400px; background: #c0c0c0; padding: 20px; margin: 20px 0;">
        <p>Final spacer content</p>
      </div>
      
      <h3>Section 5 - Bottom of Page</h3>
      <p>
        Test link 5: <a class="definition-link" href="#" data-definition-id="1dc99f44-551c-4606-87f7-5a84649d6740">prescribed conditions</a> (repeated)
      </p>
      
      <p style="margin-top: 100px;">End of test content. Check console for positioning debug info.</p>
    </div>
  `;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Tooltip Scroll Position Test</h1>
      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Debug Mode:</strong> Check browser console for tooltip positioning calculations.
          Test hovering over links at different scroll positions.
        </p>
      </div>
      <UDOContentRendererV2 htmlContent={testContent} />
    </div>
  );
}