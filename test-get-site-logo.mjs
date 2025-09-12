// Test the updated getSiteLogo function
import { getSiteLogo } from './lib/directus-source.js';

async function testGetSiteLogo() {
  console.log('Testing getSiteLogo function...');
  
  try {
    const logoUrl = await getSiteLogo();
    console.log('Logo URL result:', logoUrl);
    
    if (logoUrl) {
      console.log('✅ Logo fetched successfully!');
      console.log('Expected logo URL: https://admin.charlotteudo.org/assets/a0bb9917-13b1-4d0d-adb5-0039186e283f');
      console.log('Actual logo URL:', logoUrl);
      
      if (logoUrl.includes('a0bb9917-13b1-4d0d-adb5-0039186e283f')) {
        console.log('✅ Logo UUID matches expected value!');
      } else {
        console.log('❌ Logo UUID does not match expected value');
      }
    } else {
      console.log('❌ No logo returned');
    }
  } catch (error) {
    console.error('❌ Error testing getSiteLogo:', error);
  }
}

testGetSiteLogo();
