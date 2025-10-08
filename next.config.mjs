
/**
 * Determines if we're in Webflow production environment
 */
function isWebflowProduction() {
  // Netlify automatically sets NETLIFY=true during builds
  if (process.env.NETLIFY === 'true') {
    console.log('[next.config.mjs] Detected Netlify environment - disabling Webflow basePath');
    return false;
  }
  
  // Check deployment target - Netlify should NOT use Webflow paths
  const deploymentTarget = process.env.DEPLOYMENT_TARGET?.toLowerCase();
  if (deploymentTarget === 'netlify') {
    console.log('[next.config.mjs] DEPLOYMENT_TARGET=netlify - disabling Webflow basePath');
    return false;
  }
  
  // Check if explicitly set to production deployment
  const explicitEnv = process.env.DEPLOYMENT_ENV?.toLowerCase();
  if (explicitEnv === 'production' && deploymentTarget === 'webflow') {
    console.log('[next.config.mjs] Webflow production mode enabled');
    return true;
  }
  
  // In production builds, default to Webflow unless explicitly set to local or netlify
  if (process.env.NODE_ENV === 'production') {
    // Skip Webflow paths for local or netlify deployments
    if (explicitEnv === 'local' || deploymentTarget === 'netlify') {
      console.log('[next.config.mjs] Production build with local/netlify target - disabling Webflow basePath');
      return false;
    }
    // Default to Webflow for production builds
    console.log('[next.config.mjs] Production build defaulting to Webflow mode');
    return true;
  }
  
  console.log('[next.config.mjs] Development mode - disabling Webflow basePath');
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
  // Note: Do NOT use the `env` config option as it exposes all variables to the client.
  // Next.js automatically makes NEXT_PUBLIC_* variables available to the browser,
  // while keeping other environment variables server-side only.
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
