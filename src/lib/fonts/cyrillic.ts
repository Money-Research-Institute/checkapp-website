/**
 * Fonts of the Russian page: the same three families and the same CSS variables as ./latin.ts, with the Cyrillic subset added
 * to Manrope and Inter. next/font emits one @font-face per subset with a unicode-range, so the Latin letters on the page (the
 * wordmark, "DiDi") still come from the Latin file and the browser fetches a Cyrillic file only for Cyrillic text. Bricolage
 * stays Latin only: the wordmark is "checkapp".
 *
 * Same `display: swap`, same Manrope-only preload, same size-adjusted fallback as the English set, so the swap behaves the
 * same in both languages. Kept in its own module so English pages never pull it in.
 */
import { Bricolage_Grotesque, Inter, Manrope } from 'next/font/google';

const manrope = Manrope({ variable: '--font-manrope', subsets: ['latin', 'cyrillic'], display: 'swap' });
const inter = Inter({ variable: '--font-inter', subsets: ['latin', 'cyrillic'], display: 'swap', preload: false });
const bricolage = Bricolage_Grotesque({ variable: '--font-bricolage', subsets: ['latin'], display: 'swap', preload: false });

/** `className` for <html>: defines --font-manrope, --font-inter and --font-bricolage. */
export const fontVariables = `${manrope.variable} ${inter.variable} ${bricolage.variable}`;
