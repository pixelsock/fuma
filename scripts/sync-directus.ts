import { createDirectus, rest, readItems, authentication, login } from '@directus/sdk';
import { markdownToMdx } from '../utils/prosemirror-simple';
import TurndownService from 'turndown';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const CONTENT_DIR = path.join(process.cwd(), 'content', 'docs');

// Directus configuration
const directusUrl = process.env.DIRECTUS_URL || 'https://admin.charlotteudo.org';
const directusEmail = process.env.DIRECTUS_EMAIL || 'nick@stump.works';
const directusPassword = process.env.DIRECTUS_PASSWORD || 'admin';

const directusClient = createDirectus(directusUrl)
  .with(rest())
  .with(authentication());

interface Article {
  id: string;
  name: string;
  title?: string;
  content: string; // HTML content
  slug: string;
  status: string;
  category: any;
  order?: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order?: number;
  color?: string;
}

/**
 * Syncs Directus content to MDX files in the content directory
 */
async function syncDirectusContent() {
  console.log('🔄 Starting Directus content sync...');
  console.log(`📡 Connecting to Directus at ${directusUrl}`);
  
  try {
    // Authenticate with Directus
    await directusClient.request(
      login({
        email: directusEmail,
        password: directusPassword,
      })
    );
    console.log('✅ Successfully authenticated with Directus');
    
    // Create content directory if it doesn't exist
    await fs.mkdir(CONTENT_DIR, { recursive: true });
    
    // Fetch categories
    const categories = await directusClient.request<Category[]>(
      readItems('article_categories', {
        fields: ['id', 'name', 'slug', 'description', 'order', 'color'],
        sort: ['order', 'name'],
      })
    );
    
    // Fetch articles - simplified query
    const articles = await directusClient.request<Article[]>(
      readItems('articles', {
        filter: { 
          status: { _in: ['publish', 'published'] }
        },
        fields: ['id', 'name', 'slug', 'status', 'content', 'category'],
      })
    );
    
    console.log(`📁 Found ${categories.length} categories and ${articles.length} articles`);
    
    // Group articles by category
    const categorizedArticles = new Map<string, Article[]>();
    for (const article of articles) {
      const categoryId = article.category?.key || 'uncategorized';
      if (!categorizedArticles.has(categoryId)) {
        categorizedArticles.set(categoryId, []);
      }
      categorizedArticles.get(categoryId)!.push(article);
    }
    
    // Create a directory for each category
    for (const category of categories) {
      const categorySlug = category.slug || category.name.toLowerCase().replace(/\s+/g, '-');
      const categoryDir = path.join(CONTENT_DIR, categorySlug);
      await fs.mkdir(categoryDir, { recursive: true });
      
      // Create category index file (meta.json)
      const metaContent = {
        title: category.name,
        description: category.description || '',
        order: category.order || 999
      };
      
      await fs.writeFile(
        path.join(categoryDir, 'meta.json'),
        JSON.stringify(metaContent, null, 2)
      );
      
      console.log(`📁 Created category: ${category.name}`);
      
      // Create MDX files for articles in this category
      const articles = categorizedArticles.get(category.id) || [];
      for (const article of articles) {
        try {
          // Generate clean filename from article slug
          const articleFilename = article.slug.split('/').pop() + '.mdx';
          const articlePath = path.join(categoryDir, articleFilename);
          
          // Convert HTML content to Markdown
          const turndownService = new TurndownService({
            headingStyle: 'atx',
            bulletListMarker: '-',
            codeBlockStyle: 'fenced',
            emDelimiter: '*',
          });
          const markdownContent = turndownService.turndown(article.content || '');
          
          // Convert to MDX with frontmatter
          const mdxContent = markdownToMdx(markdownContent, {
            addFrontmatter: {
              title: article.name || article.title || 'Untitled',
            },
          });
          
          await fs.writeFile(articlePath, mdxContent);
          console.log(`  📄 Created article: ${article.name}`);
        } catch (error) {
          console.error(`  ❌ Error processing article ${article.name}:`, error);
        }
      }
    }
    
    // Handle uncategorized articles
    const categorizedArticleIds = new Set(
      Array.from(categorizedArticles.values()).flat().map(a => a.id)
    );
    
    const uncategorizedArticles = articles.filter(
      article => !categorizedArticleIds.has(article.id) && article.category?.key === 'uncategorized'
    );
    
    if (uncategorizedArticles.length > 0) {
      const uncategorizedDir = path.join(CONTENT_DIR, 'uncategorized');
      await fs.mkdir(uncategorizedDir, { recursive: true });
      
      // Create meta.json for uncategorized
      await fs.writeFile(
        path.join(uncategorizedDir, 'meta.json'),
        JSON.stringify({
          title: 'Uncategorized',
          description: 'Articles without a category',
          order: 9999
        }, null, 2)
      );
      
      for (const article of uncategorizedArticles) {
        try {
          const articleFilename = article.slug.split('/').pop() + '.mdx';
          const articlePath = path.join(uncategorizedDir, articleFilename);
          
          // Convert HTML content to Markdown
          const turndownService = new TurndownService({
            headingStyle: 'atx',
            bulletListMarker: '-',
            codeBlockStyle: 'fenced',
            emDelimiter: '*',
          });
          const markdownContent = turndownService.turndown(article.content || '');
          
          // Convert to MDX with frontmatter
          const mdxContent = markdownToMdx(markdownContent, {
            addFrontmatter: {
              title: article.name || article.title || 'Untitled',
            },
          });
          
          await fs.writeFile(articlePath, mdxContent);
          console.log(`  📄 Created uncategorized article: ${article.name}`);
        } catch (error) {
          console.error(`  ❌ Error processing uncategorized article ${article.name}:`, error);
        }
      }
    }
    
    console.log('✅ Directus content sync completed successfully!');
    
  } catch (error) {
    console.error('❌ Error syncing Directus content:', error);
    process.exit(1);
  }
}

// Run the sync
syncDirectusContent();