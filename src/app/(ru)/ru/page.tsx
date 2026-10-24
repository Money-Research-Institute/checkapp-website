import type { Metadata } from 'next';
import { LandingPage } from '@/components/landing/LandingPage';
import { landingMetadata } from '@/lib/seo';

export const metadata: Metadata = landingMetadata('ru');

export default function RuPage() {
  return <LandingPage region="ru" />;
}
