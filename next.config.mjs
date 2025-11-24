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
};

export default nextConfig;

