import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testAPI() {
  try {
    console.log('🧪 Testing What is UDO API...\n');
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002';
    const url = `${baseUrl}/api/what-is-udo-page`;
    
    console.log(`Fetching from: ${url}\n`);
    
    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    
    console.log('✓ API Response received\n');
    console.log('Page Title:', data.page_title);
    console.log('Video URL:', data.video_url);
    console.log('Key Features:', data.key_features?.length || 0);
    console.log('Learn More Links:', data.learn_more_links?.length || 0);
    console.log('Quick Facts:', data.quick_facts?.length || 0);
    console.log('\n✓ Test passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testAPI();
