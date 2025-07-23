import { config } from 'dotenv';
import { resolve } from 'path';
import { unifiedSource } from '../lib/unified-source';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

async function verifyTestArticle() {
  try {
    console.log('Verifying test article in categories...\n');

    // Get categories with articles
    const categoriesWithArticles = await unifiedSource.getCategoriesWithArticles();
    
    console.log(`Total categories: ${categoriesWithArticles.length}`);
    
    // Look for Part II category specifically
    const partIICategory = categoriesWithArticles.find(cat => 
      cat.slug === 'part-ii-zoning-introduction' || 
      cat.name.includes('Part II')
    );
    
    if (partIICategory) {
      console.log(`\nFound ${partIICategory.name}:`);
      console.log(`- Slug: ${partIICategory.slug}`);
      console.log(`- Articles count: ${partIICategory.articles.length}`);
      console.log('- Articles:');
      partIICategory.articles.forEach(article => {
        console.log(`  * ${article.name} (${article.slug}) -> ${article.url}`);
      });
      
      // Check if test article is in this category
      const testArticle = partIICategory.articles.find(a => 
        a.slug === 'test' || a.name === 'test'
      );
      
      if (testArticle) {
        console.log('\n✅ SUCCESS: Test article found in Part II category!');
        console.log(`   URL: ${testArticle.url}`);
      } else {
        console.log('\n❌ FAIL: Test article NOT found in Part II category');
      }
    } else {
      console.log('\n❌ FAIL: Part II category not found');
    }
    
    // Also check uncategorized
    const uncategorized = categoriesWithArticles.find(cat => cat.slug === 'uncategorized');
    if (uncategorized && uncategorized.articles.length > 0) {
      console.log('\nUncategorized articles:');
      uncategorized.articles.forEach(article => {
        console.log(`- ${article.name} (${article.slug})`);
      });
    }

  } catch (error) {
    console.error('Error verifying test article:', error);
  }
}

// Run the verification
verifyTestArticle();