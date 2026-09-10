/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  // Static export: GitHub Pages serves plain files, no Node runtime.
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  // Directory-style URLs (/hades/index.html) so Pages resolves every route.
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
