// app/manifest.ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Next.js PWA Example',
    short_name: 'PWA Ex',
    description: 'A Progressive Web App built with Next.js 15',
    start_url: '/',
    display: 'standalone',
    display_override: ['fullscreen', 'minimal-ui', 'standalone'], // Best UX 2025+
    background_color: '#ffffff',
    theme_color: '#000000',

    icons: [
      // Standard PWA icons (required)
      { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },

      // Extra sizes for maximum compatibility (recommended)
      { src: '/icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { src: '/icon-180x180.png', sizes: '180x180', type: 'image/png' },
      { src: '/icon-256x256.png', sizes: '256x256', type: 'image/png' },
      { src: '/icon-384x384.png', sizes: '384x384', type: 'image/png' },

      // Maskable icons (for perfect rounded corners on Android 12+)
      {
        src: '/icon-maskable-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },

      // Apple Touch Icons (iOS Safari "Add to Home Screen")
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png'
      },

      // Windows tiles (optional but nice)
      {
        src: '/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png'
      },
    ],
  };
}