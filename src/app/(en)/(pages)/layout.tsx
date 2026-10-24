import { SiteFrame } from '@/components/layout/SiteFrame';

/** Every inner page (about, blog, privacy, ...): the English shell, no landing region. */
export default function PagesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SiteFrame locale="en">{children}</SiteFrame>;
}
