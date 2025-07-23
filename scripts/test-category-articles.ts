import { config } from 'dotenv';
import { directusOnlySource } from '../lib/directus-only-source';

// Load environment variables
config({ path: '.env.local' });

async function testCategoryArticles() {
  console.log('Testing category-article relationships...\n');
  
  try {
    // Get categories with articles
    const categoriesWithArticles = await directusOnlySource.getCategoriesWithArticles();
    
    console.log(`Found ${categoriesWithArticles.length} categories with articles:\n`);
    
    categoriesWithArticles.forEach(category => {
      console.log(`Category: ${category.name} (${category.slug})`);
      console.log(`  Articles: ${category.articles.length}`);
      
      category.articles.forEach(article => {
        console.log(`    - ${article.name} (${article.slug})`);
        console.log(`      URL: ${article.url}`);
      });
      
      console.log('');
    });
    
    // Check if any articles are uncategorized
    const uncategorized = categoriesWithArticles.find(cat => cat.slug === 'uncategorized');
    if (uncategorized && uncategorized.articles.length > 0) {
      console.log('⚠️  WARNING: Found uncategorized articles:');
      uncategorized.articles.forEach(article => {
        console.log(`  - ${article.name}`);
      });
    } else {
      console.log('✅ All articles are properly categorized!');
    }
    
  } catch (error) {
    console.error('Error testing categories:', error);
  }
}

// Run the test
testCategoryArticles();