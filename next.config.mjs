
import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX({
  buildSearchIndex: false,
  remarkImageOptions: false, // Disable image size fetching
});

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  transpilePackages: ['fumadocs-ui', 'fumadocs-core', 'fumadocs-mdx'],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8055',
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
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { fs: false };
    }
    return config;
  },
};

export default withMDX(config);
