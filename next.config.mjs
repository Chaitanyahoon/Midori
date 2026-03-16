/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  // Turbopack root — ensure Turbopack uses this project directory as root
  turbopack: {
    root: "./",
  },
  // API keys are loaded from .env.local at runtime. Do not commit .env.local.
  // Avoid embedding fallback/dummy keys here so the real env values are used.
}

export default nextConfig
