const { config: loadEnv } = require('dotenv');

// Load environment variables
loadEnv({ path: '.env.local' });

// Import the unified source
const { unifiedSource } = require('../lib/unified-source');

async function testFrontendCategories() {
  console.log('Testing frontend getCategoriesWithArticles method...');
  
  try {
    console.log('Environment variables:');
    console.log('- DIRECTUS_URL:', process.env.DIRECTUS_URL);
    console.log('- DIRECTUS_TOKEN:', process.env.DIRECTUS_TOKEN ? 'set' : 'not set');
    
    console.log('\n--- Calling unifiedSource.getCategoriesWithArticles() ---');
    const categoriesWithArticles = await unifiedSource.getCategoriesWithArticles();
    
    console.log(`\nFound ${categoriesWithArticles.length} categories with articles:`);
    
    categoriesWithArticles.forEach((category: any) => {
      console.log(`\n${category.name} (${category.slug}): ${category.articles.length} articles`);
      category.articles.forEach((article: any) => {
        console.log(`  - ${article.name} (${article.slug}) -> ${article.url}`);
      });
    });
    
    // Look for "Part I. Ordinance Introduction" specifically
    const partICategory = categoriesWithArticles.find((cat: any) => 
      cat.name === 'Part I. Ordinance Introduction'
    );
    
    if (partICategory) {
      console.log('\n--- Part I. Ordinance Introduction Details ---');
      console.log('Category found:', partICategory.name);
      console.log('Articles count:', partICategory.articles.length);
      
      // Look for the test article
      const testArticle = partICategory.articles.find((art: any) => 
        art.name === 'test' || art.slug === 'test'
      );
      
      if (testArticle) {
        console.log('Test article found:', testArticle);
      } else {
        console.log('Test article NOT found in this category');
        console.log('Available articles:', partICategory.articles.map((a: any) => a.name));
      }
    } else {
      console.log('\n--- Part I. Ordinance Introduction NOT FOUND ---');
      console.log('Available categories:', categoriesWithArticles.map((c: any) => c.name));
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testFrontendCategories().catch(console.error); 