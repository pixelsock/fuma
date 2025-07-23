import { NextRequest, NextResponse } from 'next/server';
import { searchArticles } from '@/lib/directus-server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const searchTerm = searchParams.get('q');
  const currentSlug = searchParams.get('current');
  
  if (!searchTerm) {
    return NextResponse.json({ error: 'Search term required' }, { status: 400 });
  }

  try {
    console.log('[/api/search-articles] Searching for:', searchTerm, 'excluding:', currentSlug);
    
    // Search for articles using the server-side client
    const articles = await searchArticles(searchTerm, currentSlug || undefined);
    
    console.log('[/api/search-articles] Found articles:', articles.length);

    // Count occurrences in each article
    const articlesWithCount = (articles || []).map(article => {
      const content = article.content || '';
      
      // Skip if no content
      if (!content) {
        return null;
      }
      
      const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = content.match(regex);
      const count = matches ? matches.length : 0;
      
      // Get a snippet around the first match
      let snippet = '';
      if (matches && matches.length > 0) {
        const firstIndex = content.toLowerCase().indexOf(searchTerm.toLowerCase());
        const start = Math.max(0, firstIndex - 50);
        const end = Math.min(content.length, firstIndex + searchTerm.length + 50);
        snippet = content.substring(start, end);
        if (start > 0) snippet = '...' + snippet;
        if (end < content.length) snippet = snippet + '...';
      }
      
      return {
        id: article.id,
        name: article.name || 'Untitled',
        slug: article.slug,
        count,
        snippet
      };
    }).filter(Boolean) as Array<{
      id: string;
      name: string;
      slug: string;
      count: number;
      snippet: string;
    }>; // Remove null entries

    // Sort by occurrence count
    articlesWithCount.sort((a, b) => b.count - a.count);

    return NextResponse.json({ 
      articles: articlesWithCount.filter(a => a.count > 0),
      total: articlesWithCount.filter(a => a.count > 0).length
    });
  } catch (error) {
    console.error('[/api/search-articles] Error searching articles:', error);
    console.error('[/api/search-articles] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      searchTerm,
      currentSlug
    });
    return NextResponse.json({ 
      error: 'Failed to search articles',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}