import { UDOContentRendererV2 } from '@/components/udo-content-renderer-v2';

export default function TestFootnotes() {
  const testContent = `
    <div class="prose prose-lg max-w-none">
      <h2>Footnotes Test</h2>
      <p>This page tests the footnote styling with the custom .footnote class.</p>
      
      <h3>Regular Content</h3>
      <p>
        This is regular paragraph content. Here's a 
        <a class="definition-link" href="#" data-definition-id="1dc99f44-551c-4606-87f7-5a84649d6740">definition link</a> 
        and an <a class="internal-link" href="/example">internal link</a> for comparison.
      </p>
      
      <div class="footnote">
        This is a footnote with important additional information that provides context 
        or clarification about the main content above.
      </div>
      
      <h3>Multiple Footnotes (Different Elements)</h3>
      <p>
        Here's some content that references multiple footnotes using different HTML elements. 
        This tests that all footnote variations are styled consistently.
      </p>
      
      <div class="footnote">
        <strong>DIV Footnote:</strong> All commercial developments must comply with the 
        current zoning ordinances as outlined in Part II of the UDO.
      </div>
      
      <p class="footnote">
        <strong>P Footnote:</strong> A building permit is required for any 
        structure exceeding 200 square feet or any electrical work.
      </p>
      
      <span class="footnote">
        <strong>SPAN Footnote:</strong> This footnote uses a span element but is displayed 
        as a block with the same styling as other footnotes.
      </span>
      
      <h3>Footnote with Links</h3>
      <p>
        This section demonstrates how footnotes can contain links to other resources.
      </p>
      
      <div class="footnote">
        For more information about <a class="definition-link" href="#" data-definition-id="0012e3f5-1c4a-4e07-93a5-54618d8c6c46">Commercial Vehicles, Large</a>, 
        see the <a class="internal-link" href="/vehicle-regulations">vehicle regulations page</a>.
      </div>
      
      <h3>Long Footnote</h3>
      <p>
        Sometimes footnotes contain more detailed explanations that span multiple sentences.
      </p>
      
      <div class="footnote">
        This is a longer footnote that demonstrates how the styling works with more text content. 
        It includes multiple sentences and shows how the line height and padding work together 
        to create a readable and visually appealing footnote. The italic styling helps 
        distinguish it from the main content while maintaining readability.
      </div>
      
      <h3>Dark Mode</h3>
      <p>
        The footnotes automatically adapt to dark mode with appropriate colors and contrast.
        Toggle your theme to see the difference.
      </p>
      
      <div class="footnote">
        Dark mode uses lighter text colors and a subtle background that works well 
        with the overall dark theme aesthetic.
      </div>
    </div>
  `;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Footnotes Styling Test</h1>
      <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
        <p className="text-sm text-gray-800 dark:text-gray-200">
          <strong>Updated:</strong> Footnotes now have consistent styling across all element types 
          (div, p, span) with 18px top/bottom padding, "FOOTNOTE" label, left border, and proper light/dark mode support.
        </p>
      </div>
      <UDOContentRendererV2 htmlContent={testContent} />
    </div>
  );
}