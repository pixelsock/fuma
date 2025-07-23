import { createDirectus, rest, staticToken, authentication, readItems } from '@directus/sdk';
import type { DirectusSchema } from './directus-client';

// Server-side Directus client setup
export function getDirectusClient() {
  const directusUrl = process.env.DIRECTUS_URL || 'https://admin.charlotteudo.org';
  const directusToken = process.env.DIRECTUS_TOKEN;
  
  console.log('[directus-server] Creating client with URL:', directusUrl);
  console.log('[directus-server] Token configured:', !!directusToken);
  
  // Create client with static token if available
  const client = createDirectus<DirectusSchema>(directusUrl)
    .with(rest())
    .with(directusToken ? staticToken(directusToken) : authentication());
  
  return client;
}

// Helper to search articles
export async function searchArticles(searchTerm: string, excludeSlug?: string) {
  const client = getDirectusClient();
  
  try {
    const filter: any = {
      _and: [
        {
          content: {
            _icontains: searchTerm
          }
        },
        {
          status: {
            _in: ['publish', 'published', 'draft']
          }
        }
      ]
    };
    
    if (excludeSlug) {
      filter._and.push({
        slug: {
          _neq: excludeSlug
        }
      });
    }
    
    const articles = await client.request(
      readItems('articles', {
        filter,
        fields: ['id', 'name', 'slug', 'content', 'pdf', 'category'],
        limit: 10
      })
    );
    
    return articles;
  } catch (error) {
    console.error('[directus-server] Error searching articles:', error);
    throw error;
  }
}