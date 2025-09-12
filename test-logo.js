// Test script for the new logo functionality
async function testLogo() {
  const baseUrl = 'https://admin.charlotteudo.org';
  
  try {
    const response = await fetch(`${baseUrl}/items/global_settings`);
    
    if (!response.ok) {
      console.error('Failed to fetch global settings:', response.status, response.statusText);
      return;
    }
    
    const result = await response.json();
    console.log('Global settings response:', JSON.stringify(result, null, 2));
    
    if (result.data && result.data.logo) {
      const logoUrl = `${baseUrl}/assets/${result.data.logo}`;
      console.log('Logo URL:', logoUrl);
      
      // Test if the logo asset is accessible
      const logoResponse = await fetch(logoUrl);
      console.log('Logo asset response status:', logoResponse.status, logoResponse.statusText);
      console.log('Logo asset content-type:', logoResponse.headers.get('content-type'));
    } else {
      console.log('No logo found in global settings');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testLogo();
