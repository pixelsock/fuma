import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

async function checkPublishedTest() {
  const directusUrl = process.env.DIRECTUS_URL || 'https://admin.charlotteudo.org';
  const directusToken = process.env.DIRECTUS_TOKEN;

  if (!directusToken) {
    console.error('Missing DIRECTUS_TOKEN');
    return;
  }

  console.log('Using URL:', directusUrl);

  try {
    // Check for any articles with slug "test"
    console.log('--- Checking all test articles ---');
    const testResponse = await fetch(`${directusUrl}/items/articles?filter[slug][_eq]=test`, {
      headers: {
        'Authorization': `Bearer ${directusToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Test response status:', testResponse.status);
    
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log(`Found ${testData.data.length} article(s) with slug "test"`);
      
      testData.data.forEach((article: any, i: number) => {
        console.log(`\nTest Article ${i + 1}:`);
        console.log('- ID:', article.id);
        console.log('- Name:', article.name);
        console.log('- Status:', article.status);
        console.log('- Has content:', !!article.content);
        console.log('- Content length:', article.content?.length || 0);
      });
    } else {
      console.log('Test response error:', await testResponse.text());
    }

    // Check all published articles
    console.log('\n--- Checking all published articles ---');
    const publishedResponse = await fetch(`${directusUrl}/items/articles?filter[status][_in]=publish,published&fields=id,name,slug,status`, {
      headers: {
        'Authorization': `Bearer ${directusToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (publishedResponse.ok) {
      const publishedData = await publishedResponse.json();
      console.log(`\nTotal published articles: ${publishedData.data.length}`);
      publishedData.data.forEach((article: any) => {
        console.log(`- ${article.name} (${article.slug}) - Status: ${article.status}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run check
checkPublishedTest();