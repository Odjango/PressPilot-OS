/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Skip lint errors in Coolify CI
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip TS errors in Coolify CI
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: [
      '@wordpress/block-library',
      '@wordpress/blocks',
      '@wordpress/block-serialization-default-parser',
      '@wordpress/components',
      '@wordpress/data',
      '@wordpress/element',
      '@wordpress/hooks',
      'canvas',
      'jsdom',
    ],
  },
};

export default nextConfig;

