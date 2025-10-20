/**
 * Environment Configuration Utility
 * Intelligently selects local or production Directus settings based on deployment environment
 */

export type DeploymentEnvironment = 'local' | 'production';

export interface DirectusConfig {
  url: string;
  token?: string;
  email?: string;
  password?: string;
}

/**
 * Detects the current deployment environment
 */
export function getDeploymentEnvironment(): DeploymentEnvironment {
  // First check explicit DEPLOYMENT_ENV setting (try both client and server versions)
  const explicitEnv = (process.env.NEXT_PUBLIC_DEPLOYMENT_ENV || process.env.DEPLOYMENT_ENV)?.toLowerCase();
  if (explicitEnv === 'local' || explicitEnv === 'production') {
    return explicitEnv as DeploymentEnvironment;
  }

  // Fall back to NODE_ENV detection
  const nodeEnv = process.env.NODE_ENV;
  
  // In production mode, always use production unless explicitly set to local
  if (nodeEnv === 'production') {
    // Only use local if explicitly set and local credentials are available
    if (explicitEnv === 'local' && process.env.LOCAL_DIRECTUS_URL) {
      return 'local';
    }
    // Default to production for production builds
    return 'production';
  }
  
  // In development mode, prefer local if available
  if (nodeEnv === 'development') {
    // Check if local Directus is configured
    if (process.env.LOCAL_DIRECTUS_URL) {
      return 'local';
    }
  }
  
  // Default to production for all other cases
  return 'production';
}

/**
 * Detects if we're running server-side on Render
 */
function isRenderServerSide(): boolean {
  return typeof window === 'undefined' && !!process.env.RENDER;
}

/**
 * Gets the appropriate Directus configuration based on deployment environment
 */
export function getDirectusConfig(): DirectusConfig {
  const deploymentEnv = getDeploymentEnvironment();
  const isServerSideRender = isRenderServerSide();

  console.log(`[env-config] Deployment environment: ${deploymentEnv}`);
  console.log(`[env-config] NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`[env-config] DEPLOYMENT_ENV: ${process.env.DEPLOYMENT_ENV}`);
  console.log(`[env-config] NEXT_PUBLIC_DEPLOYMENT_ENV: ${process.env.NEXT_PUBLIC_DEPLOYMENT_ENV}`);
  console.log(`[env-config] Is Render server-side: ${isServerSideRender}`);

  if (deploymentEnv === 'local') {
    const config = {
      url: process.env.LOCAL_DIRECTUS_URL || 'http://localhost:8056',
      token: process.env.LOCAL_DIRECTUS_TOKEN,
      email: process.env.LOCAL_DIRECTUS_EMAIL,
      password: process.env.LOCAL_DIRECTUS_PASSWORD,
    };

    console.log(`[env-config] Using LOCAL configuration: ${config.url}`);
    return config;
  } else {
    // On Render server-side, use internal service URL for better performance
    // Client-side and external requests use public URL
    const directusUrl = isServerSideRender
      ? (process.env.DIRECTUS_INTERNAL_URL || 'http://udo-backend:10000')
      : (process.env.PRODUCTION_DIRECTUS_URL || 'https://admin.charlotteudo.org');

    const config = {
      url: directusUrl,
      token: process.env.DIRECTUS_TOKEN || process.env.PRODUCTION_DIRECTUS_TOKEN,
      email: process.env.PRODUCTION_DIRECTUS_EMAIL,
      password: process.env.PRODUCTION_DIRECTUS_PASSWORD,
    };

    console.log(`[env-config] Using PRODUCTION configuration: ${config.url} (server-side: ${isServerSideRender})`);
    return config;
  }
}

/**
 * Gets the current Directus URL
 */
export function getDirectusUrl(): string {
  return getDirectusConfig().url;
}

/**
 * Gets the current Directus token
 */
export function getDirectusToken(): string | undefined {
  return getDirectusConfig().token;
}

/**
 * Gets the current Directus credentials
 */
export function getDirectusCredentials(): { email?: string; password?: string } {
  const config = getDirectusConfig();
  return {
    email: config.email,
    password: config.password,
  };
}

/**
 * Environment status for debugging
 */
export function getEnvironmentStatus() {
  const deploymentEnv = getDeploymentEnvironment();
  const config = getDirectusConfig();
  const isServerSideRender = isRenderServerSide();

  return {
    deploymentEnvironment: deploymentEnv,
    nodeEnv: process.env.NODE_ENV,
    explicitEnv: process.env.DEPLOYMENT_ENV,
    directusUrl: config.url,
    hasToken: !!config.token,
    hasCredentials: !!(config.email && config.password),
    isLocal: deploymentEnv === 'local',
    isProduction: deploymentEnv === 'production',
    isRenderServerSide: isServerSideRender,
    usingInternalUrl: isServerSideRender && config.url.includes('udo-backend'),
  };
}