import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

async function testDirectusAPI() {
  const directusUrl = process.env.DIRECTUS_URL || 'https://admin.charlotteudo.org';
  const directusToken = process.env.DIRECTUS_TOKEN;

  if (!directusToken) {
    console.error('Missing DIRECTUS_TOKEN environment variable');
    process.exit(1);
  }

  console.log('Testing Directus API connection...');
  console.log('URL:', directusUrl);

  try {
    // Test 1: Fetch articles with categories
    console.log('\n--- Fetching Articles with Categories ---');
    const articlesResponse = await fetch(`${directusUrl}/items/articles?fields=id,name,slug,status,category.*,order&limit=10`, {
      headers: {
        'Authorization': `Bearer ${directusToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!articlesResponse.ok) {
      console.error('Articles request failed:', articlesResponse.status, articlesResponse.statusText);
      const error = await articlesResponse.text();
      console.error('Error details:', error);
    } else {
      const articlesData = await articlesResponse.json();
      console.log('Articles count:', articlesData.data.length);
      console.log('\nSample articles with categories:');
      articlesData.data.forEach((article: any) => {
        console.log(`- ${article.name} (${article.slug})`);
        console.log(`  Category:`, article.category);
        console.log(`  Status: ${article.status}`);
      });
    }

    // Test 2: Fetch categories
    console.log('\n--- Fetching Categories ---');
    const categoriesResponse = await fetch(`${directusUrl}/items/article_categories?fields=*`, {
      headers: {
        'Authorization': `Bearer ${directusToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!categoriesResponse.ok) {
      console.error('Categories request failed:', categoriesResponse.status, categoriesResponse.statusText);
      const error = await categoriesResponse.text();
      console.error('Error details:', error);
    } else {
      const categoriesData = await categoriesResponse.json();
      console.log('Categories count:', categoriesData.data.length);
      console.log('\nAll categories:');
      categoriesData.data.forEach((category: any) => {
        console.log(`- ${category.name} (${category.slug})`);
        console.log(`  ID: ${category.id}`);
        console.log(`  Order: ${category.order}`);
      });
    }

    // Test 3: Fetch specific test article
    console.log('\n--- Looking for Test Article ---');
    const testArticleResponse = await fetch(`${directusUrl}/items/articles?filter[slug][_eq]=test-article&fields=*,category.*`, {
      headers: {
        'Authorization': `Bearer ${directusToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!testArticleResponse.ok) {
      console.error('Test article request failed:', testArticleResponse.status, testArticleResponse.statusText);
    } else {
      const testArticleData = await testArticleResponse.json();
      if (testArticleData.data.length > 0) {
        console.log('Found test article:');
        console.log(JSON.stringify(testArticleData.data[0], null, 2));
      } else {
        console.log('Test article not found');
      }
    }

    // Test 4: Check API schema for articles collection
    console.log('\n--- Checking Articles Collection Schema ---');
    const schemaResponse = await fetch(`${directusUrl}/fields/articles`, {
      headers: {
        'Authorization': `Bearer ${directusToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!schemaResponse.ok) {
      console.error('Schema request failed:', schemaResponse.status, schemaResponse.statusText);
    } else {
      const schemaData = await schemaResponse.json();
      console.log('Articles collection fields:');
      schemaData.data.forEach((field: any) => {
        if (field.field === 'category') {
          console.log(`- ${field.field}: ${field.type} (${field.meta?.interface || 'no interface'})`);
          console.log(`  Related collection: ${field.schema?.foreign_key_table || field.meta?.options?.template || 'unknown'}`);
          console.log(`  Relationship:`, field.meta?.special);
        }
      });
    }

  } catch (error) {
    console.error('Error testing Directus API:', error);
  }
}

// Run the test
testDirectusAPI();