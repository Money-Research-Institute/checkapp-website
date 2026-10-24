import { SiteFrame } from '@/components/layout/SiteFrame';

/** The shell of the `us` landing page. One layout per landing page, so the footer and the CTA know their region. */
export default function UsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SiteFrame locale="en" region="us">
      {children}
    </SiteFrame>
  );
}
