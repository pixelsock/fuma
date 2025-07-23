import { config } from 'dotenv';
import { resolve } from 'path';
import { getArticles, getCategories, getCategorizedArticles } from '../lib/directus-source';
import { unifiedSource } from '../lib/unified-source';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

async function testCategoryFix() {
  try {
    console.log('Testing category fix...\n');

    // Test 1: Get all categories
    console.log('--- Testing getCategories() ---');
    const categories = await getCategories();
    console.log(`Found ${categories.length} categories`);
    categories.forEach(cat => {
      console.log(`- ${cat.name} (ID: ${cat.id})`);
    });

    // Test 2: Get all articles
    console.log('\n--- Testing getArticles() ---');
    const articles = await getArticles();
    console.log(`Found ${articles.length} articles`);
    
    // Look for test article
    const testArticle = articles.find(a => a.slug === 'test' || a.name.toLowerCase().includes('test'));
    if (testArticle) {
      console.log('\nFound test article:');
      console.log(`- Name: ${testArticle.name}`);
      console.log(`- Slug: ${testArticle.slug}`);
      console.log(`- Category:`, testArticle.category);
    }

    // Test 3: Get categorized articles
    console.log('\n--- Testing getCategorizedArticles() ---');
    const categorizedArticles = await getCategorizedArticles();
    console.log(`Found ${categorizedArticles.size} categories with articles`);
    
    categorizedArticles.forEach((articles, categoryId) => {
      const category = categories.find(c => c.id === categoryId);
      console.log(`\n${category?.name || 'Uncategorized'} (${categoryId}):`);
      articles.forEach(article => {
        console.log(`  - ${article.name} (${article.slug})`);
      });
    });

    // Test 4: Get categories with articles using unified source
    console.log('\n--- Testing unifiedSource.getCategoriesWithArticles() ---');
    const categoriesWithArticles = await unifiedSource.getCategoriesWithArticles();
    console.log(`Found ${categoriesWithArticles.length} categories with articles`);
    
    categoriesWithArticles.forEach(category => {
      console.log(`\n${category.name} (${category.slug}):`);
      console.log(`  Articles: ${category.articles.length}`);
      category.articles.forEach(article => {
        console.log(`  - ${article.name} -> ${article.url}`);
      });
    });

    // Look specifically for the test article
    console.log('\n--- Looking for test article in categories ---');
    let found = false;
    categoriesWithArticles.forEach(category => {
      const testInCategory = category.articles.find(a => a.slug === 'test' || a.name.toLowerCase().includes('test'));
      if (testInCategory) {
        found = true;
        console.log(`Found test article in category: ${category.name}`);
        console.log(`URL: ${testInCategory.url}`);
      }
    });
    
    if (!found) {
      console.log('Test article not found in any category!');
    }

  } catch (error) {
    console.error('Error testing category fix:', error);
  }
}

// Run the test
testCategoryFix();