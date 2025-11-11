/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable PWA in production
  ...(process.env.NODE_ENV === 'production' && {
    // PWA configuration can be added here if needed
  }),
}

export default nextConfig

