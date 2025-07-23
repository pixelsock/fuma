import { getArticleBySlug, generateArticleParams } from '../lib/directus-source';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function finalTest() {
  console.log('🎯 Final test: Complete slug mapping verification\n');
  
  // Test articles from different sections
  const testSlugs = [
    'part-iii-neighborhood-zoning-districts/article-4-neighborhood-1-zoning-districts',
    'part-iv-employment-zoning-districts/article-6-commercial-zoning-districts-cg-cr',
    'part-v-centers-zoning-districts/article-10-neighborhood-commercial-zoning-districts',
    'part-i-ordinance-introduction/article-1-title-purpose-applicability',
    'part-ix-stormwater/article-23-water-supply-watershed-protection'
  ];
  
  console.log('Testing individual article resolution:');
  console.log('═'.repeat(60));
  
  for (const slug of testSlugs) {
    try {
      const article = await getArticleBySlug(slug);
      if (article) {
        console.log(`✅ ${slug}`);
        console.log(`   → Found: "${article.name}"`);
      } else {
        console.log(`❌ ${slug}`);
        console.log(`   → Not found`);
      }
    } catch (error) {
      console.log(`❌ ${slug}`);
      console.log(`   → Error: ${error}`);
    }
  }
  
  console.log('\n\nTesting static params generation:');
  console.log('═'.repeat(60));
  
  try {
    const params = await generateArticleParams();
    console.log(`✅ Generated ${params.length} static params`);
    
    // Check if all our test slugs are in the generated params
    const generatedSlugs = params.map(p => p.slug.join('/'));
    
    console.log('\nVerifying test slugs are in generated params:');
    for (const testSlug of testSlugs) {
      const found = generatedSlugs.includes(testSlug);
      console.log(`${found ? '✅' : '❌'} ${testSlug}`);
    }
    
    // Show mapping examples
    console.log('\nMapping examples (first 5):');
    for (let i = 0; i < Math.min(5, params.length); i++) {
      const param = params[i];
      const nestedPath = param.slug.join('/');
      const articleSlug = param.slug[param.slug.length - 1];
      console.log(`  ${articleSlug} → ${nestedPath}`);
    }
    
  } catch (error) {
    console.error('❌ Error generating params:', error);
  }
  
  console.log('\n🎉 Test completed!');
}

finalTest().catch(console.error);