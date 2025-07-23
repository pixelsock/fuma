import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

async function testCategorySimple() {
  const directusUrl = process.env.DIRECTUS_URL || 'https://admin.charlotteudo.org';
  const directusToken = process.env.DIRECTUS_TOKEN;

  if (!directusToken) {
    console.error('Missing DIRECTUS_TOKEN environment variable');
    process.exit(1);
  }

  try {
    // First, let's check for the test article specifically
    console.log('--- Looking for test article ---');
    const testResponse = await fetch(`${directusUrl}/items/articles?filter[slug][_eq]=test&fields=*`, {
      headers: {
        'Authorization': `Bearer ${directusToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (testResponse.ok) {
      const testData = await testResponse.json();
      if (testData.data.length > 0) {
        const testArticle = testData.data[0];
        console.log('Test article found:');
        console.log(`- Name: ${testArticle.name}`);
        console.log(`- Slug: ${testArticle.slug}`);
        console.log(`- Status: ${testArticle.status}`);
        console.log(`- Category:`, testArticle.category);
        
        // Get the category details
        if (testArticle.category?.key) {
          const categoryResponse = await fetch(`${directusUrl}/items/article_categories/${testArticle.category.key}`, {
            headers: {
              'Authorization': `Bearer ${directusToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (categoryResponse.ok) {
            const categoryData = await categoryResponse.json();
            console.log(`- Category Name: ${categoryData.data.name}`);
            console.log(`- Category Slug: ${categoryData.data.slug}`);
          }
        }
      } else {
        console.log('Test article not found');
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the test
testCategorySimple();