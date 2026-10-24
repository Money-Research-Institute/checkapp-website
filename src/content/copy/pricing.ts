import type { Region } from './types';

/**
 * The price the client's subscription lines and the "How much does it cost?" answer quote. The client's text carries
 * [Price] (and [AED/SAR] in the Gulf) as placeholders and nobody has supplied the numbers, so every region is null:
 * the lines that need a price are withheld, never shown with a placeholder in them (the gate fails on `{price}`).
 * Fill a region in here when the client confirms the real figure, with the store-approved wording of its currency.
 */
export const Prices: Record<Region, { price: string; currency?: string } | null> = {
  us: null,
  eu: null,
  gulf: null,
  ru: null,
};

/** Fill {price} / {currency}; null when the region has no price yet (or the template needs a currency it lacks). */
export function withPrice(template: string, region: Region): string | null {
  const p = Prices[region];
  if (!p) return null;
  if (template.includes('{currency}') && !p.currency) return null;
  return template.replace('{price}', p.price).replace('{currency}', p.currency ?? '');
}
