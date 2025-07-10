import { createDirectus, rest, readItems, authentication, login } from '@directus/sdk';
import { markdownToMdx } from '@/utils/prosemirror';
import TurndownService from 'turndown';
import { isPublishedStatus } from './status-helpers';

// Directus client configuration
const directusUrl = process.env.DIRECTUS_URL || 'https://admin.charlotteudo.org';
const directusEmail = process.env.DIRECTUS_EMAIL;
const directusPassword = process.env.DIRECTUS_PASSWORD;

const directusClient = createDirectus(directusUrl)
  .with(rest())
  .with(authentication());

// Re-export the helper function for backward compatibility
export { isPublishedStatus } from './status-helpers';

// Authentication helper
let isAuthenticated = false;
async function ensureAuthenticated() {
  if (!directusEmail || !directusPassword) {
    console.warn('Directus credentials not configured. Skipping Directus content.');
    return false;
  }
  
  if (!isAuthenticated) {
    try {
      await directusClient.request(
        login({
          email: directusEmail,
          password: directusPassword,
        })
      );
      isAuthenticated = true;
      console.log('Successfully authenticated with Directus');
    } catch (error) {
      console.error('Failed to authenticate with Directus:', error);
      return false;
    }
  }
  return true;
}

export interface Article {
  id: string;
  name: string;
  title?: string; // Keep as alias for backward compatibility
  description?: string;
  content: string; // HTML content
  slug: string;
  status: string;
  category?: { key: string; name: string } | null;
  order?: number;
}

export interface ProcessedArticle {
  id: string;
  name: string;
  title?: string; // Keep as alias for backward compatibility
  description?: string;
  markdownContent: string;
  mdxContent: string;
  slug: string;
  status: string;
  category?: Category;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order?: number;
  color?: string;
}

/**
 * Fetches all published articles from Directus
 */
export async function getArticles(): Promise<ProcessedArticle[]> {
  try {
    const authenticated = await ensureAuthenticated();
    if (!authenticated) {
      return [];
    }
    
    const articles = await directusClient.request<Article[]>(
      readItems('articles', {
        filter: { 
          slug: { _nnull: true, _nempty: true },
          status: { _in: ['publish', 'published'] }
        },
        fields: ['id', 'name', 'slug', 'status', 'content'],
        sort: ['name'],
      })
    );

    console.log(`Successfully fetched ${articles.length} articles from Directus`);

    return articles
      .filter(article => {
        // Check for required fields
        if (!article.slug || article.slug === '') {
          console.warn(`Warning: Skipping article ID ${article.id || 'unknown'} - missing required field: slug`);
          return false;
        }
        if (!article.content) {
          console.warn(`Warning: Skipping article ID ${article.id || 'unknown'} - missing required field: content`);
          return false;
        }
        return isPublishedStatus(article.status);
      })
      .map(processArticle);
  } catch (error) {
    console.error('Error fetching articles from Directus:', error);
    return [];
  }
}

/**
 * Fetches a single article by slug
 */
export async function getArticleBySlug(slug: string): Promise<ProcessedArticle | null> {
  try {
    const authenticated = await ensureAuthenticated();
    if (!authenticated) {
      return null;
    }
    
    const articles = await directusClient.request<Article[]>(
      readItems('articles', {
        filter: { 
          slug: { _eq: slug, _nnull: true, _nempty: true },
          status: { _in: ['publish', 'published'] }
        },
        fields: ['id', 'name', 'slug', 'status', 'content'],
        limit: 1,
      })
    );

    if (articles.length === 0) {
      console.log(`Article with slug '${slug}' not found in Directus`);
      return null;
    }

    const article = articles[0];
    
    // Check for required fields
    if (!article.content) {
      console.warn(`Warning: Skipping article '${slug}' - missing required field: content`);
      return null;
    }
    
    // Additional client-side check to ensure status is valid
    if (!isPublishedStatus(article.status)) {
      console.log(`Article '${slug}' found but not published (status: ${article.status})`);
      return null;
    }

    console.log(`Successfully fetched article '${slug}' from Directus`);
    return processArticle(article);
  } catch (error) {
    console.error(`Error fetching article '${slug}' from Directus:`, error);
    return null;
  }
}

/**
 * Processes a raw article from Directus by converting ProseMirror content to Markdown/MDX
 */
function processArticle(article: Article): ProcessedArticle {
  try {
    // Provide fallback for older records: name ?? title ?? 'Untitled'
    const title = article.name ?? article.title ?? 'Untitled';
    
    // Convert HTML content to clean Markdown
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
      emDelimiter: '*',
    });
    const markdownContent = turndownService.turndown(article.content || '');
    
    // Convert to MDX with frontmatter for FumaDocs
    const mdxContent = markdownToMdx(markdownContent, {
      addFrontmatter: {
        title: title,
      },
    });
    
    return {
      id: article.id || '',
      name: title,
      title: article.title, // Keep for backward compatibility
      description: '',
      markdownContent,
      mdxContent,
      slug: article.slug || '',
      status: article.status || 'draft',
    };
  } catch (error) {
    console.error(`Error processing article ID ${article.id || 'unknown'}:`, error);
    // Return a fallback processed article with empty content
    const title = article.name ?? article.title ?? 'Untitled';
    return {
      id: article.id || '',
      name: title,
      title: article.title,
      description: '',
      markdownContent: '',
      mdxContent: `---\ntitle: ${title}\n---\n\n*Content processing failed*`,
      slug: article.slug || '',
      status: article.status || 'draft',
    };
  }
}

/**
 * Fetches all categories from Directus
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const authenticated = await ensureAuthenticated();
    if (!authenticated) {
      return [];
    }
    
    const categories = await directusClient.request(
      readItems('article_categories', {
        fields: ['id', 'name', 'slug', 'description', 'order', 'color'],
        sort: ['order', 'name'],
      })
    );

    console.log(`Successfully fetched ${categories.length} categories from Directus`);
    return categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      order: cat.order,
      color: cat.color,
    }));
  } catch (error) {
    console.error('Error fetching categories from Directus:', error);
    return [];
  }
}

/**
 * Fetches articles grouped by category
 */
export async function getCategorizedArticles(): Promise<Map<string, ProcessedArticle[]>> {
  try {
    const authenticated = await ensureAuthenticated();
    if (!authenticated) {
      return new Map();
    }
    
    const articles = await directusClient.request<Article[]>(
      readItems('articles', {
        filter: { 
          slug: { _nnull: true, _nempty: true },
          status: { _in: ['publish', 'published'] }
        },
        fields: ['id', 'name', 'slug', 'status', 'content', 'category', 'order'],
        sort: ['category', 'order', 'name'],
      })
    );

    console.log(`Successfully fetched ${articles.length} articles for categorization from Directus`);

    const categorizedMap = new Map<string, ProcessedArticle[]>();
    
    for (const article of articles) {
      // Check for required fields
      if (!article.slug || article.slug === '' || !article.content) {
        console.warn(`Warning: Skipping article ID ${article.id || 'unknown'} - missing required fields`);
        continue;
      }
      
      if (!isPublishedStatus(article.status)) {
        continue;
      }

      const processedArticle = processArticle(article);
      
      // Extract category ID from the category field
      const categoryId = article.category?.key || 'uncategorized';
      
      if (!categorizedMap.has(categoryId)) {
        categorizedMap.set(categoryId, []);
      }
      
      categorizedMap.get(categoryId)!.push(processedArticle);
    }

    return categorizedMap;
  } catch (error) {
    console.error('Error fetching categorized articles from Directus:', error);
    return new Map();
  }
}

/**
 * Generates static params for all published articles
 */
export async function generateArticleParams(): Promise<{ slug: string[] }[]> {
  try {
    const authenticated = await ensureAuthenticated();
    if (!authenticated) {
      return [];
    }
    
    const articles = await directusClient.request<Pick<Article, 'id' | 'slug' | 'status'>[]>(
      readItems('articles', {
        filter: { 
          slug: { _nnull: true, _nempty: true },
          status: { _in: ['publish', 'published'] }
        },
        fields: ['id', 'slug', 'status'],
      })
    );

    const validParams = articles
      .filter(article => {
        if (!article.slug || article.slug === '') {
          console.warn(`Warning: Skipping article ID ${article.id || 'unknown'} in param generation - missing required field: slug`);
          return false;
        }
        return true;
      })
      .map(article => ({ slug: article.slug!.split('/').filter(Boolean) }));

    console.log(`Generated ${validParams.length} static params from Directus articles`);
    return validParams;
  } catch (error) {
    console.error('Error generating article params from Directus:', error);
    return [];
  }
}
