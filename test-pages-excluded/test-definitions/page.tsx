import { UDOContentRendererV2 } from '@/components/udo-content-renderer-v2';

export default function TestDefinitionsPage() {
  // Test HTML content with definition links
  const testContent = `
    <div class="prose prose-lg max-w-none">
      <h2>Test Definition Links</h2>
      <p>
        This page tests definition tooltips. Here are some test definition links:
      </p>
      <ul>
        <li>
          The term <a class="definition-link" href="#" data-definition-id="1dc99f44-551c-4606-87f7-5a84649d6740">prescribed conditions</a> 
          is used throughout the UDO.
        </li>
        <li>
          A <a class="definition-link" href="#" data-definition-id="0012e3f5-1c4a-4e07-93a5-54618d8c6c46">Commercial Vehicles, Large</a> 
          has specific weight and size requirements.
        </li>
        <li>
          The definition of <a class="definition-link" href="#" data-definition-id="004ee12c-ed07-4041-814f-7d14cb724f2d">Luminaire</a> 
          relates to lighting equipment.
        </li>
        <li>
          A <a class="definition-link" href="#" data-definition-id="015d84b4-abcf-4432-9bcb-517db2fc3191">Large Maturing Shade Tree</a> 
          must meet certain height and spread requirements.
        </li>
      </ul>
      <p>
        Hover over any of the underlined terms above to see their definitions. On touch devices, tap to show the tooltip.
        The tooltip will close when you click/touch outside or scroll.
      </p>
      
      <h3>Testing Invalid Definition</h3>
      <p>
        This link has an invalid definition ID: 
        <a class="definition-link" href="#" data-definition-id="invalid-id-12345">invalid term</a>
      </p>
      
      <h3>Multiple instances of the same term</h3>
      <p>
        The <a class="definition-link" href="#" data-definition-id="1dc99f44-551c-4606-87f7-5a84649d6740">prescribed conditions</a> 
        can appear multiple times in the document. Each instance of 
        <a class="definition-link" href="#" data-definition-id="1dc99f44-551c-4606-87f7-5a84649d6740">prescribed conditions</a> 
        should have its own tooltip.
      </p>
    </div>
  `;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Definition Tooltips Test Page (Enhanced)</h1>
      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Progressive Enhancement:</strong> Tooltips enhance original links without replacing them. 
          Perfect for SEO - links work normally, tooltips provide additional context. No more race conditions!
        </p>
      </div>
      <UDOContentRendererV2 htmlContent={testContent} />
    </div>
  );
}