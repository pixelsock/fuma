/**
 * Client-side utility to get the correct Directus URL
 * This ensures production deployments use the correct URL instead of localhost
 * Uses the environment variables exposed by next.config.mjs
 */
export function getClientDirectusUrl(): string {
  // The next.config.mjs exposes NEXT_PUBLIC_DIRECTUS_URL which will contain
  // the correct URL based on the server-side environment variables
  return process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.charlotteudo.org';
}