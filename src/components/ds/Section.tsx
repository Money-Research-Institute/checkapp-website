import type { ReactNode } from 'react';
import { Container } from './Container';
import { Eyebrow } from './Eyebrow';
import { GradientHeading } from './GradientHeading';
import styles from './Section.module.css';

/**
 * Inner-page building blocks. Every inner page is: <PageShell> <PageHero/> <Section/>... </PageShell>.
 * (The landing sections have their own components in src/components/landing/.)
 */

/** Wraps a page's content and clears the fixed header (`--header-h`). Not a landmark: the layout owns <main>. */
export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={[styles.shell, className].filter(Boolean).join(' ')}>{children}</div>;
}

/** The top of an inner page: optional eyebrow, the page's single h1, a lede and optional actions. */
export function PageHero({
  eyebrow,
  title,
  lede,
  actions,
  align = 'center',
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  actions?: ReactNode;
  align?: 'center' | 'left';
}) {
  return (
    <header className={[styles.hero, align === 'left' ? styles.heroLeft : ''].filter(Boolean).join(' ')}>
      <Container size="narrow" className={styles.heroInner}>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <GradientHeading as="h1" size="hero" align={align}>
          {title}
        </GradientHeading>
        {lede ? <p className={styles.lede}>{lede}</p> : null}
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </Container>
    </header>
  );
}

/** A vertical band of an inner page with the site's fluid rhythm and the standard column. */
export function Section({
  id,
  size = 'wide',
  tight = false,
  labelledBy,
  className,
  children,
}: {
  id?: string;
  size?: 'wide' | 'narrow' | 'prose';
  /** Half the vertical padding, for runs of related sections. */
  tight?: boolean;
  labelledBy?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={[styles.section, tight ? styles.tight : '', className].filter(Boolean).join(' ')}
    >
      <Container size={size}>{children}</Container>
    </section>
  );
}
