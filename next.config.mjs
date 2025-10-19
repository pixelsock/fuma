
/**
 * Determines if we're in Webflow production environment
 * NOTE: Webflow basePath is now disabled - all deployments use root path
 */
function isWebflowProduction() {
  // Webflow basePath is no longer needed - always use root path
  console.log('[next.config.mjs] Webflow basePath disabled - using root path for all deployments');
  return false;
}

/** @type {import('next').NextConfig} */
const config = {
  // Configure the base path and asset prefix for Webflow Cloud deployment
  basePath: isWebflowProduction() ? '/articles' : '',
  assetPrefix: isWebflowProduction() ? '/articles' : '',
  reactStrictMode: true,
  transpilePackages: ['fumadocs-ui', 'fumadocs-core'],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8056',
        pathname: '/assets/**',
      },
      {
        protocol: 'https',
        hostname: 'admin.charlotteudo.org',
        pathname: '/assets/**',
      },
      {
        protocol: 'https',
        hostname: 'udo-backend-y1w0.onrender.com',
        pathname: '/assets/**',
      },
    ],
  },
  // Expose environment detection to client-side code via NEXT_PUBLIC_ variables
  // These are set here to ensure they're available during both build and runtime
  env: {
    NEXT_PUBLIC_NETLIFY: process.env.NETLIFY || 'false',
    NEXT_PUBLIC_DEPLOYMENT_TARGET: process.env.DEPLOYMENT_TARGET || '',
    NEXT_PUBLIC_DEPLOYMENT_ENV: process.env.DEPLOYMENT_ENV || '',
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { 
        fs: false,
        'node:fs': false
      };
      
      // Exclude image-size from client bundle
      config.resolve.alias = {
        ...config.resolve.alias,
        'image-size': false
      };
      
      // Add external for image-size
      config.externals = config.externals || {};
      config.externals['image-size'] = 'commonjs image-size';
    }

    return config;
  },
};

export default config;
