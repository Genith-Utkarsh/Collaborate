/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  experimental: {
    // Enable if you want to use experimental features
  },
  images: {
    domains: ['avatars.githubusercontent.com', 'github.com'],
    unoptimized: true
  }
}

module.exports = nextConfig
