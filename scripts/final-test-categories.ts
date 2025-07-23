import { config } from 'dotenv';
import { resolve } from 'path';
import { unifiedSource } from '../lib/unified-source';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

async function finalTest() {
  try {
    console.log('Final test of category and article implementation...\n');

    // Get categories with articles
    const categoriesWithArticles = await unifiedSource.getCategoriesWithArticles();
    
    console.log(`Found ${categoriesWithArticles.length} categories with articles:\n`);
    
    // Display all categories and their articles
    let totalArticles = 0;
    let testArticleFound = false;
    
    categoriesWithArticles.forEach(category => {
      console.log(`${category.name}`);
      console.log(`- Slug: ${category.slug}`);
      console.log(`- Articles: ${category.articles.length}`);
      
      category.articles.forEach(article => {
        console.log(`  • ${article.name}`);
        if (article.slug === 'test' || article.name.toLowerCase() === 'test') {
          testArticleFound = true;
          console.log(`    ✅ TEST ARTICLE FOUND!`);
        }
      });
      
      totalArticles += category.articles.length;
      console.log('');
    });

    console.log(`--- Summary ---`);
    console.log(`Total categories: ${categoriesWithArticles.length}`);
    console.log(`Total articles: ${totalArticles}`);
    
    if (testArticleFound) {
      console.log('\n✅ SUCCESS: Test article is now properly categorized!');
    } else {
      console.log('\n⚠️  Test article not found - it may not be published or may not have content');
    }

  } catch (error) {
    console.error('Error in final test:', error);
  }
}

// Run the test
finalTest();