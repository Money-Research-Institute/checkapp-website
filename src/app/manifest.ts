import type { MetadataRoute } from 'next';
import { SITE_NAME, THEME_COLOR } from '@/lib/constants';
import { withBasePath } from '@/lib/paths';

// Static export: the manifest is written to out/manifest.webmanifest at build time.
export const dynamic = 'force-static';

/** Web app manifest. Icons are the DiDi kit in public/brand/icons (docs/brand.md); `maskable` has the Android safe zone. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: 'Your digital health companion. Snap a photo of your tongue, face or iris and DiDi shares a short wellness insight.',
    start_url: withBasePath('/'),
    scope: withBasePath('/'),
    display: 'standalone',
    background_color: THEME_COLOR,
    theme_color: THEME_COLOR,
    icons: [
      { src: withBasePath('/brand/icons/icon-192.png'), sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: withBasePath('/brand/icons/icon-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: withBasePath('/brand/icons/maskable-512.png'), sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
