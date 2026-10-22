import type { Viewport } from 'next';
import { RootShell } from '@/components/layout/RootShell';
import { THEME_COLOR } from '@/lib/constants';
import { fontVariables } from '@/lib/fonts/latin';
import { siteMetadata } from '@/lib/site-metadata';

/**
 * Root layout of every English page: `/`, `/eu/`, `/gulf/` and all the inner pages. `<html lang="en">`, Latin fonts only.
 * The Russian page has its own root layout (`app/(ru)/layout.tsx`), because Next.js allows one `lang` per root layout.
 * What the visitor sees around a page is `SiteFrame`, rendered by the layout of each page group below this one.
 */
export const metadata = siteMetadata;

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
  colorScheme: 'dark',
};

export default function EnglishRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <RootShell locale="en" fontVariables={fontVariables}>
      {children}
    </RootShell>
  );
}
