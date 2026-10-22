import Link from 'next/link';
import { Lockup } from '@/components/brand/Lockup';
import { Container } from '@/components/ds/Container';
import { SITE_NAME, SOCIAL_LINKS } from '@/lib/constants';

/**
 * FOUNDATION STUB, owned by the footer task (it replaces this file). Contract it keeps:
 * root <footer data-section="footer" data-figma-node="2601:12661">, the Medical Disclaimer as <p data-disclaimer>,
 * the copyright line, 44px link targets, padding-top from --footer-runway so the final CTA can overlap it.
 */
const link = 'inline-flex tap items-center text-sm text-fg-70 transition-colors hover:text-fg';

export function Footer() {
  return (
    <footer
      data-section="footer"
      data-figma-node="2601:12661"
      aria-label="Site footer"
      className="relative overflow-clip bg-bg text-fg"
      style={{ paddingTop: 'var(--footer-runway)' }}
    >
      <Container size="wide">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Lockup size={32} />
            <p className="mt-4 text-sm leading-relaxed text-fg-60">
              Your daily wellness companion. DiDi checks in with you, looks at what you share and explains what it notices in
              plain language.
            </p>
          </div>

          <nav aria-label="Product">
            <h2 className="mb-2 font-brand text-xs font-semibold uppercase tracking-[0.04em] text-fg-60">Product</h2>
            <ul>
              <li><Link href="/features/" className={link}>Features</Link></li>
              <li><Link href="/how-it-works/" className={link}>How it works</Link></li>
              <li><Link href="/blog/" className={link}>Blog</Link></li>
            </ul>
          </nav>

          <nav aria-label="Company">
            <h2 className="mb-2 font-brand text-xs font-semibold uppercase tracking-[0.04em] text-fg-60">Company</h2>
            <ul>
              <li><Link href="/privacy/" className={link}>Privacy</Link></li>
              <li><Link href="/terms/" className={link}>Terms</Link></li>
              <li><Link href="/delete-account/" className={link}>Delete account</Link></li>
            </ul>
          </nav>

          <nav aria-label="Connect">
            <h2 className="mb-2 font-brand text-xs font-semibold uppercase tracking-[0.04em] text-fg-60">Connect</h2>
            <ul>
              <li><a href={SOCIAL_LINKS.instagram} className={link} target="_blank" rel="noopener noreferrer">Instagram</a></li>
              <li><a href={SOCIAL_LINKS.twitter} className={link} target="_blank" rel="noopener noreferrer">Twitter/X</a></li>
              <li><Link href="/contact/" className={link}>Contact</Link></li>
              <li><a href={SOCIAL_LINKS.contact} className={link}>hello@checkapp.today</a></li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 border-t border-white/[0.08] pt-6">
          <p data-disclaimer className="text-xs leading-relaxed text-fg-60">
            <strong className="font-semibold text-fg-70">Medical Disclaimer:</strong> CheckApp and DiDi are wellness
            companions, not medical devices. The information, signals, and suggestions provided are for general wellness
            guidance only and do not constitute medical advice, a diagnosis, or a treatment plan. Always consult a qualified
            healthcare professional for any medical concerns. CheckApp does not claim to diagnose, treat, cure, or prevent
            any condition or disease.
          </p>
          <p className="mt-6 pb-8 text-sm text-fg-50">
            © 2026 {SITE_NAME} · For wellness guidance only · Not a medical device
          </p>
        </div>
      </Container>
    </footer>
  );
}
