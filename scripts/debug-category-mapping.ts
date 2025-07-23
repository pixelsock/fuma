import { config } from 'dotenv';
import { resolve } from 'path';
import { getArticles, getCategories } from '../lib/directus-source';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

async function debugCategoryMapping() {
  try {
    console.log('Debugging category mapping...\n');

    // Get all categories
    const categories = await getCategories();
    const categoryMap = new Map<string, string>();
    categories.forEach(cat => {
      categoryMap.set(cat.id, cat.name);
    });

    // Get all articles
    const articles = await getArticles();
    
    console.log('Articles with categories:');
    articles.forEach(article => {
      console.log(`\n- ${article.name} (${article.slug})`);
      console.log(`  Status: ${article.status}`);
      console.log(`  Category object:`, article.category);
      if (article.category) {
        console.log(`  Category name: ${article.category.name}`);
        console.log(`  Category ID: ${article.category.id}`);
      }
    });

    // Check specifically for test article
    const testArticle = articles.find(a => a.slug === 'test');
    if (testArticle) {
      console.log('\n--- Test Article Details ---');
      console.log('Name:', testArticle.name);
      console.log('Slug:', testArticle.slug);
      console.log('Status:', testArticle.status);
      console.log('Has content:', !!testArticle.htmlContent);
      console.log('Category:', testArticle.category);
    } else {
      console.log('\n❌ Test article not found in processed articles!');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run debug
debugCategoryMapping();