/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output for robust Docker deployment
  output: "standalone",
  
  // Use Turbopack (default in Next.js 16) with empty config to silence warning
  turbopack: {},
  
  // Externalize WordPress packages to avoid module resolution issues
  serverExternalPackages: [
    '@wordpress/block-library',
    '@wordpress/blocks',
    '@wordpress/block-serialization-default-parser',
    '@wordpress/components',
    '@wordpress/data',
    '@wordpress/element',
    '@wordpress/hooks',
    '@wordpress/i18n',
    '@wordpress/compose',
    '@wordpress/redux-routine',
    '@wordpress/primitives',
    '@wordpress/icons',
    'jsdom',
  ],
  
  // Skip TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Webpack config to handle WordPress package ESM/CJS issues
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@wordpress/data': 'commonjs @wordpress/data',
        '@wordpress/blocks': 'commonjs @wordpress/blocks',
        '@wordpress/block-library': 'commonjs @wordpress/block-library',
      });
    }
    return config;
  },
};

export default nextConfig;
