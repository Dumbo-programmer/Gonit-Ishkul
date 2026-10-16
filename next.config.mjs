/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [],
  },
  experimental: {
    // Keep Prisma external so the serverless bundler can trace its engine binaries.
    serverComponentsExternalPackages: ["@prisma/client", "prisma"],
    // Ensure the native query engine ships with the serverless function bundle
    // (needed on Netlify/Vercel, where the runtime differs from the build image).
    outputFileTracingIncludes: {
      "/**": ["./node_modules/.prisma/client/**/*"],
    },
  },
};

export default nextConfig;
