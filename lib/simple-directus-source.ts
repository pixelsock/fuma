import { getArticleBySlug } from './directus-source';

// Simple source that just returns basic content without MDX compilation
export const simpleDirectusSource = {
  async getPage(slugs: string[]) {
    try {
      const slug = slugs?.join('/') || '';
      console.log('Simple source: fetching article with slug:', slug);
      
      const article = await getArticleBySlug(slug);
      
      if (article) {
        console.log('Simple source: found article:', article.name);
        
        // Return simple page without MDX compilation
        return {
          file: {
            path: `docs/${slug}.mdx`,
            name: article.name,
            flattenedPath: slug,
            ext: '.mdx',
            dirname: slugs.slice(0, -1).join('/') || '.',
          },
          data: {
            title: article.name,
            description: article.description,
            body: () => article.htmlContent, // Return as simple string
            toc: [],
            structuredData: [],
            _exports: {},
            content: article.htmlContent,
            full: false,
          },
          url: `/docs/${slug}`,
          slugs: slugs,
        };
      }
      
      console.log('Simple source: no article found for slug:', slug);
      return null;
    } catch (error) {
      console.error('Simple source error:', error);
      return null;
    }
  },
  
  async getPages() {
    return [];
  },
  
  async generateParams() {
    return [];
  },
  
  get pageTree() {
    return {
      name: 'Charlotte UDO',
      children: [],
    };
  }
};