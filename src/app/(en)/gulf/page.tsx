import type { Metadata } from 'next';
import { LandingPage } from '@/components/landing/LandingPage';
import { landingMetadata } from '@/lib/seo';

export const metadata: Metadata = landingMetadata('gulf');

export default function GulfPage() {
  return <LandingPage region="gulf" />;
}
