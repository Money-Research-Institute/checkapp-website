import type { Viewport } from 'next';
import { RootShell } from '@/components/layout/RootShell';
import { THEME_COLOR } from '@/lib/constants';
import { fontVariables } from '@/lib/fonts/cyrillic';
import { siteMetadata } from '@/lib/site-metadata';

/**
 * Root layout of the Russian page (`/ru/`): `<html lang="ru">` and the Cyrillic font set. Everything else is shared with the
 * English layout through `RootShell`, so there is no layout code to keep in step.
 */
export const metadata = siteMetadata;

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
  colorScheme: 'dark',
};

export default function RussianRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <RootShell locale="ru" fontVariables={fontVariables}>
      {children}
    </RootShell>
  );
}
