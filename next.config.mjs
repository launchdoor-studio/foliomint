/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Keep libsql out of the webpack bundle to avoid dev HMR corruption
    // (__webpack_modules__[id] is not a function) after incremental compiles.
    serverComponentsExternalPackages: ['@libsql/client'],
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'media.licdn.com',
      },
    ],
  },
};

export default nextConfig;
