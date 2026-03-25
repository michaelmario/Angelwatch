import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AngelWatch',
    short_name: 'AngelWatch',
    description: 'Sécurité routière et raccompagnement à La Réunion',
    start_url: '/',
    display: 'standalone',
    background_color: '#EBF1F4',
    theme_color: '#2D598F',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}