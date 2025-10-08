
/**
 * Determines if we're in Webflow production environment
 */
function isWebflowProduction() {
  // Check deployment target - Netlify should NOT use Webflow paths
  const deploymentTarget = process.env.DEPLOYMENT_TARGET?.toLowerCase();
  if (deploymentTarget === 'netlify') {
    return false;
  }
  
  // Check if explicitly set to production deployment
  const explicitEnv = process.env.DEPLOYMENT_ENV?.toLowerCase();
  if (explicitEnv === 'production' && deploymentTarget === 'webflow') {
    return true;
  }
  
  // In production builds, default to Webflow unless explicitly set to local or netlify
  if (process.env.NODE_ENV === 'production') {
    // Skip Webflow paths for local or netlify deployments
    if (explicitEnv === 'local' || deploymentTarget === 'netlify') {
      return false;
    }
    // Default to Webflow for production builds
    return true;
  }
  
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
