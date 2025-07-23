import { createDirectus, rest, staticToken, authentication } from '@directus/sdk';

// Directus types
export interface DirectusArticle {
  id: string;
  name: string;
  title?: string;
  description?: string;
  content: string;
  slug: string;
  status: string;
  category?: { key: string; name: string } | null;
  order?: number;
  pdf?: string; // PDF file reference (lowercase for compatibility)
  PDF?: string | { id: string; filename_download: string } | null; // Actual field from Directus (uppercase)
}

export interface DirectusCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order?: number;
  color?: string;
}

export interface DirectusSchema {
  articles: DirectusArticle[];
  article_categories: DirectusCategory[];
}

// Create Directus client with proper authentication
const directusUrl = process.env.DIRECTUS_URL || 'https://admin.charlotteudo.org';
const directusToken = process.env.DIRECTUS_TOKEN;

console.log('[lib/directus-client.ts] Directus URL:', directusUrl);
console.log('[lib/directus-client.ts] DIRECTUS_URL env:', process.env.DIRECTUS_URL);
console.log('[lib/directus-client.ts] Token value:', directusToken ? `${directusToken.substring(0, 10)}...` : 'not set');
console.log('[lib/directus-client.ts] Environment:', typeof window === 'undefined' ? 'server' : 'client');
console.log('[lib/directus-client.ts] All env vars:', Object.keys(process.env).filter(k => k.includes('DIRECTUS')));

// Create client with static token if available, otherwise use authentication
export const directus = createDirectus<DirectusSchema>(directusUrl)
  .with(rest())
  .with(directusToken ? staticToken(directusToken) : authentication());

// Helper to ensure authentication
export async function ensureAuthenticated(): Promise<boolean> {
  console.log('[directus-client.ts] ensureAuthenticated called');
  
  // If using static token, we're already authenticated
  if (directusToken) {
    console.log('[directus-client.ts] Using static token authentication');
    return true;
  }
  
  // If using email/password authentication
  const directusEmail = process.env.DIRECTUS_EMAIL;
  const directusPassword = process.env.DIRECTUS_PASSWORD;
  
  console.log('[directus-client.ts] Email configured:', !!directusEmail);
  console.log('[directus-client.ts] Password configured:', !!directusPassword);
  
  if (!directusEmail || !directusPassword) {
    console.warn('[directus-client.ts] Directus credentials not configured. Skipping Directus content.');
    return false;
  }
  
  try {
    console.log('[directus-client.ts] Attempting to authenticate with Directus...');
    // Type assertion to access login method when using authentication
    const authClient = directus as any;
    await authClient.login({ email: directusEmail, password: directusPassword });
    console.log('[directus-client.ts] Successfully authenticated with Directus');
    return true;
  } catch (error) {
    console.error('[directus-client.ts] Failed to authenticate with Directus:', error);
    return false;
  }
}

