import { getArticleBySlug, generateArticleParams } from '../lib/directus-source';

async function testSlugMapping() {
  console.log('🧪 Testing slug mapping...');
  
  // Test 1: Try to fetch an article with nested slug
  const nestedSlug = 'part-iii-neighborhood-zoning-districts/article-4-neighborhood-1-zoning-districts';
  console.log(`\n1. Testing nested slug: ${nestedSlug}`);
  
  try {
    const article = await getArticleBySlug(nestedSlug);
    if (article) {
      console.log(`✅ Success: Found article "${article.name}"`);
      console.log(`   Original slug: ${article.slug}`);
    } else {
      console.log(`❌ Failed: Article not found`);
    }
  } catch (error) {
    console.error(`❌ Error: ${error}`);
  }
  
  // Test 2: Try to fetch an article with flat slug
  const flatSlug = 'article-4-neighborhood-1-zoning-districts';
  console.log(`\n2. Testing flat slug: ${flatSlug}`);
  
  try {
    const article = await getArticleBySlug(flatSlug);
    if (article) {
      console.log(`✅ Success: Found article "${article.name}"`);
      console.log(`   Original slug: ${article.slug}`);
    } else {
      console.log(`❌ Failed: Article not found`);
    }
  } catch (error) {
    console.error(`❌ Error: ${error}`);
  }
  
  // Test 3: Generate static params
  console.log(`\n3. Testing static params generation...`);
  try {
    const params = await generateArticleParams();
    console.log(`✅ Generated ${params.length} static params`);
    console.log('Sample params:');
    params.slice(0, 5).forEach((param, index) => {
      console.log(`   ${index + 1}. ${param.slug.join('/')}`);
    });
  } catch (error) {
    console.error(`❌ Error generating params: ${error}`);
  }
}

testSlugMapping().catch(console.error);