/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
  webpack: (config, { isServer }) => {
    // Phaser is browser-only, don't bundle on server
    if (isServer) {
      config.externals = [...(config.externals || []), 'phaser'];
    }
    return config;
  },
};

export default nextConfig;
