import { ensureAuthenticated } from '../lib/directus-client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testAuth() {
  console.log('🔑 Testing Directus authentication...');
  console.log('DIRECTUS_URL:', process.env.DIRECTUS_URL);
  console.log('DIRECTUS_TOKEN:', process.env.DIRECTUS_TOKEN ? 'SET' : 'NOT SET');
  console.log('DIRECTUS_EMAIL:', process.env.DIRECTUS_EMAIL);
  console.log('DIRECTUS_PASSWORD:', process.env.DIRECTUS_PASSWORD ? 'SET' : 'NOT SET');
  
  const isAuthenticated = await ensureAuthenticated();
  console.log('Authentication result:', isAuthenticated);
}

testAuth().catch(console.error);