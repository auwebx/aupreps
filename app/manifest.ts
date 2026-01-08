// app/manifest.ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AUPreps - WAEC, JAMB, NECO Past Questions',
    short_name: 'AUPreps',
    description: 'The #1 WAEC/JAMB Practice Platform in Nigeria, Africa & Across the World. Access thousands of past questions and practice tests.',
    start_url: '/',
    display: 'standalone',
    display_override: ['fullscreen', 'minimal-ui', 'standalone'],
    background_color: '#0f172a',
    theme_color: '#0f172a',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'en-NG',
    dir: 'ltr',
    categories: ['education', 'productivity'],

    icons: [
      // Your existing icons from manifest.json
      {
        src: '/icons/icon-48x48.png',
        sizes: '48x48',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      // Apple Touch Icon for iOS
      {
        src: '/icons/icon-192x192.png',
        sizes: '180x180',
        type: 'image/png',
      }
    ],

    screenshots: [
      {
        src: '/screenshots/desktop-1.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: 'AUPreps Dashboard'
      },
      {
        src: '/screenshots/mobile-1.png',
        sizes: '750x1334',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'AUPreps Mobile View'
      }
    ],

    shortcuts: [
      {
        name: 'Practice Questions',
        short_name: 'Practice',
        description: 'Start practicing past questions',
        url: '/practice',
        icons: [
          {
            src: '/icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          }
        ]
      },
      {
        name: 'Mock Exams',
        short_name: 'Mock Exam',
        description: 'Take a mock exam',
        url: '/mock-exams',
        icons: [
          {
            src: '/icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          }
        ]
      },
      {
        name: 'My Progress',
        short_name: 'Progress',
        description: 'View your progress',
        url: '/progress',
        icons: [
          {
            src: '/icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          }
        ]
      }
    ],

    related_applications: [],
    prefer_related_applications: false
  };
}