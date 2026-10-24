/**
 * Date formatting for the blog. Post dates are calendar dates ("2026-09-30"), which JS parses as UTC midnight, so
 * every format is pinned to UTC: the label is the same on the build machine, on the server and in the browser,
 * whatever their time zone.
 */
type Style = 'short' | 'long' | 'month';

const OPTIONS: Record<Style, Intl.DateTimeFormatOptions> = {
  short: { month: 'short', day: 'numeric', year: 'numeric' },
  long: { month: 'long', day: 'numeric', year: 'numeric' },
  month: { month: 'long', year: 'numeric' },
};

export function formatDate(iso: string, style: Style = 'short'): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...OPTIONS[style] }).format(date);
}
