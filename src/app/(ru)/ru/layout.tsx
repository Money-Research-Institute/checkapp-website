import { SiteFrame } from '@/components/layout/SiteFrame';

/** The shell of the `ru` landing page. One layout per landing page, so the footer and the CTA know their region. */
export default function RuLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SiteFrame locale="ru" region="ru">
      {children}
    </SiteFrame>
  );
}
