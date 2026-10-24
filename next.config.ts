import type { NextConfig } from "next";

// Set GITHUB_PAGES_BASE_PATH=/repo-name when building for GitHub Pages project sites.
// Leave unset for Vercel, custom domain, or username.github.io root sites.
const basePath = process.env.GITHUB_PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  // Two root layouts (<html lang="en"> and <html lang="ru">) leave no single layout to build the 404 from, so the 404 is a
  // whole document of its own: src/app/global-not-found.tsx.
  experimental: {
    globalNotFound: true,
    cssChunking: 'graph',
  },
  turbopack: {
    root: process.cwd(),
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
