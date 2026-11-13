/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow server actions and edge runtime where applicable
  experimental: {
    serverComponentsExternalPackages: []
  }
};

export default nextConfig;

