/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true, // valfritt, men appDir ska inte finnas här i Next 14
  },
}

module.exports = nextConfig
