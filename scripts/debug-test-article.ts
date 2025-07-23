import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

async function debugTestArticle() {
  const directusUrl = process.env.DIRECTUS_URL || 'https://admin.charlotteudo.org';
  const directusToken = process.env.DIRECTUS_TOKEN;

  if (!directusToken) {
    console.error('Missing DIRECTUS_TOKEN environment variable');
    process.exit(1);
  }

  try {
    // Get test article with all fields
    console.log('--- Fetching test article with all fields ---');
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
        console.log('Test article:');
        console.log(JSON.stringify(testArticle, null, 2));
        
        // Check specifically if content exists
        console.log('\nContent field check:');
        console.log('- Has content:', !!testArticle.content);
        console.log('- Content length:', testArticle.content?.length || 0);
        console.log('- Content preview:', testArticle.content?.substring(0, 100) || 'No content');
      }
    }

    // Also check all articles to see which ones have content
    console.log('\n--- Checking all articles for content ---');
    const allResponse = await fetch(`${directusUrl}/items/articles?fields=id,name,slug,status,content&limit=50`, {
      headers: {
        'Authorization': `Bearer ${directusToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (allResponse.ok) {
      const allData = await allResponse.json();
      console.log(`Total articles: ${allData.data.length}`);
      
      const withContent = allData.data.filter((a: any) => a.content);
      const withoutContent = allData.data.filter((a: any) => !a.content);
      
      console.log(`\nArticles with content: ${withContent.length}`);
      withContent.forEach((article: any) => {
        console.log(`- ${article.name} (${article.slug}) - Status: ${article.status}`);
      });
      
      console.log(`\nArticles without content: ${withoutContent.length}`);
      
      // Check if test article is in the list
      const testInList = allData.data.find((a: any) => a.slug === 'test');
      if (testInList) {
        console.log('\nTest article in full list:');
        console.log(`- Has content: ${!!testInList.content}`);
        console.log(`- Status: ${testInList.status}`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the debug
debugTestArticle();