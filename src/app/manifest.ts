import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Artist2Playlist',
    short_name: 'Artist2Playlist',
    description: 'Add all songs of any artist to your playlists on Spotify.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0B0D1C',
    theme_color: '#D9D9F8',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}

