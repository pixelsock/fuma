import { generateArticleParams } from '../lib/directus-source';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testParams() {
  console.log('🧪 Testing static params generation...');
  
  try {
    const params = await generateArticleParams();
    console.log(`✅ Generated ${params.length} static params`);
    
    console.log('\nFirst 10 params:');
    params.slice(0, 10).forEach((param, index) => {
      console.log(`${index + 1}. ${param.slug.join('/')}`);
    });
    
    // Test that we have the specific article we're looking for
    const targetParam = params.find(p => p.slug.join('/') === 'part-iii-neighborhood-zoning-districts/article-4-neighborhood-1-zoning-districts');
    if (targetParam) {
      console.log('\n✅ Target param found:', targetParam.slug.join('/'));
    } else {
      console.log('\n❌ Target param NOT found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testParams().catch(console.error);