/** Base path for GitHub Pages project sites (e.g. /checkapp-website). Empty on Vercel/local. */
export const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/$/, '');

export function withBasePath(path: string): string {
  if (!path.startsWith('/')) return path;
  if (!basePath) return path;
  if (path.startsWith(basePath)) return path;
  return `${basePath}${path}`;
}

/**
 * The Russian site (`/ru/`) and the pages it links to.
 *
 * Only the landing page and the download page exist in Russian; every other page (features, blog, privacy, ...) is English.
 * A visitor on the Russian site must never land on an English page without being told, and must never land on one at all when
 * it is the page they came to convert on. So:
 *  - a link to a page that has a Russian twin goes to the twin (`RUSSIAN_TWINS`);
 *  - a link to a page whose subject the Russian landing page also covers goes to that section (`RUSSIAN_ANCHORS`);
 *  - any other internal link keeps its target and is marked as English (`ShellLink.english`: a visible "EN" tag and a spoken cue).
 */
const RUSSIAN_TWINS: Readonly<Record<string, string>> = { '/download/': '/ru/download/' };
const RUSSIAN_ANCHORS: Readonly<Record<string, string>> = { '/how-it-works/': '/ru/#how-it-works' };

export type ShellLink = {
  href: string;
  /** The target is a page that exists in English only, reached from a Russian page. */
  english: boolean;
};

/** Is this pathname (as `usePathname()` returns it, without the base path) on the Russian site? */
export const isRussianPath = (pathname: string | null | undefined): boolean =>
  pathname === '/ru' || (pathname?.startsWith('/ru/') ?? false);

/** The target of an internal link in the shell (header, footer) of a page in `locale`. */
export function shellLink(href: string, locale: 'en' | 'ru'): ShellLink {
  if (locale !== 'ru') return { href, english: false };
  const russian = RUSSIAN_TWINS[href] ?? RUSSIAN_ANCHORS[href];
  return russian ? { href: russian, english: false } : { href, english: true };
}

/**
 * Where a call-to-action that points at a page with a Russian twin should go, judged by the page it sits on. The landing
 * sections link to `APP_DOWNLOAD_URL` without knowing their language; this is what sends the Russian page's buttons to
 * `/ru/download/`. Anchors are not rewritten: they stay on the page they are on.
 */
export function localizeHref(href: string, pathname: string | null | undefined): string {
  return isRussianPath(pathname) ? (RUSSIAN_TWINS[href] ?? href) : href;
}
