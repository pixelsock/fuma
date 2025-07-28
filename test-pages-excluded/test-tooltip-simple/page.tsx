import { UDOContentRendererV2 } from '@/components/udo-content-renderer-v2';

export default function SimpleTooltipTest() {
  const testContent = `
    <div class="prose max-w-none">
      <h2>Simple Tooltip Test</h2>
      <p>
        This is a simple test of the enhanced tooltip system. 
        Click on this term: <a class="definition-link" href="#" data-definition-id="1dc99f44-551c-4606-87f7-5a84649d6740">prescribed conditions</a>
      </p>
    </div>
  `;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Simple Tooltip Test</h1>
      <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <p className="text-sm text-green-800 dark:text-green-200">
          <strong>Fixed:</strong> Simplified tooltip implementation - removed mobile-specific logic. Same 0.5rem gap on all devices. Closes on scroll/click outside.
        </p>
      </div>
      <UDOContentRendererV2 htmlContent={testContent} />
    </div>
  );
}