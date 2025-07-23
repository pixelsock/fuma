import { config } from 'dotenv';
import { resolve } from 'path';
import { unifiedSource } from '../lib/unified-source';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

async function finalVerify() {
  try {
    console.log('Final verification of categories and articles...\n');

    // Get categories with articles
    const categoriesWithArticles = await unifiedSource.getCategoriesWithArticles();
    
    console.log(`Total categories with articles: ${categoriesWithArticles.length}`);
    
    // Display all categories and their articles
    categoriesWithArticles.forEach(category => {
      console.log(`\n${category.name} (${category.slug}):`);
      console.log(`  Total articles: ${category.articles.length}`);
      category.articles.forEach(article => {
        console.log(`  - ${article.name} (${article.slug})`);
        if (article.slug === 'test' || article.name === 'test') {
          console.log(`    ✅ TEST ARTICLE FOUND HERE!`);
        }
      });
    });

    // Summary
    const totalArticles = categoriesWithArticles.reduce((sum, cat) => sum + cat.articles.length, 0);
    console.log(`\n--- Summary ---`);
    console.log(`Total categories: ${categoriesWithArticles.length}`);
    console.log(`Total articles: ${totalArticles}`);
    
    // Check for test article
    let testFound = false;
    categoriesWithArticles.forEach(category => {
      if (category.articles.some(a => a.slug === 'test' || a.name === 'test')) {
        testFound = true;
      }
    });
    
    if (testFound) {
      console.log('\n✅ SUCCESS: Test article is properly categorized!');
    } else {
      console.log('\n❌ FAIL: Test article not found in any category');
    }

  } catch (error) {
    console.error('Error in final verification:', error);
  }
}

// Run the verification
finalVerify();