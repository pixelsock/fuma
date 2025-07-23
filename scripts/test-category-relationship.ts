import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

async function testCategoryRelationship() {
  const directusUrl = process.env.DIRECTUS_URL || 'https://admin.charlotteudo.org';
  const directusToken = process.env.DIRECTUS_TOKEN;

  if (!directusToken) {
    console.error('Missing DIRECTUS_TOKEN environment variable');
    process.exit(1);
  }

  try {
    // Test 1: Get raw article data to see category field structure
    console.log('--- Fetching Raw Article Data ---');
    const rawResponse = await fetch(`${directusUrl}/items/articles?limit=5`, {
      headers: {
        'Authorization': `Bearer ${directusToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (rawResponse.ok) {
      const rawData = await rawResponse.json();
      console.log('\nRaw article data (first article):');
      if (rawData.data.length > 0) {
        console.log(JSON.stringify(rawData.data[0], null, 2));
      }
    }

    // Test 2: Try different field queries
    console.log('\n--- Testing Different Field Queries ---');
    
    // Try with category as a direct field
    const test1Response = await fetch(`${directusUrl}/items/articles?fields=id,name,slug,category&limit=5`, {
      headers: {
        'Authorization': `Bearer ${directusToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (test1Response.ok) {
      const test1Data = await test1Response.json();
      console.log('\nWith category field only:');
      test1Data.data.forEach((article: any) => {
        console.log(`- ${article.name}: category =`, JSON.stringify(article.category));
      });
    }

    // Test 3: Search for any article with test in the name
    console.log('\n--- Searching for Test Articles ---');
    const searchResponse = await fetch(`${directusUrl}/items/articles?filter[name][_contains]=test&fields=*`, {
      headers: {
        'Authorization': `Bearer ${directusToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      console.log(`Found ${searchData.data.length} articles with "test" in name`);
      searchData.data.forEach((article: any) => {
        console.log(`\n- ${article.name} (${article.slug})`);
        console.log(`  Category:`, article.category);
        console.log(`  Status: ${article.status}`);
      });
    }

    // Test 4: Check if we need to use a different approach for JSON field
    console.log('\n--- Testing JSON Field Approach ---');
    const jsonFieldResponse = await fetch(`${directusUrl}/items/articles?fields=id,name,slug,category[id,name,slug]&limit=3`, {
      headers: {
        'Authorization': `Bearer ${directusToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (jsonFieldResponse.ok) {
      const jsonFieldData = await jsonFieldResponse.json();
      console.log('\nWith category JSON field expansion:');
      jsonFieldData.data.forEach((article: any) => {
        console.log(`- ${article.name}`);
        console.log(`  Category:`, JSON.stringify(article.category, null, 2));
      });
    }

  } catch (error) {
    console.error('Error testing category relationship:', error);
  }
}

// Run the test
testCategoryRelationship();