import { docs } from '@/.source';
import { loader } from 'fumadocs-core/source';
import { getArticleBySlug, getArticles, generateArticleParams, getCategories, getCategorizedArticles } from './directus-source';
import { compileMDX } from '@fumadocs/mdx-remote';
import { remarkHeading, remarkStructure } from 'fumadocs-core/mdx-plugins';

// Create source for FumaDocs MDX files
const mdxSource = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
});

// For pages that need sync access, export the basic mdx source
export const source = mdxSource;

// Unified source that combines FumaDocs and Directus content
export const unifiedSource = {
  ...mdxSource,
  
  async getPage(slugs: string[]) {
    // First try to get from FumaDocs MDX files
    try {
      const page = mdxSource.getPage(slugs);
      if (page) {
        return page;
      }
    } catch (error) {
      // Continue to Directus fallback
    }
    
    // If not found, try Directus
    try {
      const slug = slugs?.join('/') || '';
      const article = await getArticleBySlug(slug);
      
      if (article) {
        // Debug: Log the MDX content to check for headings
        console.log('MDX content preview:', article.mdxContent.substring(0, 500));
        
        // Convert Directus article to FumaDocs page format using fumadocs-mdx
        const compiled = await compileMDX({
          source: article.mdxContent,
          components: {},
          mdxOptions: {
            remarkPlugins: [
              remarkHeading,      // Process with fumadocs heading plugin
              remarkStructure,    // And structure plugin
            ],
            remarkImageOptions: false, // Disable image size fetching
          },
        });
        
        // Debug: Log the compiled result to see what's available
        console.log('Compiled MDX result keys:', Object.keys(compiled));
        console.log('Compiled TOC:', compiled.toc);
        
        // Extract TOC from compiled result (fumadocs-mdx provides this automatically)
        const toc = compiled.toc || [];
        
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
            body: compiled.body,
            toc: toc,
            structuredData: [],
            _exports: {},
            content: article.mdxContent,
            full: false,
            ...compiled.frontmatter,
          },
          url: `/docs/${slug}`,
          slugs: slugs,
        };
      }
    } catch (error) {
      console.error('Error fetching from Directus:', error);
    }
    
    return null;
  },
  
  async getAllPages() {
    // Get all pages from both sources
    const mdxPages = mdxSource.getPages();
    
    try {
      const directusArticles = await getArticles();
      const directusPages = directusArticles.map(article => ({
        file: {
          path: `docs/${article.slug}.mdx`,
          name: article.name,
          flattenedPath: article.slug,
        },
        data: {
          title: article.name,
          description: article.description,
          body: article.mdxContent,
        },
        url: `/docs/${article.slug}`,
      }));
      
      return [...mdxPages, ...directusPages];
    } catch (error) {
      console.error('Error fetching Directus articles:', error);
      return mdxPages;
    }
  },
  
  async generateParams() {
    // Generate params for both sources
    const mdxParams = mdxSource.generateParams();
    
    try {
      const directusParams = await generateArticleParams();
      return [...mdxParams, ...directusParams];
    } catch (error) {
      console.error('Error generating Directus params:', error);
      return mdxParams;
    }
  },
};
