// Minimal source that returns static content for testing
export const minimalSource = {
  async getPage(slugs: string[]) {
    console.log('Minimal source: received slugs:', slugs);
    
    // Always return a static page for testing
    return {
      file: {
        path: 'docs/test.mdx',
        name: 'Test Article',
        flattenedPath: 'test',
        ext: '.mdx',
        dirname: '.',
      },
      data: {
        title: 'Test Article',
        description: 'A test article',
        body: '<h1>Test Article</h1><p>This is a test article.</p>',
        toc: [],
        structuredData: [],
        _exports: {},
        content: '<h1>Test Article</h1><p>This is a test article.</p>',
        full: false,
      },
      url: '/docs/test',
      slugs: ['test'],
    };
  },
  
  async getPages() {
    return [];
  },
  
  async generateParams() {
    return [{ slug: ['test'] }];
  },
  
  get pageTree() {
    return {
      name: 'Charlotte UDO',
      children: [],
    };
  }
};