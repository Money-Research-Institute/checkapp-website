import type { Metadata } from 'next';
import { SITE_URL } from './constants';

/**
 * Metadata every page inherits from its root layout: the base URL that relative URLs resolve against, and the Yandex block
 * the site has carried since cccaafc (robots.txt disallows the Yandex bots too). Titles, descriptions, canonicals and
 * hreflang belong to each page (`createMetadata`, `landingMetadata` in src/lib/seo.ts).
 *
 * Icons are not declared here: `app/icon.png`, `app/apple-icon.png` and `app/favicon.ico` are Next file conventions and are
 * linked automatically; the manifest (`app/manifest.ts`) carries the 192 / 512 / maskable set. The Open Graph and Twitter
 * image (1200 x 630) comes from `createMetadata`.
 */
export const siteMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  other: { yandex: 'noindex, nofollow' },
};
