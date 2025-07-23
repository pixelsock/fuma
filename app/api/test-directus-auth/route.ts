import { NextResponse } from 'next/server';
import { createDirectus, rest, authentication, login, readItems } from '@directus/sdk';

export async function GET() {
  try {
    const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8056';
    const email = process.env.DIRECTUS_EMAIL || 'nick@stump.works';
    const password = process.env.DIRECTUS_PASSWORD || 'admin';
    
    console.log('Testing Directus authentication...');
    console.log('URL:', directusUrl);
    console.log('Email:', email);
    
    // Create a fresh client without token
    const testClient = createDirectus(directusUrl)
      .with(rest())
      .with(authentication());
    
    // Try to login
    try {
      await testClient.login({ email, password });
      console.log('Login successful!');
      
      // Try to fetch articles
      const articles = await testClient.request(
        readItems('articles', {
          fields: ['id', 'name', 'slug', 'status'],
          limit: 5,
        })
      );
      
      return NextResponse.json({
        success: true,
        authMethod: 'email/password',
        directusUrl,
        articlesFound: articles.length,
        articles: articles.map(a => ({
          id: a.id,
          name: a.name,
          slug: a.slug,
          status: a.status
        }))
      });
    } catch (loginError: any) {
      console.error('Login failed:', loginError);
      return NextResponse.json({
        error: 'Login failed',
        message: loginError.errors?.[0]?.message || loginError.message,
        directusUrl,
        credentials: { email, password: '***hidden***' }
      }, { status: 401 });
    }
  } catch (error: any) {
    console.error('Test error:', error);
    return NextResponse.json({ 
      error: error.message,
      details: error
    }, { status: 500 });
  }
}