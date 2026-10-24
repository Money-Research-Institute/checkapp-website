import type { Metadata } from 'next';
import { LandingPage } from '@/components/landing/LandingPage';
import { landingMetadata } from '@/lib/seo';

export const metadata: Metadata = landingMetadata('eu');

export default function EuPage() {
  return <LandingPage region="eu" />;
}
