import type { Metadata, Viewport } from 'next';
import { NotFoundView } from '@/components/layout/NotFoundView';
import { RootShell } from '@/components/layout/RootShell';
import { SiteFrame } from '@/components/layout/SiteFrame';
import { THEME_COLOR } from '@/lib/constants';
import { fontVariables } from '@/lib/fonts/latin';
import { siteMetadata } from '@/lib/site-metadata';

/**
 * The branded 404, written to out/404.html. The site has two root layouts (one `lang` each), so there is no single layout
 * to compose a not-found page from; `global-not-found` renders a whole document instead (next.config: experimental.globalNotFound).
 * A static host serves one 404 for every missing URL, so it is English: the default for every page that is not a landing page.
 */
export const metadata: Metadata = {
  ...siteMetadata,
  title: 'Page not found',
  robots: { index: false, follow: true },
};

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
  colorScheme: 'dark',
};

export default function GlobalNotFound() {
  return (
    <RootShell locale="en" fontVariables={fontVariables}>
      <SiteFrame locale="en">
        <NotFoundView locale="en" />
      </SiteFrame>
    </RootShell>
  );
}
