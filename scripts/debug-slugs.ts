import { createDirectus, rest, readItems, authentication, login } from '@directus/sdk';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Directus configuration
const directusUrl = process.env.DIRECTUS_URL || 'https://admin.charlotteudo.org';
const directusEmail = process.env.DIRECTUS_EMAIL || 'nick@stump.works';
const directusPassword = process.env.DIRECTUS_PASSWORD || 'admin';

const directusClient = createDirectus(directusUrl)
  .with(rest())
  .with(authentication());

interface Article {
  id: string;
  name: string;
  title?: string;
  content: string;
  slug: string;
  status: string;
  category: any;
  order?: number;
}

async function debugSlugs() {
  console.log('🔍 Debug: Analyzing article slugs in Directus...');
  console.log(`📡 Connecting to Directus at ${directusUrl}`);
  
  try {
    // Authenticate with Directus
    await directusClient.request(
      login({
        email: directusEmail,
        password: directusPassword,
      })
    );
    console.log('✅ Successfully authenticated with Directus');
    
    // Fetch ALL articles with minimal filters to see what's available
    const articles = await directusClient.request<Article[]>(
      readItems('articles', {
        fields: ['id', 'name', 'slug', 'status', 'category'],
        sort: ['name']
      })
    );
    
    console.log(`\n📊 Found ${articles.length} total articles in Directus`);
    console.log('═'.repeat(80));
    
    // Group by status
    const statusGroups = new Map<string, Article[]>();
    for (const article of articles) {
      const status = article.status || 'no-status';
      if (!statusGroups.has(status)) {
        statusGroups.set(status, []);
      }
      statusGroups.get(status)!.push(article);
    }
    
    console.log('\n📈 Articles by Status:');
    for (const [status, statusArticles] of statusGroups) {
      console.log(`  ${status}: ${statusArticles.length} articles`);
    }
    
    // Show all available slugs
    console.log('\n🔗 All Article Slugs:');
    console.log('─'.repeat(80));
    
    const validSlugs = [];
    const invalidSlugs = [];
    
    for (const article of articles) {
      const slug = article.slug;
      const status = article.status || 'no-status';
      const hasContent = article.content ? '✓' : '✗';
      
      if (slug && slug.trim() !== '') {
        validSlugs.push(slug);
        console.log(`  ✓ ${slug} (${status}) - ${article.name}`);
      } else {
        invalidSlugs.push(article);
        console.log(`  ✗ [NO SLUG] (${status}) - ${article.name} (ID: ${article.id})`);
      }
    }
    
    console.log('\n📋 Summary:');
    console.log(`  • Valid slugs: ${validSlugs.length}`);
    console.log(`  • Invalid/missing slugs: ${invalidSlugs.length}`);
    
    // Show the most common slug patterns
    console.log('\n🔍 Slug Patterns Analysis:');
    console.log('─'.repeat(80));
    
    const slugPatterns = new Map<string, number>();
    for (const slug of validSlugs) {
      const parts = slug.split('/');
      if (parts.length > 1) {
        const pattern = parts[0]; // First part of the slug
        slugPatterns.set(pattern, (slugPatterns.get(pattern) || 0) + 1);
      }
    }
    
    console.log('Top slug prefixes:');
    for (const [pattern, count] of [...slugPatterns.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${pattern}: ${count} articles`);
    }
    
    // Test specific slug that's failing
    const testSlug = 'part-iii-neighborhood-zoning-districts/article-4-neighborhood-1-zoning-districts';
    console.log(`\n🎯 Testing specific slug: "${testSlug}"`);
    
    const exactMatch = validSlugs.find(slug => slug === testSlug);
    if (exactMatch) {
      console.log(`  ✓ Found exact match: ${exactMatch}`);
    } else {
      console.log(`  ✗ No exact match found`);
      
      // Look for partial matches
      const partialMatches = validSlugs.filter(slug => 
        slug.includes('article-4') || 
        slug.includes('neighborhood-1') || 
        slug.includes('part-iii')
      );
      
      if (partialMatches.length > 0) {
        console.log(`  🔍 Partial matches found:`);
        for (const match of partialMatches) {
          console.log(`    - ${match}`);
        }
      } else {
        console.log(`  ❌ No partial matches found either`);
      }
    }
    
    // Show published articles only
    console.log('\n📋 Published Articles Only:');
    console.log('─'.repeat(80));
    
    const publishedArticles = articles.filter(article => 
      ['publish', 'published', 'draft'].includes(article.status)
    );
    
    console.log(`Found ${publishedArticles.length} published/draft articles:`);
    for (const article of publishedArticles) {
      if (article.slug && article.slug.trim() !== '') {
        console.log(`  • ${article.slug} - ${article.name} (${article.status})`);
      }
    }
    
    console.log('\n✅ Debug analysis completed!');
    
  } catch (error) {
    console.error('❌ Error during debug analysis:', error);
    process.exit(1);
  }
}

// Run the debug
debugSlugs();