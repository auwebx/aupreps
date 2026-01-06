// app/manifest.ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AUPreps',
    short_name: 'AUPreps',
    description: 'An Exam Application',
    start_url: '/',
    display: 'standalone',
    display_override: ['fullscreen', 'minimal-ui', 'standalone'], // Best UX 2025+
    background_color: '#ffffff',
    theme_color: '#000000',

    icons: [
      // Standard PWA icons (required)
      { src: '/logo.png', sizes: '192x192', type: 'image/png' },
      { src: '/logo.png', sizes: '512x512', type: 'image/png' },

      // Extra sizes for maximum compatibility (recommended)
      { src: '/logo.png', sizes: '144x144', type: 'image/png' },
      { src: '/logo.png', sizes: '180x180', type: 'image/png' },
      { src: '/logo.png', sizes: '256x256', type: 'image/png' },
      { src: '/logo.png', sizes: '384x384', type: 'image/png' },

      // Maskable icons (for perfect rounded corners on Android 12+)
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },

      // Apple Touch Icons (iOS Safari "Add to Home Screen")
      {
        src: '/logo.png',
        sizes: '180x180',
        type: 'image/png'
      },

      // Windows tiles (optional but nice)
      {
        src: '/logo.png',
        sizes: '144x144',
        type: 'image/png'
      },
    ],
  };
}