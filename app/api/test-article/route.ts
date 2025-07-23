import { NextResponse } from 'next/server';
import { createDirectus, rest, staticToken, authentication, readItems } from '@directus/sdk';
import type { DirectusSchema } from '@/lib/directus-client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug') || 'test';
    
    const directusUrl = process.env.DIRECTUS_URL || 'https://admin.charlotteudo.org';
    const directusToken = process.env.DIRECTUS_TOKEN;
    
    console.log('Fetching article with slug:', slug);
    console.log('Using Directus URL:', directusUrl);
    console.log('Token configured:', !!directusToken);
    
    // Create Directus client
    const client = createDirectus<DirectusSchema>(directusUrl)
      .with(rest())
      .with(directusToken ? staticToken(directusToken) : authentication());
    
    // If no token, try email/password authentication
    if (!directusToken) {
      const email = process.env.DIRECTUS_EMAIL || 'nick@stump.works';
      const password = process.env.DIRECTUS_PASSWORD || 'admin';
      
      try {
        await (client as any).login({ email, password });
        console.log('Successfully authenticated with email/password');
      } catch (loginError) {
        console.error('Login failed:', loginError);
        return NextResponse.json({
          error: 'Authentication failed',
          message: loginError
        }, { status: 401 });
      }
    }
    
    // Search for article by slug
    const articles = await client.request(
      readItems('articles', {
        filter: {
          slug: {
            _eq: slug
          }
        },
        fields: [
          'id',
          'name', 
          'title',
          'description',
          'content',
          'slug',
          'status',
          'category.name',
          'category.key',
          'pdf',
          'PDF'
        ],
        limit: 1
      })
    );
    
    if (!articles || articles.length === 0) {
      return NextResponse.json({
        error: 'Article not found',
        slug,
        searched: true
      }, { status: 404 });
    }
    
    const article = articles[0];
    
    // Analyze the content structure
    const content = article.content || '';
    const hasTable = content.includes('<table');
    const tableCount = (content.match(/<table/g) || []).length;
    
    // Extract table samples if they exist
    const tableMatches = content.match(/<table[^>]*>[\s\S]*?<\/table>/gi) || [];
    const tableSamples = tableMatches.slice(0, 2).map((table, index) => {
      // Get first few rows for analysis
      const rows = table.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
      return {
        index,
        headerRow: rows[0] || '',
        firstDataRow: rows[1] || '',
        totalRows: rows.length,
        tableStart: table.substring(0, 500) + (table.length > 500 ? '...' : '')
      };
    });
    
    return NextResponse.json({
      success: true,
      article: {
        id: article.id,
        name: article.name,
        title: article.title,
        slug: article.slug,
        status: article.status,
        category: {
          name: (article as any)['category.name'],
          key: (article as any)['category.key']
        },
        contentLength: content.length,
        hasTable,
        tableCount,
        tableSamples,
        // Include full content for analysis
        content: content
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching test article:', error);
    return NextResponse.json({
      error: 'Failed to fetch article',
      message: error.message,
      details: error
    }, { status: 500 });
  }
} 