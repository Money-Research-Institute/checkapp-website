import { SiteFrame } from '@/components/layout/SiteFrame';

/** The shell of the `gulf` landing page. One layout per landing page, so the footer and the CTA know their region. */
export default function GulfLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SiteFrame locale="en" region="gulf">
      {children}
    </SiteFrame>
  );
}
