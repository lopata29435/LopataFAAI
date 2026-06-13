/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // Keep the Postgres driver as a real node_modules package (not bundled),
  // so the standalone image ships it and migrate/seed scripts can resolve it.
  serverExternalPackages: ["postgres"],
};

export default nextConfig;
