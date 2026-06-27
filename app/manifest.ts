import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mindlura | Trading Psychology Platform',
    short_name: 'Mindlura',
    description: 'Premium trading psychology and performance intelligence platform',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#020510',
    theme_color: '#020510',
    lang: 'fa',
    dir: 'rtl',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
