import type { NextConfig } from "next";

const config: NextConfig = {
  // Configure the base path and asset prefix for Webflow Cloud deployment
  basePath: process.env.NODE_ENV === 'production' ? '/articles' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/articles' : '',
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
    ],
  },
  env: {
    DIRECTUS_URL: process.env.DIRECTUS_URL,
    DIRECTUS_TOKEN: process.env.DIRECTUS_TOKEN,
    DIRECTUS_EMAIL: process.env.DIRECTUS_EMAIL,
    DIRECTUS_PASSWORD: process.env.DIRECTUS_PASSWORD,
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