import { createDirectus, readItems, readItem, rest } from '@directus/sdk';

// Define types for your collections
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sort?: number;
  date_created?: string;
  date_updated?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  featured_image?: string;
  status: 'draft' | 'published' | 'archived';
  date_created?: string;
  date_updated?: string;
  date_published?: string;
  author?: string;
  category?: string | Category;
  tags?: string[];
  sort?: number;
}

// Define the schema interface for type safety
interface DirectusSchema {
  categories: Category[];
  articles: Article[];
}

// Use environment variables with a single fallback
// NEXT_PUBLIC_DIRECTUS_URL for client-side, DIRECTUS_URL for server-side
const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || process.env.DIRECTUS_URL || 'https://admin.charlotteudo.org';

console.log('[src/lib/data.ts] Directus URL:', directusUrl);
console.log('[src/lib/data.ts] NEXT_PUBLIC_DIRECTUS_URL:', process.env.NEXT_PUBLIC_DIRECTUS_URL);
console.log('[src/lib/data.ts] DIRECTUS_URL:', process.env.DIRECTUS_URL);
console.log('[src/lib/data.ts] Environment:', typeof window === 'undefined' ? 'server' : 'client');

// Create the Directus client
const directus = createDirectus<DirectusSchema>(directusUrl).with(rest());

/**
 * Get all categories from Directus
 * @returns Promise<Category[]> - Array of all categories
 */
export async function getAllCategories(): Promise<Category[]> {
  try {
    const categories = await directus.request(
      readItems('categories', {
        sort: ['sort', 'name'],
        filter: {
          // You can add filters here if needed
          // status: { _eq: 'published' }
        }
      })
    );
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }
}

/**
 * Get all articles from Directus
 * @returns Promise<Article[]> - Array of all articles
 */
export async function getAllArticles(): Promise<Article[]> {
  try {
    const articles = await directus.request(
      readItems('articles', {
        sort: ['-date_published', '-date_created'],
        filter: {
          status: { _eq: 'published' }
        },
        fields: [
          'id',
          'title',
          'slug',
          'excerpt',
          'featured_image',
          'status',
          'date_created',
          'date_updated',
          'date_published',
          'author',
          { category: ['id', 'name', 'slug'] },
          'tags',
          'sort'
        ]
      })
    );
    return articles;
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw new Error('Failed to fetch articles');
  }
}

/**
 * Get a single article by slug from Directus
 * @param slug - The article slug to search for
 * @returns Promise<Article | null> - The article or null if not found
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const articles = await directus.request(
      readItems('articles', {
        filter: {
          slug: { _eq: slug },
          status: { _eq: 'published' }
        },
        fields: [
          'id',
          'title',
          'slug',
          'content',
          'excerpt',
          'featured_image',
          'status',
          'date_created',
          'date_updated',
          'date_published',
          'author',
          { category: ['id', 'name', 'slug'] },
          'tags',
          'sort'
        ],
        limit: 1
      })
    );

    return articles.length > 0 ? articles[0] : null;
  } catch (error) {
    console.error(`Error fetching article with slug "${slug}":`, error);
    throw new Error(`Failed to fetch article with slug "${slug}"`);
  }
}

/**
 * Alternative method using readItem if you prefer to fetch by ID
 * Get a single article by ID from Directus
 * @param id - The article ID
 * @returns Promise<Article> - The article
 */
export async function getArticleById(id: string): Promise<Article> {
  try {
    const article = await directus.request(
      readItem('articles', id, {
        fields: [
          'id',
          'title',
          'slug',
          'content',
          'excerpt',
          'featured_image',
          'status',
          'date_created',
          'date_updated',
          'date_published',
          'author',
          { category: ['id', 'name', 'slug'] },
          'tags',
          'sort'
        ]
      })
    );
    return article;
  } catch (error) {
    console.error(`Error fetching article with ID "${id}":`, error);
    throw new Error(`Failed to fetch article with ID "${id}"`);
  }
}

/**
 * Get articles by category
 * @param categorySlug - The category slug to filter by
 * @returns Promise<Article[]> - Array of articles in the category
 */
export async function getArticlesByCategory(categorySlug: string): Promise<Article[]> {
  try {
    const articles = await directus.request(
      readItems('articles', {
        sort: ['-date_published', '-date_created'],
        filter: {
          status: { _eq: 'published' },
          category: {
            slug: { _eq: categorySlug }
          }
        },
        fields: [
          'id',
          'title',
          'slug',
          'excerpt',
          'featured_image',
          'status',
          'date_created',
          'date_updated',
          'date_published',
          'author',
          { category: ['id', 'name', 'slug'] },
          'tags',
          'sort'
        ]
      })
    );
    return articles;
  } catch (error) {
    console.error(`Error fetching articles for category "${categorySlug}":`, error);
    throw new Error(`Failed to fetch articles for category "${categorySlug}"`);
  }
}
