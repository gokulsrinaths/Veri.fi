/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@verifi/shared"],
  experimental: {
    serverComponentsExternalPackages: ["ethers"],
  },
};

module.exports = nextConfig;
