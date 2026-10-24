import { SiteFrame } from '@/components/layout/SiteFrame';

/** The shell of the `eu` landing page. One layout per landing page, so the footer and the CTA know their region. */
export default function EuLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SiteFrame locale="en" region="eu">
      {children}
    </SiteFrame>
  );
}
