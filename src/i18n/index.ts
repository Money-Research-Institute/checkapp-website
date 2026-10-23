import type { Locale } from '@/content/copy';
import { en, type Dict } from './en';
import { ru } from './ru';
import { typesetInPlace } from './typeset';

export type { Dict } from './en';

// Russian typography (a dash stays with the word before it): done once, here, so no string in ru.ts carries the invisible character.
typesetInPlace(ru);

const dictionaries: Record<Locale, Dict> = { en, ru };

/** The shell strings of a locale. A plain lookup: no provider, no runtime, nothing shipped to the browser by itself. */
export const getDict = (locale: Locale): Dict => dictionaries[locale];

/** Fill `{name}` placeholders in a dictionary string. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) => (key in values ? String(values[key]) : whole));
}
