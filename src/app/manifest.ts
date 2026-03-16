import { MetadataRoute } from 'next'

/**
 * @fileOverview Génère dynamiquement le manifest de la PWA pour AngelWatch.
 * L'utilisation d'une route dynamique aide à résoudre les problèmes de CORS 
 * dans certains environnements de développement.
 */

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AngelWatch',
    short_name: 'AngelWatch',
    description: 'La sécurité routière, notre engagement. Professionnels du rapatriement de véhicules.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a111a',
    theme_color: '#0a111a',
    icons: [
      {
        src: 'https://picsum.photos/seed/angelwatch-logo/192/192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://picsum.photos/seed/angelwatch-logo/512/512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
