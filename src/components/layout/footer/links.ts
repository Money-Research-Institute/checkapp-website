import { SOCIAL_LINKS } from '@/lib/constants';

/**
 * The footer's three link groups (Figma 2601:12661: Product / Company / Connect). Each link appears once: the bottom bar
 * carries only the copyright and the region switcher. Every internal path keeps its trailing slash (trailingSlash: true).
 * "Delete account" is deliberately not here: the page stays public (Play Console URL, ACCOUNT_DELETION_PATH) and is linked
 * from the privacy policy and the contact page, where someone who wants it will look.
 */
export type FooterLinkItem = {
  /** Key of the label in the shell dictionary (`dict.footer`). The e-mail address labels itself. */
  label: 'features' | 'howItWorks' | 'blog' | 'privacy' | 'terms' | 'instagram' | 'twitter' | 'contact' | 'email';
  href: string;
  /** 'external' opens a new tab (rel noopener noreferrer + a spoken "(opens in a new tab)"); 'mail' is a mailto:. */
  kind?: 'external' | 'mail';
};

export const PRODUCT_LINKS: readonly FooterLinkItem[] = [
  { label: 'features', href: '/features/' },
  { label: 'howItWorks', href: '/how-it-works/' },
  { label: 'blog', href: '/blog/' },
];

export const COMPANY_LINKS: readonly FooterLinkItem[] = [
  { label: 'contact', href: '/contact/' },
  { label: 'privacy', href: '/privacy/' },
  { label: 'terms', href: '/terms/' },
];

export const CONNECT_LINKS: readonly FooterLinkItem[] = [
  { label: 'instagram', href: SOCIAL_LINKS.instagram, kind: 'external' },
  { label: 'twitter', href: SOCIAL_LINKS.twitter, kind: 'external' },
  { label: 'email', href: SOCIAL_LINKS.contact, kind: 'mail' },
];
