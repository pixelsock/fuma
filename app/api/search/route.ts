import { source, unifiedSource } from '@/lib/unified-source';
import { createSearchAPI } from 'fumadocs-core/search/server';

// Create search indexes from both sources
const getSearchIndexes = async () => {
  try {
    // Get pages from both sources
    const allPages = await unifiedSource.getAllPages();
    
    return allPages.map((page) => ({
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      id: page.url,
      content: typeof page.data.body === 'string' ? page.data.body : '',
    }));
  } catch (error) {
    console.error('Error creating search indexes:', error);
    // Fallback to just MDX source
    return source.getPages().map((page) => ({
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      id: page.url,
      content: typeof page.data.body === 'string' ? page.data.body : '',
    }));
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  
  if (!query) {
    return Response.json({ pages: [] });
  }
  
  try {
    const indexes = await getSearchIndexes();
    
    // Simple search implementation
    const results = indexes.filter(page => 
      page.title?.toLowerCase().includes(query.toLowerCase()) ||
      page.description?.toLowerCase().includes(query.toLowerCase()) ||
      page.content?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10); // Limit to 10 results
    
    return Response.json({ pages: results });
  } catch (error) {
    console.error('Search error:', error);
    return Response.json({ pages: [] });
  }
}
