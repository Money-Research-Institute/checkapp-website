/**
 * The FAQ lamp controller. Framework-free on purpose (FaqIsland.tsx only wires it to React), so it is easy to read, to
 * test in a bare page, and tiny: about 0.9 KB gzipped, no rAF loop of its own.
 *
 * The page is complete without it. The rows are native <details name="faq">, row 002 is open in the static HTML, the
 * lamp (a cone and a hot-spot) hangs from the top rule of the open row, and in browsers with :has() it even follows the
 * open row with no script at all. This controller adds what CSS cannot know:
 *
 *   1. it takes over WHICH row is lit (`data-lamp` on the list switches the CSS from ":has(details[open])" to
 *      "[data-lit]"), so closing every row can keep the lamp on its last rule, dimmed to ~35 % (`data-dim`);
 *   2. when the lit row changes, the new row's lamp starts where the old one hung and springs to its own rule: the
 *      controller only writes ONE custom property (`--lamp-dy`) and a flag (`data-travel`); the motion itself is a CSS
 *      animation with a linear() spring easing (see faqs.module.css);
 *   3. the rows below a toggled row shift with a transform FLIP (measure before the click, measure after the change,
 *      play the inverse with Web Animations: compositor-driven, no height animation, no rAF);
 *   4. it reports each opening to analytics (the caller passes the callback) and adds arrow-key / Home / End movement
 *      between the questions (optional in the APG pattern).
 *
 * Reduced motion: state still swaps (lit row, dim, analytics), but there is no FLIP and no travel flag.
 */

/** FLIP duration for the rows below a toggled row. The same value as --dur-base in src/styles/tokens.css. */
const FLIP_MS = 300;
const FLIP_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'; // --ease-out
/** A click measured more than this long ago did not produce the change we are looking at. */
const STALE_MS = 1000;

interface Row {
  el: HTMLElement;
  details: HTMLDetailsElement;
  summary: HTMLElement | null;
  lamp: HTMLElement | null;
}

export function initFaqLamp(list: HTMLElement, onOpen?: (question: string) => void): () => void {
  const rows: Row[] = [];
  list.querySelectorAll<HTMLElement>(':scope > li').forEach((el) => {
    const details = el.querySelector<HTMLDetailsElement>(':scope > details');
    if (!details) return;
    rows.push({
      el,
      details,
      summary: details.querySelector<HTMLElement>(':scope > summary'),
      lamp: el.querySelector<HTMLElement>(':scope > [data-faq-lamp]'),
    });
  });
  if (!rows.length) return () => {};

  const byDetails = new Map<Element, Row>(rows.map((r) => [r.details, r]));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  /**
   * The row whose lamp is lit right now. The server marks the default open row; if the visitor already opened another
   * one before this ran, that one wins. We keep it in step from here on.
   */
  let lit: Row | null = rows.find((r) => r.details.open) ?? rows.find((r) => r.el.hasAttribute('data-lit')) ?? null;
  rows.forEach((r) => r.el.toggleAttribute('data-lit', r === lit));

  /** Viewport tops of every row, measured on the click that is about to toggle one. */
  let first: number[] | null = null;
  let firstAt = 0;

  // From here on the controller decides which row is lit.
  list.setAttribute('data-lamp', '');
  if (!rows.some((r) => r.details.open)) list.setAttribute('data-dim', '');

  const onClick = (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof Element) || !target.closest('summary')) return;
    if (reduced.matches) return;
    first = rows.map((r) => r.el.getBoundingClientRect().top);
    firstAt = performance.now();
  };

  const settle = (opened: Row | undefined) => {
    const before = first && performance.now() - firstAt < STALE_MS ? first : null;
    first = null;

    // The open row wins; with nothing open the lamp stays where it was.
    const next = opened ?? rows.find((r) => r.details.open) ?? null;

    if (next) {
      if (next !== lit) {
        rows.forEach((r) => r.el.removeAttribute('data-travel'));
        if (lit && next.lamp && before && !reduced.matches) {
          // The lamp starts where the old one hung: its old row top, relative to this row's old top. Both rows are FLIPped
          // from their old positions below, so on screen the lamp begins exactly on the rule that just went dark.
          const dy = before[rows.indexOf(lit)] - before[rows.indexOf(next)];
          next.lamp.style.setProperty('--lamp-dy', `${dy}px`);
          next.el.setAttribute('data-travel', '');
        }
        lit?.el.removeAttribute('data-lit');
        next.el.setAttribute('data-lit', '');
        lit = next;
      }
      list.removeAttribute('data-dim');
    } else {
      list.setAttribute('data-dim', '');
    }

    // FLIP: every row that moved starts from where it was and plays to where it is.
    if (before) {
      const after = rows.map((r) => r.el.getBoundingClientRect().top);
      rows.forEach((r, i) => {
        const dy = before[i] - after[i];
        if (Math.abs(dy) < 0.5) return;
        r.el.animate([{ transform: `translateY(${dy}px)` }, { transform: 'translateY(0)' }], {
          duration: FLIP_MS,
          easing: FLIP_EASING,
        });
      });
    }
  };

  const observer = new MutationObserver((records) => {
    let opened: Row | undefined;
    let touched = false;
    for (const record of records) {
      const row = byDetails.get(record.target as Element);
      if (!row) continue;
      touched = true;
      // oldValue === null: the `open` attribute was just added (an opening, not a change of its value).
      if (row.details.open && record.oldValue === null) {
        opened = row;
        const question = row.details.querySelector('h3')?.textContent?.trim();
        if (question) onOpen?.(question);
      }
    }
    if (!touched) return;
    // The row that was open in the static HTML plays no answer animation (it is the default frame); once anything is
    // toggled that guard has done its job, so reopening it later animates like every other row.
    list.querySelectorAll('[data-initial]').forEach((el) => el.removeAttribute('data-initial'));
    settle(opened);
  });
  observer.observe(list, { subtree: true, attributes: true, attributeFilter: ['open'], attributeOldValue: true });

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const summary = target.closest('summary');
    if (!summary) return;
    const at = rows.findIndex((r) => r.summary === summary);
    if (at < 0) return;
    const to =
      event.key === 'ArrowDown' ? (at + 1) % rows.length
      : event.key === 'ArrowUp' ? (at - 1 + rows.length) % rows.length
      : event.key === 'Home' ? 0
      : event.key === 'End' ? rows.length - 1
      : -1;
    if (to < 0) return;
    event.preventDefault();
    rows[to].summary?.focus();
  };

  list.addEventListener('click', onClick, true);
  list.addEventListener('keydown', onKeyDown);

  return () => {
    observer.disconnect();
    list.removeEventListener('click', onClick, true);
    list.removeEventListener('keydown', onKeyDown);
    list.removeAttribute('data-lamp');
    list.removeAttribute('data-dim');
    rows.forEach((r) => r.el.removeAttribute('data-travel'));
  };
}
