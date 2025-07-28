import { UDOContentRendererV2 } from '@/components/udo-content-renderer-v2';

export default function TestInternalLinks() {
  const testContent = `
    <div class="prose prose-lg max-w-none">
      <h2>Internal Links Test</h2>
      <p>This page tests the styling of internal links using the orange theme color.</p>
      
      <h3>Link Types Comparison</h3>
      <p>
        Here's a <a class="definition-link" href="#" data-definition-id="1dc99f44-551c-4606-87f7-5a84649d6740">definition link</a> (blue primary color)
        and here's an <a class="internal-link" href="/some-page">internal link</a> (orange theme color).
      </p>
      
      <h3>Multiple Internal Links</h3>
      <ul>
        <li>Navigate to <a class="internal-link" href="/articles-listing">Articles section</a></li>
        <li>View the <a class="internal-link" href="/search">Search page</a></li>
        <li>Check out <a class="internal-link" href="/theme-showcase">Theme showcase</a></li>
        <li>Learn about <a class="internal-link" href="/api">API documentation</a></li>
      </ul>
      
      <h3>Mixed Content</h3>
      <p>
        When discussing <a class="definition-link" href="#" data-definition-id="0012e3f5-1c4a-4e07-93a5-54618d8c6c46">Commercial Vehicles, Large</a>, 
        you might want to reference the <a class="internal-link" href="/zoning-districts">zoning districts page</a> 
        for more context about where these vehicles are permitted.
      </p>
      
      <h3>Hover States</h3>
      <p>
        Both link types have hover states:
        <br>
        • <a class="definition-link" href="#" data-definition-id="004ee12c-ed07-4041-814f-7d14cb724f2d">Definition links</a> darken the blue color
        <br>
        • <a class="internal-link" href="/example">Internal links</a> darken the orange color
      </p>
      
      <h3>Dark Mode</h3>
      <p>
        The colors adjust for dark mode using the theme's color variables:
        <br>
        • Definition links: <code>var(--color-fd-primary)</code>
        <br>
        • Internal links: <code>var(--color-fd-accent-foreground)</code>
      </p>
    </div>
  `;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Internal Links Styling Test</h1>
      <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
        <p className="text-sm text-orange-800 dark:text-orange-200">
          <strong>New Feature:</strong> Internal links now use the theme's orange color to distinguish them from definition links (blue).
        </p>
      </div>
      <UDOContentRendererV2 htmlContent={testContent} />
    </div>
  );
}