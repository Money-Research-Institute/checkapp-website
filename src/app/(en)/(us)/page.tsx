import type { Metadata } from 'next';
import { LandingPage } from '@/components/landing/LandingPage';
import { landingMetadata } from '@/lib/seo';

export const metadata: Metadata = landingMetadata('us');

export default function UsPage() {
  return <LandingPage region="us" />;
}
