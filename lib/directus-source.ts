import { readItems } from '@directus/sdk';
import { isPublishedStatus } from './status-helpers';
import { directus, ensureAuthenticated, type DirectusArticle } from './directus-client';
import { getDirectusUrl } from './env-config';

// Re-export the helper function for backward compatibility
export { isPublishedStatus } from './status-helpers';

// Re-export DirectusArticle as Article for backward compatibility
export type Article = DirectusArticle;

export interface ProcessedArticle {
  id: string;
  name: string;
  title?: string; // Keep as alias for backward compatibility
  description?: string;
  htmlContent: string; // Use raw HTML instead of markdown
  slug: string;
  status: string;
  category?: Category;
  pdf?: string; // PDF file reference
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
    console.log('[directus-source.ts] getArticles called');
    
    // Check if we're in a build environment without proper access
    if (process.env.NODE_ENV === 'production' && !process.env.PRODUCTION_DIRECTUS_TOKEN && !process.env.PRODUCTION_DIRECTUS_EMAIL) {
      console.log('[directus-source.ts] Build environment detected without Directus credentials, returning fallback data');
      return getFallbackArticles();
    }
    
    const authenticated = await ensureAuthenticated();
    if (!authenticated) {
      console.log('[directus-source.ts] Not authenticated, returning fallback data');
      return getFallbackArticles();
    }
    
    // First, fetch all categories to create a map
    const categories = await getCategories();
    const categoriesMap = new Map<string, Category>();
    categories.forEach(cat => {
      categoriesMap.set(cat.id, cat);
    });
    
    console.log('[directus-source.ts] Making request to Directus API...');
    console.log('[directus-source.ts] Directus client URL:', (directus as any).url);
    const articles = await directus.request(
      readItems('articles', {
        filter: { 
          slug: { _nnull: true, _nempty: true },
          status: { _in: ['publish', 'published'] }  // Only published articles
        },
        fields: ['id', 'name', 'slug', 'status', 'content', 'category', 'PDF'],
        sort: ['name']
      })
    );

    console.log(`[directus-source.ts] Successfully fetched ${articles.length} articles from Directus`);

    const processedArticles = await Promise.all(
      articles
        .filter(article => {
          // Check for required fields
          if (!article.slug || article.slug === '') {
            console.warn(`Warning: Skipping article ID ${article.id || 'unknown'} - missing required field: slug`);
            return false;
          }
          // Only filter by publish status - content is not required
          return isPublishedStatus(article.status);
        })
        .map(article => processArticle(article, categoriesMap))
    );

    return processedArticles;
  } catch (error) {
    console.error('Error fetching articles from Directus:', error);
    console.log('[directus-source.ts] Returning fallback data due to error');
    return getFallbackArticles();
  }
}

/**
 * Extracts the article slug from a nested path
 * For example: 'part-iii-neighborhood-zoning-districts/article-4-neighborhood-1-zoning-districts' → 'article-4-neighborhood-1-zoning-districts'
 */
function extractArticleSlug(slug: string): string {
  // If it's already a simple slug (no slashes), return as is
  if (!slug.includes('/')) {
    return slug;
  }
  
  // Split by slash and get the last part
  const parts = slug.split('/');
  const lastPart = parts[parts.length - 1];
  
  // If the last part starts with 'article-', use it
  if (lastPart.startsWith('article-')) {
    return lastPart;
  }
  
  // Otherwise, return the original slug
  return slug;
}

/**
 * Generates a nested URL path from a flat article slug
 * Maps articles to their appropriate sections based on article number
 */
function generateNestedPath(articleSlug: string): string {
  // Extract article number from slug
  const match = articleSlug.match(/^article-(\d+)/);
  if (!match) {
    return articleSlug; // Return as-is if no article number found
  }
  
  const articleNumber = parseInt(match[1], 10);
  
  // Map article numbers to their sections
  if (articleNumber >= 1 && articleNumber <= 2) {
    return `part-i-ordinance-introduction/${articleSlug}`;
  } else if (articleNumber === 3) {
    return `part-ii-zoning-introduction/${articleSlug}`;
  } else if (articleNumber >= 4 && articleNumber <= 5) {
    return `part-iii-neighborhood-zoning-districts/${articleSlug}`;
  } else if (articleNumber >= 6 && articleNumber <= 9) {
    return `part-iv-employment-zoning-districts/${articleSlug}`;
  } else if (articleNumber >= 10 && articleNumber <= 13) {
    return `part-v-centers-zoning-districts/${articleSlug}`;
  } else if (articleNumber === 14) {
    return `part-vi-special-purpose-overlay-zoning-districts/${articleSlug}`;
  } else if (articleNumber === 15) {
    return `part-vii-uses/${articleSlug}`;
  } else if (articleNumber >= 16 && articleNumber <= 22) {
    return `part-viii-general-development-zoning-standards/${articleSlug}`;
  } else if (articleNumber >= 23 && articleNumber <= 28) {
    return `part-ix-stormwater/${articleSlug}`;
  } else if (articleNumber >= 29 && articleNumber <= 34) {
    return `part-x-subdivision-streets-other-infrastructure/${articleSlug}`;
  } else if (articleNumber >= 35 && articleNumber <= 37) {
    return `part-xi-administration/${articleSlug}`;
  } else if (articleNumber === 38) {
    return `part-xii-nonconformities/${articleSlug}`;
  } else if (articleNumber === 39) {
    return `part-xiii-enforcement/${articleSlug}`;
  }
  
  // Default: return as-is
  return articleSlug;
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
    
    // Handle empty slug (home page) - get first article from CMS
    if (!slug || slug === '') {
      console.log('Getting first article for homepage');
      
      // Get articles with content only
      const articles = await directus.request(
        readItems('articles', {
          filter: { 
            slug: { _nnull: true, _nempty: true },
            status: { _in: ['publish', 'published'] },
            content: { _nnull: true, _nempty: true } // Only get articles that have content
          },
          fields: ['id', 'name', 'slug', 'status', 'content'],
          limit: 1, // Just get the first one with content
          sort: ['name']
        })
      );
      
      console.log(`Homepage query found ${articles.length} articles with content`);
      
      if (articles.length > 0) {
        const article = articles[0];
        console.log(`Using article as homepage: '${article.name}' (${article.slug})`);
        return await processArticle(article);
      }
      
      console.log('No articles with content found in Directus for homepage');
      return null;
    }
    
    // Extract the actual article slug from the nested path
    let actualSlug = extractArticleSlug(slug);
    
    // If the slug didn't change, it might be a categorized non-article slug like "part-i-ordinance-introduction/test"
    // In this case, just take the last part
    if (actualSlug === slug && slug.includes('/')) {
      const parts = slug.split('/');
      actualSlug = parts[parts.length - 1];
    }
    
    console.log(`[directus-source.ts] Resolving slug: '${slug}' → '${actualSlug}'`);
    console.log('[directus-source.ts] Making article request with client URL:', (directus as any).url);
    
    // Try to include PDF field, but fall back if it's not accessible
    let article;
    try {
      const queryWithPdf = {
        filter: { 
          slug: { _eq: actualSlug, _nnull: true, _nempty: true },
          status: { _in: ['publish', 'published'] }
        },
        fields: ['id', 'name', 'slug', 'status', 'content', 'PDF'],
        limit: 1,
      };
      
      console.log('[directus-source.ts] Trying query with PDF field:', JSON.stringify(queryWithPdf, null, 2));
      
      const articlesWithPdf = await directus.request(
        readItems('articles', queryWithPdf)
      );
      
      article = articlesWithPdf[0];
      console.log('[directus-source.ts] Successfully got article with PDF field');
      
    } catch (pdfError: any) {
      console.log('[directus-source.ts] PDF field not accessible, falling back to basic query:', pdfError.message);
      
      const query = {
        filter: { 
          slug: { _eq: actualSlug, _nnull: true, _nempty: true },
          status: { _in: ['publish', 'published'] }
        },
        fields: ['id', 'name', 'slug', 'status', 'content'],
        limit: 1,
      };
      
      console.log('[directus-source.ts] Query parameters (fallback):', JSON.stringify(query, null, 2));
      
      const articles = await directus.request(
        readItems('articles', query)
      );
      
      article = articles[0];
      
      // Check for PDF using naming convention
      if (article) {
        const pdfPath = await checkPdfExists(actualSlug);
        if (pdfPath) {
          article.pdf = pdfPath;
          console.log('[directus-source.ts] Found PDF via naming convention:', pdfPath);
        }
      }
    }

    if (!article) {
      console.log(`Article with slug '${actualSlug}' (from '${slug}') not found in Directus`);
      return null;
    }
    
    // Only check publish status - content is not required since we have a header component
    if (!isPublishedStatus(article.status as string)) {
      console.log(`Article '${actualSlug}' found but not published (status: ${article.status})`);
      return null;
    }

    console.log(`Successfully fetched article '${actualSlug}' from Directus`);
    return await processArticle(article as unknown as DirectusArticle);
  } catch (error: any) {
    console.error(`Error fetching article '${slug}' from Directus:`, error);
    if (error.errors) {
      console.error('Directus API errors:', JSON.stringify(error.errors, null, 2));
    }
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return null;
  }
}

/**
 * Checks if a PDF exists for the given article slug by testing the URL
 */
async function checkPdfExists(slug: string): Promise<string | null> {
  try {
    const directusUrl = getDirectusUrl();
    const pdfUrl = `${directusUrl}/assets/pdfs/${slug}.pdf`;
    
    // Make a HEAD request to check if the PDF exists
    const response = await fetch(pdfUrl, { 
      method: 'HEAD',
      headers: {
        'Authorization': `Bearer ${process.env.DIRECTUS_TOKEN}`
      }
    });
    
    if (response.ok) {
      return `pdfs/${slug}.pdf`; // Return relative path
    }
    
    return null;
  } catch (error) {
    console.log(`No PDF found for ${slug}:`, error);
    return null;
  }
}

/**
 * Processes a raw article from Directus using the raw HTML content directly
 */
async function processArticle(article: Article, categoriesMap?: Map<string, Category>): Promise<ProcessedArticle> {
  try {
    // Provide fallback for older records: name ?? title ?? 'Untitled'
    const title = article.name ?? article.title ?? 'Untitled';
    
    // Use the raw HTML content directly - no conversion needed
    const htmlContent = article.content || '';
    
    // Handle PDF field - can be uppercase from Directus
    let pdfValue: string | undefined;
    if (article.PDF) {
      // Handle different PDF field formats
      if (typeof article.PDF === 'string') {
        pdfValue = article.PDF;
      } else if (article.PDF && typeof article.PDF === 'object' && 'id' in article.PDF) {
        // It's a file object reference
        pdfValue = article.PDF.id;
      }
    } else if (article.pdf) {
      pdfValue = article.pdf;
    }
    
    // Handle category - can be either a string ID or an object with key
    let categoryData: Category | undefined;
    let categoryId: string | undefined;
    
    if (article.category) {
      // Handle both string UUID and object with key
      if (typeof article.category === 'string') {
        categoryId = article.category;
        console.log(`[processArticle] Found category ID (string): ${categoryId}`);
      } else if (typeof article.category === 'object' && 'key' in article.category) {
        categoryId = article.category.key;
        console.log(`[processArticle] Found category ID (object key): ${categoryId}`);
      } else {
        console.log(`[processArticle] Unexpected category type:`, typeof article.category, article.category);
      }
      
      if (categoryId) {
        if (categoriesMap && categoriesMap.has(categoryId)) {
          categoryData = categoriesMap.get(categoryId);
          console.log(`[processArticle] Found category in map: ${categoryData?.name}`);
        } else {
          // If we don't have a categories map, we need to fetch the category
          try {
            const categories = await getCategories();
            const foundCategory = categories.find(cat => cat.id === categoryId);
            categoryData = foundCategory;
            console.log(`[processArticle] Found category via fetch: ${categoryData?.name}`);
          } catch (error) {
            console.error('Error fetching category:', error);
          }
        }
      }
    }
    
    if (!categoryData) {
      console.log(`[processArticle] Article "${title}" has no valid category`);
    }
    
    return {
      id: article.id || '',
      name: title,
      title: title,
      description: '',
      htmlContent,
      slug: article.slug || '',
      status: article.status || 'draft',
      pdf: pdfValue,
      category: categoryData,
    };
  } catch (error) {
    console.error(`Error processing article ID ${article.id || 'unknown'}:`, error);
    // Return a fallback processed article with empty content
    const title = article.name ?? article.title ?? 'Untitled';
    return {
      id: article.id || '',
      name: title,
      title: title,
      description: '',
      htmlContent: '<p><em>Content processing failed</em></p>',
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
    // Check if we're in a build environment without proper access
    if (process.env.NODE_ENV === 'production' && !process.env.PRODUCTION_DIRECTUS_TOKEN && !process.env.PRODUCTION_DIRECTUS_EMAIL) {
      console.log('[directus-source.ts] Build environment detected without Directus credentials, returning fallback categories');
      return getFallbackCategories();
    }
    
    const authenticated = await ensureAuthenticated();
    if (!authenticated) {
      return getFallbackCategories();
    }
    
    const categories = await directus.request(
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
    return getFallbackCategories();
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
    
    // First, fetch all categories to create a map
    const categories = await getCategories();
    const categoriesMap = new Map<string, Category>();
    categories.forEach(cat => {
      categoriesMap.set(cat.id, cat);
    });
    
    const articles = await directus.request(
      readItems('articles', {
        filter: { 
          slug: { _nnull: true, _nempty: true },
          status: { _in: ['publish', 'published'] }  // Only published articles
        },
        fields: ['id', 'name', 'slug', 'status', 'content', 'category', 'order', 'PDF'],
        sort: ['order', 'name'],
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

      const processedArticle = await processArticle(article, categoriesMap);
      
      // Extract category ID from the category field
      // The category field is a JSON object with key and collection
      const categoryId = (article.category as any)?.key || 'uncategorized';
      
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
    
    const articles = await directus.request(
      readItems('articles', {
        filter: { 
          slug: { _nnull: true, _nempty: true },
          status: { _in: ['publish', 'published'] }  // Only published articles
        },
        fields: ['id', 'slug', 'status']
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
      .map(article => {
        // Generate nested path from flat slug
        const nestedPath = generateNestedPath(article.slug!);
        return { slug: nestedPath.split('/').filter(Boolean) };
      });

    console.log(`Generated ${validParams.length} static params from Directus articles`);
    console.log('Sample params:', validParams.slice(0, 3));
    return validParams;
  } catch (error) {
    console.error('Error generating article params from Directus:', error);
    return [];
  }
}

/**
 * Provides fallback data when Directus is not available during build
 */
function getFallbackArticles(): ProcessedArticle[] {
  console.log('[directus-source.ts] Using fallback articles data');
  return [
    {
      id: 'fallback-1',
      name: 'Charlotte Unified Development Ordinance - Build Error',
      title: 'Charlotte Unified Development Ordinance - Build Error',
      description: 'This is a fallback page displayed when the build cannot connect to the content management system.',
      htmlContent: `
        <div style="padding: 2rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; background-color: #fef3cd; margin: 1rem 0;">
          <h2 style="color: #d97706; margin-top: 0;">⚠️ Build Environment Notice</h2>
          <p>This application requires access to the Charlotte UDO content management system during the build process. The build environment cannot currently access the CMS.</p>
          <p><strong>For production deployment:</strong> Please ensure the following environment variables are configured in your Webflow Cloud project settings:</p>
          <ul>
            <li><code>PRODUCTION_DIRECTUS_URL</code></li>
            <li><code>PRODUCTION_DIRECTUS_TOKEN</code></li>
            <li><code>DEPLOYMENT_ENV=production</code></li>
          </ul>
          <p>Once properly configured, the application will display the full Charlotte UDO content.</p>
        </div>
      `,
      slug: 'build-error-notice',
      status: 'published',
    }
  ];
}

/**
 * Provides fallback categories when Directus is not available
 */
function getFallbackCategories(): Category[] {
  return [
    {
      id: 'fallback',
      name: 'Build Environment',
      slug: 'build-environment',
      description: 'Fallback category for build environment',
      order: 1,
    }
  ];
}

export interface SiteSetting {
  id: string;
  key: string;
  value?: string;
  description?: string;
  image?: string;
}

export interface GlobalSettings {
  id: number;
  user_updated?: string | null;
  date_updated?: string | null;
  logo?: string;
}

/**
 * Fetches site settings from Directus
 */
export async function getSiteSettings(): Promise<SiteSetting[]> {
  try {
    const authenticated = await ensureAuthenticated();
    if (!authenticated) {
      console.log('[directus-source.ts] Not authenticated, returning empty settings');
      return [];
    }
    
    const settings = await directus.request(
      readItems('settings', {
        fields: ['id', 'key', 'value', 'description', 'image']
      })
    );
    
    console.log(`[directus-source.ts] Successfully fetched ${settings.length} settings from Directus`);
    return settings;
  } catch (error) {
    console.error('Error fetching settings from Directus:', error);
    return [];
  }
}

/**
 * Fetches a specific site setting by key
 */
export async function getSiteSetting(key: string): Promise<SiteSetting | null> {
  try {
    const authenticated = await ensureAuthenticated();
    if (!authenticated) {
      console.log(`[directus-source.ts] Not authenticated, cannot fetch setting: ${key}`);
      return null;
    }
    
    const settings = await directus.request(
      readItems('settings', {
        filter: { key: { _eq: key } },
        fields: ['id', 'key', 'value', 'description', 'image'],
        limit: 1
      })
    );
    
    const setting = settings[0] || null;
    console.log(`[directus-source.ts] Fetched setting ${key}:`, setting ? 'found' : 'not found');
    return setting;
  } catch (error) {
    console.error(`Error fetching setting ${key} from Directus:`, error);
    return null;
  }
}

/**
 * Gets the site logo URL from Directus global settings
 */
export async function getSiteLogo(): Promise<string | null> {
  try {
    const baseUrl = getDirectusUrl();
    
    // Use the public API since global_settings is publicly accessible
    const response = await fetch(`${baseUrl}/items/global_settings`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('[getSiteLogo] Failed to fetch global settings:', response.status, response.statusText);
      return null;
    }
    
    const result = await response.json();
    const globalSettings = result.data as GlobalSettings;
    
    if (globalSettings && globalSettings.logo) {
      const logoUrl = `${baseUrl}/assets/${globalSettings.logo}`;
      console.log('[getSiteLogo] Logo URL:', logoUrl);
      return logoUrl;
    }
    
    console.log('[getSiteLogo] No logo found in global settings');
    return null;
  } catch (error) {
    console.error('[getSiteLogo] Error getting site logo:', error);
    return null;
  }
}
