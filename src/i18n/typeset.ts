/**
 * Typography of the Russian text.
 *
 * Russian typesetting keeps a dash with the word before it: a line never starts with «— это 4P», it ends with «благополучия»
 * and the dash goes down with the next word. A plain space before the dash gives the browser a legal break right there, so the
 * rule needs a no-break space (U+00A0) in the string. CSS cannot do it: no property controls where a line may break before an
 * em dash.
 *
 * The client's strings are stored verbatim (src/content/copy, which nobody edits), so the no-break space is put in at render
 * time, once, for the whole Russian text: `typeset-copy.ts` runs this over the client's Russian copy, `index.ts` over the shell
 * dictionary. The drafts in a section's own `copy.ts` are the section's to write with ` ` where it matters.
 *
 * Only a space becomes a no-break space, nothing is added or reworded, so the text reads and searches the same (`\s` matches
 * it, and the gate's claim patterns use `\s`). The step is idempotent: a second run finds no plain space before a dash.
 */
const NBSP = ' ';

/** " — " becomes NBSP + "— ": the dash stays on the line of the word it follows. */
export function bindDashes(text: string): string {
  return text.replace(/ (?=—)/g, NBSP);
}

/** Apply `bindDashes` to every string inside `node` (objects and arrays, any depth), in place. */
export function typesetInPlace(node: unknown): void {
  if (Array.isArray(node)) {
    node.forEach((value: unknown, index: number) => {
      if (typeof value === 'string') node[index] = bindDashes(value);
      else typesetInPlace(value);
    });
    return;
  }
  if (node && typeof node === 'object') {
    const record = node as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      const value = record[key];
      if (typeof value === 'string') record[key] = bindDashes(value);
      else typesetInPlace(value);
    }
  }
}
