import { config } from 'dotenv';
import { resolve } from 'path';
import { directus, ensureAuthenticated } from '../lib/directus-client';
import { readItems } from '@directus/sdk';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

async function checkTestArticleRaw() {
  try {
    console.log('Checking test article in raw API response...\n');

    const authenticated = await ensureAuthenticated();
    if (!authenticated) {
      console.log('Not authenticated');
      return;
    }

    // Query articles including test
    const articles = await directus.request(
      readItems('articles', {
        filter: { 
          slug: { _in: ['test', 'article-1-title-purpose-applicability'] },
          status: { _in: ['publish', 'published', 'draft'] }
        },
        fields: ['id', 'name', 'slug', 'status', 'content', 'category', 'PDF'],
        sort: ['name']
      })
    );

    console.log(`Found ${articles.length} articles`);
    
    articles.forEach((article: any) => {
      console.log(`\n--- ${article.name} ---`);
      console.log('ID:', article.id);
      console.log('Slug:', article.slug);
      console.log('Status:', article.status);
      console.log('Has content:', !!article.content);
      console.log('Content length:', article.content?.length || 0);
      console.log('Category:', article.category);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run check
checkTestArticleRaw();