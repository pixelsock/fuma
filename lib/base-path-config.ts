/**
 * Shared BasePath Configuration
 *
 * This module provides consistent basePath logic for both client and server contexts.
 * It ensures that API routes and asset paths are correctly resolved across different
 * deployment environments (Netlify, Webflow, local development).
 *
 * The logic mirrors next.config.mjs to prevent client/server basePath mismatches.
 */

/**
 * Determines if we're running on Netlify
 * Works in both server and client contexts
 */
function isNetlifyEnvironment(): boolean {
  // Check if NEXT_PUBLIC_NETLIFY is set (available client-side)
  if (typeof window !== 'undefined') {
    // Client-side: use NEXT_PUBLIC_ prefixed variable
    return process.env.NEXT_PUBLIC_NETLIFY === 'true';
  }

  // Server-side: use NETLIFY variable
  return process.env.NETLIFY === 'true';
}

/**
 * Determines if we're in Webflow production environment
 * Mirrors the logic from next.config.mjs
 */
function isWebflowProduction(): boolean {
  // Netlify should never use Webflow basePath
  if (isNetlifyEnvironment()) {
    return false;
  }

  // Check deployment target - Netlify should NOT use Webflow paths
  const deploymentTarget = process.env.NEXT_PUBLIC_DEPLOYMENT_TARGET?.toLowerCase()
    || process.env.DEPLOYMENT_TARGET?.toLowerCase();

  if (deploymentTarget === 'netlify') {
    return false;
  }

  // Check if explicitly set to production deployment for Webflow
  const explicitEnv = process.env.NEXT_PUBLIC_DEPLOYMENT_ENV?.toLowerCase()
    || process.env.DEPLOYMENT_ENV?.toLowerCase();

  if (explicitEnv === 'production' && deploymentTarget === 'webflow') {
    return true;
  }

  // In production builds, ONLY use basePath if explicitly targeting Webflow
  if (process.env.NODE_ENV === 'production') {
    // Only use Webflow basePath if explicitly set to webflow target
    if (explicitEnv === 'production' && deploymentTarget === 'webflow') {
      return true;
    }
    // All other production deployments (Render, Netlify, etc.) use root path
    return false;
  }

  // Development mode - no Webflow basePath
  return false;
}

/**
 * Gets the basePath for the current environment
 * Returns '/articles' for Webflow production, empty string otherwise
 */
export function getBasePath(): string {
  return isWebflowProduction() ? '/articles' : '';
}

/**
 * Gets the full API URL with correct basePath
 * @param endpoint - The API endpoint (e.g., '/api/search')
 * @returns Full URL with basePath applied
 */
export function getApiUrl(endpoint: string): string {
  const basePath = getBasePath();

  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  return `${basePath}${normalizedEndpoint}`;
}

/**
 * Check if we're in a Netlify environment
 * Useful for conditional logic
 */
export function isNetlify(): boolean {
  return isNetlifyEnvironment();
}

/**
 * Check if we're in a Webflow environment
 * Useful for conditional logic
 */
export function isWebflow(): boolean {
  return isWebflowProduction();
}
