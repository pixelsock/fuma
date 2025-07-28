import React from 'react';
import { DocsPage, DocsBody } from 'fumadocs-ui/page';
import { UDOContentRendererV3 } from '@/components/udo-content-renderer-v3';
import { ArticleTitleHeader } from '@/components/article-title-header';

// Mock HTML content with definition links
const mockHtmlContent = `
  <h2>Test Article with Definition Tooltips</h2>
  
  <p>
    This is a test article to verify the new simplified definition tooltip implementation using shadcn/ui components.
  </p>
  
  <h3>Zoning Concepts</h3>
  
  <p>
    Understanding <a href="#" class="definition-link" data-definition-id="1">zoning</a> is fundamental to urban planning. 
    The <a href="#" class="definition-link" data-definition-id="2">setback</a> requirements ensure proper spacing between buildings.
  </p>
  
  <p>
    <a href="#" class="definition-link" data-definition-id="3">Lot coverage</a> and 
    <a href="#" class="definition-link" data-definition-id="4">building height</a> are key factors in determining 
    the scale and character of development.
  </p>
  
  <h3>Development Standards</h3>
  
  <p>
    <a href="#" class="definition-link" data-definition-id="5">Density</a> regulations control the intensity of land use. 
    Property owners may seek a <a href="#" class="definition-link" data-definition-id="6">variance</a> when strict 
    application of the ordinance creates unnecessary hardship.
  </p>
  
  <h3>Property Rights</h3>
  
  <p>
    An <a href="#" class="definition-link" data-definition-id="7">easement</a> grants specific rights to use another's property, 
    while a <a href="#" class="definition-link" data-definition-id="8">right-of-way</a> typically provides public access.
  </p>
  
  <h3>Special Permissions</h3>
  
  <p>
    Some uses require <a href="#" class="definition-link" data-definition-id="9">conditional use</a> approval, 
    which involves additional review. A <a href="#" class="definition-link" data-definition-id="10">buffer</a> 
    may be required between incompatible land uses.
  </p>
  
  <div style="margin-top: 500px;">
    <h3>Edge Cases</h3>
    <p>
      Testing tooltip positioning near the bottom of the page with 
      <a href="#" class="definition-link" data-definition-id="11">overlay district</a> definitions.
    </p>
  </div>
`;

export default function TestArticleV3Page() {
  return (
    <DocsPage>
      <DocsBody>
        <ArticleTitleHeader 
          category="Test Category"
          title="Test Article with shadcn/ui Tooltips"
          slug="test-article-v3"
          description="Testing the new simplified definition tooltip implementation"
        />
        <UDOContentRendererV3 htmlContent={mockHtmlContent} />
      </DocsBody>
    </DocsPage>
  );
}