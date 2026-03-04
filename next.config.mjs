/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // API keys are loaded from .env.local (never commit that file)
  // On VPS: create /var/www/planthesia/.env.local with your keys
}

export default nextConfig
