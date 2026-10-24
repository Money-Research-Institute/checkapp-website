import { ACCOUNT_DELETION_PATH, SOCIAL_LINKS } from '@/lib/constants';

/**
 * The footer's three link groups (Figma 2601:12661: Product / Company / Connect) and the legal links that repeat in
 * the bottom bar. Every internal path keeps its trailing slash (trailingSlash: true), and the account-deletion path
 * comes from constants so the Play Console URL and the footer can never drift apart.
 */
export type FooterLinkItem = {
  /** Key of the label in the shell dictionary (`dict.footer`). The e-mail address labels itself. */
  label: 'features' | 'howItWorks' | 'blog' | 'privacy' | 'terms' | 'deleteAccount' | 'instagram' | 'twitter' | 'contact' | 'email';
  href: string;
  /** 'external' opens a new tab (rel noopener noreferrer + a spoken "(opens in a new tab)"); 'mail' is a mailto:. */
  kind?: 'external' | 'mail';
  /** `false` keeps the router from prefetching the page (the blog: its cover photos come from a third party). See NAV_LINKS. */
  prefetch?: false;
};

export const PRODUCT_LINKS: readonly FooterLinkItem[] = [
  { label: 'features', href: '/features/' },
  { label: 'howItWorks', href: '/how-it-works/' },
  { label: 'blog', href: '/blog/', prefetch: false },
];

export const COMPANY_LINKS: readonly FooterLinkItem[] = [
  { label: 'privacy', href: '/privacy/' },
  { label: 'terms', href: '/terms/' },
  { label: 'deleteAccount', href: ACCOUNT_DELETION_PATH },
];

export const CONNECT_LINKS: readonly FooterLinkItem[] = [
  { label: 'instagram', href: SOCIAL_LINKS.instagram, kind: 'external' },
  { label: 'twitter', href: SOCIAL_LINKS.twitter, kind: 'external' },
  { label: 'contact', href: '/contact/' },
  { label: 'email', href: SOCIAL_LINKS.contact, kind: 'mail' },
];

/** The same three targets as the Company column, repeated at the right of the bottom bar (Figma 2601:12711). */
export const LEGAL_LINKS: readonly FooterLinkItem[] = COMPANY_LINKS;
