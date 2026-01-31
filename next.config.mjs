import { withSentryConfig } from '@sentry/nextjs';
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

  // Allow images from Supabase storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cvrmocmvelfacjigzrfu.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Skip TypeScript errors during build
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
  async redirects() {
    return [
      {
        source: '/studio/new',
        destination: '/studio',
        permanent: true,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "omar-26",

  project: "presspilot",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
