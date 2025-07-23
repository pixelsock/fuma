import { createDirectus, rest, authentication } from '@directus/sdk';

// Use environment variable with a single fallback
// This prevents hydration mismatches between server and client
const directusUrl = process.env.DIRECTUS_URL || 'https://admin.charlotteudo.org';

console.log('[src/lib/directus.ts] Directus URL:', directusUrl);
console.log('[src/lib/directus.ts] Environment:', typeof window === 'undefined' ? 'server' : 'client');

export const directus = createDirectus(directusUrl)
  .with(rest())
  .with(authentication());

export type Article = {
  id: string;
  name: string;
  content: string; // HTML content
  slug: string;
  order: number;
  category: { key: string; name: string };
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  order: number;
};
