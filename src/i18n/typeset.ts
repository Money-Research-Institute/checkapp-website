/**
 * Typography of the text, English and Russian.
 *
 * Two rules, both about where a line may NOT break. CSS cannot express either of them (no property controls where a line may
 * break before a dash or after a one-letter word), so each needs a no-break space (U+00A0) in the string:
 *
 * 1. A dash stays with the word before it (both languages). A line never starts with «— это 4P» or "— not a yearly appointment":
 *    it ends with the word and the dash goes with it. A plain space before the dash gives the browser a legal break right there.
 * 2. Russian only: a one- or two-letter preposition, conjunction, particle or short pronoun stays with the word after it
 *    («в облаке», «и возвращайся», «на тебе»), and «бы», «ли», «же» stay with the word BEFORE them («можно ли», «что же»). Russian
 *    typesetting never leaves «в», «и», «с», «о», «а», «не» at the end of a line; `text-wrap: pretty` and `balance` do not
 *    know that, so the browser strands them.
 *
 * The client's strings are stored verbatim (src/content/copy, which nobody edits), so the no-break spaces are put in at render
 * time, once, for the whole text of a language: `typeset-copy.ts` runs this over the client's copy and over every section's own
 * drafts (`src/components/landing/<slug>/copy.ts`), `index.ts` over the shell dictionaries. A section does not have to write
 * U+00A0 itself, and must not retype a string to get it.
 *
 * Only plain spaces become no-break spaces: nothing is added, removed or reworded, so the text reads, copies and searches the
 * same (`\s` matches U+00A0, which the gate's claim patterns rely on). Every step is idempotent: a second run finds no plain space
 * in the places the first one fixed. Metadata and JSON-LD turn the no-break spaces back into plain ones (`plain`, below).
 */
const NBSP = '\u00A0';

export type TypesetLocale = 'en' | 'ru';

/** " — " becomes NBSP + "— ": the dash stays on the line of the word it follows. Both languages. */
export function bindDashes(text: string): string {
  return text.replace(/ (?=\u2014)/g, NBSP);
}

/**
 * The short words that never end a Russian line, matched whole and case-insensitively. One letter: в к с у о а и я. Two letters:
 * на по за из от до ко со во об (prepositions), но не ни то да (conjunctions, negation), ты мы вы он её ей им (pronouns, which a
 * column of 280px strands as readily as a preposition), and the enclitics бы ли же, which are bound the other way as well (see
 * `bindShortWords`).
 */
const SHORT_WORDS = [
  // one letter
  'в', 'к', 'с', 'у', 'о', 'а', 'и', 'я',
  // prepositions
  'на', 'по', 'за', 'из', 'от', 'до', 'ко', 'со', 'во', 'об',
  // conjunctions, negation, particles
  'но', 'не', 'ни', 'то', 'да', 'же', 'ли', 'бы',
  // pronouns
  'ты', 'мы', 'вы', 'он', 'её', 'ей', 'им',
];
const ENCLITICS = ['бы', 'ли', 'же'];

/** A Russian letter or digit, for the whole-word test (`\b` does not know Cyrillic). */
const WORD = '[\\p{L}\\p{N}]';
const FORWARD = new RegExp(`(?<!${WORD})(${SHORT_WORDS.join('|')}) (?=\\S)`, 'giu');
const BACKWARD = new RegExp(`(?<=${WORD}) (?=(?:${ENCLITICS.join('|')})(?!${WORD}))`, 'giu');

/**
 * Russian short words: NBSP after each of `SHORT_WORDS` (the word travels with the one that follows), and NBSP before the enclitics
 * бы, ли, же (they travel with the one before). Only when another word follows on the same string: a word at the very end keeps
 * its plain space handling.
 */
export function bindShortWords(text: string): string {
  return text.replace(FORWARD, `$1${NBSP}`).replace(BACKWARD, NBSP);
}

/** All the typography of one language, for one string. */
export function typeset(text: string, locale: TypesetLocale): string {
  const dashed = bindDashes(text);
  return locale === 'ru' ? bindShortWords(dashed) : dashed;
}

/** Plain spaces back for machine readers (meta description, JSON-LD): they gain nothing from a no-break space. */
export function plain(text: string): string {
  return text.replace(/\u00A0/g, ' ');
}

/** Apply `typeset` to every string inside `node` (objects and arrays, any depth), in place. */
export function typesetInPlace(node: unknown, locale: TypesetLocale): void {
  if (Array.isArray(node)) {
    node.forEach((value: unknown, index: number) => {
      if (typeof value === 'string') node[index] = typeset(value, locale);
      else typesetInPlace(value, locale);
    });
    return;
  }
  if (node && typeof node === 'object') {
    const record = node as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      const value = record[key];
      if (typeof value === 'string') record[key] = typeset(value, locale);
      else typesetInPlace(value, locale);
    }
  }
}
