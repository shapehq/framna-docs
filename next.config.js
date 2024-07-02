/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Allows production builds to successfully complete even if it has linting errors.
    // This is only OK because we do linting as part of our CI setup.
    ignoreDuringBuilds: true,
  },
  // Output standalone to be used for Docker builds.
  output: 'standalone',
}

module.exports = nextConfig
