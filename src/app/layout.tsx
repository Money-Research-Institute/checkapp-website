import { DM_Sans, DM_Mono, Bricolage_Grotesque } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileCtaBar } from '@/components/layout/MobileCtaBar';
import { PostHogProvider } from '@/components/layout/PostHogProvider';
import { ScrollDepthTracker } from '@/components/layout/ScrollDepthTracker';
import { CookieConsent } from '@/components/layout/CookieConsent';
import { JsonLd } from '@/components/layout/JsonLd';
import { createMetadata, mobileApplicationSchema, organizationSchema } from '@/lib/seo';
import './globals.css';

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  display: 'swap',
});

const bricolage = Bricolage_Grotesque({
  variable: '--font-bricolage',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
});

const dmMono = DM_Mono({
  variable: '--font-dm-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});

export const metadata: Metadata = {
  ...createMetadata({
    title: 'CheckApp — Your AI Health Companion. Meet DIDI.',
    description:
      'CheckApp is an AI-powered wellness app where DIDI — your personal health companion — tracks hydration, analyzes your tongue scans, and checks in on you every day.',
    path: '/',
  }),
  other: { yandex: 'noindex, nofollow' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${bricolage.variable} ${dmMono.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full flex flex-col font-sans antialiased pb-20 md:pb-0">
        <JsonLd data={[organizationSchema(), mobileApplicationSchema()]} />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileCtaBar />
        <PostHogProvider />
        <ScrollDepthTracker />
        {/* Vercel Analytics — no-op on GitHub Pages; kept for Vercel deployments */}
        <Analytics />
        <CookieConsent />
      </body>
    </html>
  );
}
