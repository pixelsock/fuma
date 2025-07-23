import React from 'react';
import { UDOContentRendererV3 } from '@/components/udo-content-renderer-v3';

// Mock content with definition links
const mockContent = (
  <div className="prose max-w-none">
    <h1>Test Definition Tooltips with shadcn/ui</h1>
    
    <p>
      This is a test page to verify the new simplified definition tooltip implementation using shadcn/ui components.
    </p>
    
    <h2>Test Cases</h2>
    
    <p>
      Here's a definition link: <a href="#" className="definition-link" data-definition-id="1">zoning</a> that should show a tooltip on hover (desktop) or click (mobile).
    </p>
    
    <p>
      Multiple definitions in one paragraph: <a href="#" className="definition-link" data-definition-id="2">setback</a>, 
      <a href="#" className="definition-link" data-definition-id="3">lot coverage</a>, and 
      <a href="#" className="definition-link" data-definition-id="4">building height</a>.
    </p>
    
    <h3>Edge Cases</h3>
    
    <p>
      Definition at the start: <a href="#" className="definition-link" data-definition-id="5">Density</a> is an important concept.
    </p>
    
    <p className="text-right">
      Definition at the end of a right-aligned paragraph: <a href="#" className="definition-link" data-definition-id="6">variance</a>
    </p>
    
    <div className="flex justify-between">
      <span>Left side: <a href="#" className="definition-link" data-definition-id="7">easement</a></span>
      <span>Right side: <a href="#" className="definition-link" data-definition-id="8">right-of-way</a></span>
    </div>
    
    <h3>Long Content</h3>
    
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. In the middle of this long text, we have a 
      <a href="#" className="definition-link" data-definition-id="9">conditional use</a> that needs definition. 
      Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    </p>
    
    <div style={{ marginTop: '800px' }}>
      <p>
        Definition near bottom of page: <a href="#" className="definition-link" data-definition-id="10">buffer</a>
      </p>
    </div>
  </div>
);

export default function TestDefinitionsV3Page() {
  return (
    <div className="container mx-auto py-8">
      <UDOContentRendererV3 htmlContent="" />
    </div>
  );
}