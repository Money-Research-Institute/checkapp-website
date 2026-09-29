import Link from 'next/link';
import { SiteImage } from '@/components/ui/SiteImage';
import { SITE_NAME, SOCIAL_LINKS } from '@/lib/constants';
import { ShieldAlert } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-forest text-white">
      {/* Medical disclaimer — persistent, above main footer */}
      <div className="border-b border-white/[0.08] bg-white/[0.04]">
        <div className="mx-auto flex max-w-6xl items-start gap-3 px-5 py-4 text-xs leading-relaxed text-white/50 md:px-8">
          <ShieldAlert size={16} className="mt-0.5 shrink-0 text-white/40" aria-hidden="true" />
          <p>
            <strong className="text-white/70">Medical Disclaimer:</strong> CheckApp and DIDI are wellness
            companions, not medical devices. The information, signals, and suggestions provided are
            for general wellness guidance only and do not constitute medical advice, a diagnosis, or
            a treatment plan. Always consult a qualified healthcare professional for any medical
            concerns. CheckApp does not claim to diagnose, treat, cure, or prevent any condition or disease.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5">
              <SiteImage
                src="/assets/didi-avatar-header.png"
                alt={`${SITE_NAME} logo`}
                width={36}
                height={36}
                className="rounded-full"
              />
              <span className="font-display text-lg font-bold">{SITE_NAME}</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Your AI wellness companion. DIDI monitors hydration signals, checks in daily, and helps you build habits that last.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/40">Product</h3>
            <ul className="space-y-2">
              <li><Link href="/features" className="text-sm text-white/70 transition-colors hover:text-white">Features</Link></li>
              <li><Link href="/how-it-works" className="text-sm text-white/70 transition-colors hover:text-white">How It Works</Link></li>
              <li><Link href="/blog" className="text-sm text-white/70 transition-colors hover:text-white">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/40">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-sm text-white/70 transition-colors hover:text-white">Privacy</Link></li>
              <li><Link href="/terms" className="text-sm text-white/70 transition-colors hover:text-white">Terms</Link></li>
              <li><Link href="/delete-account" className="text-sm text-white/70 transition-colors hover:text-white">Delete account</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/40">Connect</h3>
            <ul className="space-y-2">
              <li><a href={SOCIAL_LINKS.instagram} className="text-sm text-white/70 transition-colors hover:text-white" target="_blank" rel="noopener noreferrer">Instagram</a></li>
              <li><a href={SOCIAL_LINKS.twitter} className="text-sm text-white/70 transition-colors hover:text-white" target="_blank" rel="noopener noreferrer">Twitter/X</a></li>
              <li><Link href="/contact" className="text-sm text-white/70 transition-colors hover:text-white">Contact</Link></li>
              <li><a href={SOCIAL_LINKS.contact} className="text-sm text-white/70 transition-colors hover:text-white">hello@checkapp.today</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.08] pt-8 text-sm text-white/50 md:flex-row">
          <p>© 2026 {SITE_NAME} · For wellness guidance only · Not a medical device</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="transition-colors hover:text-white">Privacy</Link>
            <Link href="/terms" className="transition-colors hover:text-white">Terms</Link>
            <Link href="/delete-account" className="transition-colors hover:text-white">Delete account</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
