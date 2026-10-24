/**
 * Fonts of every English page (docs/landing-decisions.md D4): Manrope, Inter and Bricolage Grotesque, Latin subset only.
 * No Cyrillic file is declared, preloaded or requested from here. The Russian page has its own set in ./cyrillic.ts; the two
 * live in separate modules so an English page never bundles the Cyrillic @font-face rules.
 *
 * `display: swap` and next/font's size-adjusted fallback ("Manrope Fallback") keep the swap from moving layout. Manrope is the
 * only preloaded family: it carries every heading and paragraph. Inter is the small UI text on the hero mock-ups and
 * Bricolage is the wordmark. next/font needs its loaders called at module scope with literal options.
 */
import { Bricolage_Grotesque, Inter, Manrope } from 'next/font/google';

const manrope = Manrope({ variable: '--font-manrope', subsets: ['latin'], display: 'swap' });
const inter = Inter({ variable: '--font-inter', subsets: ['latin'], display: 'swap', preload: false });
const bricolage = Bricolage_Grotesque({ variable: '--font-bricolage', subsets: ['latin'], display: 'swap', preload: false });

/** `className` for <html>: defines --font-manrope, --font-inter and --font-bricolage. */
export const fontVariables = `${manrope.variable} ${inter.variable} ${bricolage.variable}`;
