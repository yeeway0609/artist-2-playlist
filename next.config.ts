import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // The Spotify OAuth flow requires serving the app over the 127.0.0.1 loopback
  // (localhost is no longer an allowed redirect URI), so allow it as a dev origin.
  allowedDevOrigins: ['127.0.0.1'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
      },
    ],
  },
}

export default nextConfig
