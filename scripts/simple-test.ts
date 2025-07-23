import { getArticleBySlug } from '../lib/directus-source';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function simpleTest() {
  console.log('🧪 Simple test: fetching article with flat slug...');
  
  try {
    const article = await getArticleBySlug('article-4-neighborhood-1-zoning-districts');
    if (article) {
      console.log('✅ Success:', article.name);
    } else {
      console.log('❌ Article not found');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  console.log('\n🧪 Simple test: fetching article with nested slug...');
  
  try {
    const article = await getArticleBySlug('part-iii-neighborhood-zoning-districts/article-4-neighborhood-1-zoning-districts');
    if (article) {
      console.log('✅ Success:', article.name);
    } else {
      console.log('❌ Article not found');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

simpleTest().catch(console.error);