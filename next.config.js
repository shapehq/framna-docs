/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Allows production builds to successfully complete even if it has linting errors.
    // This is only OK bevause we do linting as part of our CI setup.
    ignoreDuringBuilds: true,
  }
}

module.exports = nextConfig
