/**
 * Directus Asset URL Utility
 *
 * Ensures asset URLs (images, PDFs, files) ALWAYS use public URLs
 * even when server-side code uses internal Render network URLs for API calls.
 *
 * Why? Browsers need to download assets directly, so they must use
 * publicly accessible URLs, not internal Render network addresses.
 */

import { getDeploymentEnvironment } from './env-config';

/**
 * Get public Directus URL for assets
 * Returns the appropriate public URL based on deployment environment
 */
export function getPublicDirectusUrl(): string {
  const deploymentEnv = getDeploymentEnvironment();
  
  // In local development, use local Directus
  if (deploymentEnv === 'local') {
    if (process.env.LOCAL_DIRECTUS_URL) {
      return process.env.LOCAL_DIRECTUS_URL;
    }
    // Fall back to NEXT_PUBLIC_ version if LOCAL_ not set
    if (process.env.NEXT_PUBLIC_DIRECTUS_URL && process.env.NEXT_PUBLIC_DIRECTUS_URL.includes('localhost')) {
      return process.env.NEXT_PUBLIC_DIRECTUS_URL;
    }
  }
  
  // In production, use production URL
  // Check for explicit production URL first
  if (process.env.PRODUCTION_DIRECTUS_URL) {
    return process.env.PRODUCTION_DIRECTUS_URL;
  }

  // Fall back to NEXT_PUBLIC_ version (available client-side)
  if (process.env.NEXT_PUBLIC_DIRECTUS_URL) {
    return process.env.NEXT_PUBLIC_DIRECTUS_URL;
  }

  // Default to production URL
  return 'https://admin.charlotteudo.org';
}

/**
 * Get full URL for a Directus asset
 * Ensures the path uses the public URL regardless of server/client context
 *
 * @param path - Asset path (e.g., 'assets/abc-123', 'assets/pdfs/file.pdf')
 * @returns Full public URL to the asset
 *
 * @example
 * getDirectusAssetUrl('assets/abc-123')
 * // Returns: 'https://admin.charlotteudo.org/assets/abc-123'
 *
 * @example
 * getDirectusAssetUrl('/assets/pdfs/document.pdf')
 * // Returns: 'https://admin.charlotteudo.org/assets/pdfs/document.pdf'
 */
export function getDirectusAssetUrl(path: string): string {
  const publicUrl = getPublicDirectusUrl();

  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // Ensure we don't add 'assets' twice
  const finalPath = cleanPath.startsWith('assets/') ? cleanPath : `assets/${cleanPath}`;

  return `${publicUrl}/${finalPath}`;
}

/**
 * Get URL for a Directus file by ID
 *
 * @param fileId - Directus file UUID
 * @param params - Optional query params (e.g., width, height, quality)
 * @returns Full public URL to the file
 *
 * @example
 * getDirectusFileUrl('abc-123-def-456')
 * // Returns: 'https://admin.charlotteudo.org/assets/abc-123-def-456'
 *
 * @example
 * getDirectusFileUrl('abc-123', { width: 800, quality: 90 })
 * // Returns: 'https://admin.charlotteudo.org/assets/abc-123?width=800&quality=90'
 */
export function getDirectusFileUrl(fileId: string, params?: Record<string, string | number>): string {
  const publicUrl = getPublicDirectusUrl();
  const baseUrl = `${publicUrl}/assets/${fileId}`;

  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }

  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  return `${baseUrl}?${queryString}`;
}
