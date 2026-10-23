import type { SVGProps } from 'react';

/**
 * The small glyphs inside the hero's mock UI cards. The Streak ticks and the status dot are copied 1:1 from the Figma exports; the
 * rest (check, drop, layers, and the three scan marks) are drawn for the cards that replaced the wearable ones (docs/landing-copy.md).
 * Sizing comes from the card's CSS, so they scale with --u. All decorative.
 */
type P = Omit<SVGProps<SVGSVGElement>, 'children' | 'viewBox'>;

const common = { fill: 'none', 'aria-hidden': true, focusable: false } as const;

/** Green status dot (14.75 box, 7.4 dot). */
export function StatusDot(props: P) {
  return (
    <svg viewBox="0 0 14.7486 14.7486" {...common} {...props}>
      <circle cx="7.37426" cy="7.3743" r="3.68715" fill="#9FE870" />
    </svg>
  );
}

/** A tick for a finished scan (14.75 box, white). Stroke, so it scales with the card like the other glyphs. */
export function CheckGlyph(props: P) {
  return (
    <svg viewBox="0 0 14.7486 14.7486" {...common} {...props}>
      <path
        d="M3.1 7.55 6.05 10.45 11.65 4.5"
        stroke="#fff"
        strokeWidth="1.55"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A drop: the color reading. Two tones like the design's vuesax "bulk" glyphs (22.12 box). */
export function DropGlyph(props: P) {
  return (
    <svg viewBox="0 0 22.1229 22.1229" {...common} {...props}>
      <path
        opacity="0.4"
        d="M11.06 2.6c-3.05 3.7-6.6 7.1-6.6 11.2a6.6 6.6 0 0 0 13.2 0c0-4.1-3.55-7.5-6.6-11.2Z"
        fill="#D84343"
      />
      <path d="M11.06 20.4a6.6 6.6 0 0 1-6.6-6.6c0-1.4.45-2.7 1.15-3.95 1.4.55 2.3 1.6 2.8 2.85.5 1.2.45 2.5 1.15 3.4.4.5 1.05.85 1.5 1.1.05.4-.05.8-.1 1.2Z" fill="#D84343" />
    </svg>
  );
}

/** Two stacked layers: the coating reading (22.12 box). */
export function LayersGlyph(props: P) {
  return (
    <svg viewBox="0 0 22.1229 22.1229" {...common} {...props}>
      <path d="M11.06 3.3 19.4 7.8 11.06 12.3 2.72 7.8 11.06 3.3Z" fill="#3F9CED" />
      <path
        opacity="0.55"
        d="M3.3 11.6 11.06 15.8 18.82 11.6"
        stroke="#3F9CED"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        opacity="0.3"
        d="M3.3 15 11.06 19.2 18.82 15"
        stroke="#3F9CED"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * The three scan marks on the card that replaces the paid-plan card (docs/landing-copy.md: tongue, face and iris are the whole
 * list of what the app does today). 24 box, 1.7 stroke, drawn for this card; they take their colour from currentColor.
 */
const stroke = { stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** A smile line and a tongue hanging from it. */
export function TongueGlyph(props: P) {
  return (
    <svg viewBox="0 0 24 24" {...common} {...props}>
      <path d="M3.6 8.6c2.6 2.4 5.2 3.5 8.4 3.5s5.8-1.1 8.4-3.5" {...stroke} />
      <path d="M8.2 11.6v4.4a3.8 3.8 0 0 0 7.6 0v-4.4" {...stroke} />
      <path d="M12 12.4v4.2" {...stroke} opacity=".6" />
    </svg>
  );
}

/** A face: outline, two eyes, a small smile. */
export function FaceGlyph(props: P) {
  return (
    <svg viewBox="0 0 24 24" {...common} {...props}>
      <path d="M12 3.4c-3.9 0-6.6 3-6.6 7.1 0 5.3 2.9 10.1 6.6 10.1s6.6-4.8 6.6-10.1c0-4.1-2.7-7.1-6.6-7.1Z" {...stroke} />
      <circle cx="9.2" cy="10.6" r="1" fill="currentColor" />
      <circle cx="14.8" cy="10.6" r="1" fill="currentColor" />
      <path d="M9.4 14.8c.7.8 1.5 1.2 2.6 1.2s1.9-.4 2.6-1.2" {...stroke} />
    </svg>
  );
}

/** An eye: lid line, iris ring, pupil. */
export function IrisGlyph(props: P) {
  return (
    <svg viewBox="0 0 24 24" {...common} {...props}>
      <path d="M2.6 12S6 5.8 12 5.8 21.4 12 21.4 12 18 18.2 12 18.2 2.6 12 2.6 12Z" {...stroke} />
      <circle cx="12" cy="12" r="3.4" {...stroke} />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}

/**
 * The week row of the Streak card: a done day, today and a day to come. Geometry is copied 1:1 from the Figma exports of
 * vuesax/bold/tick-circle (nodes 2601:12552, 2601:12565, 2601:12572); the fills are the design's own.
 */
export function TickDone(props: P) {
  return (
    <svg viewBox="0 0 24 24" {...common} {...props}>
      <path
        d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM16.78 9.7L11.11 15.37C10.97 15.51 10.78 15.59 10.58 15.59C10.38 15.59 10.19 15.51 10.05 15.37L7.22 12.54C6.93 12.25 6.93 11.77 7.22 11.48C7.51 11.19 7.99 11.19 8.28 11.48L10.58 13.78L15.72 8.64C16.01 8.35 16.49 8.35 16.78 8.64C17.07 8.93 17.07 9.4 16.78 9.7Z"
        fill="#FF8C00"
      />
    </svg>
  );
}

export function TickToday(props: P) {
  return (
    <svg viewBox="0 0 24 24" {...common} {...props}>
      <path
        d="M21.5 12C21.5 17.2467 17.2467 21.5 12 21.5C6.75329 21.5 2.5 17.2467 2.5 12C2.5 6.75329 6.75329 2.5 12 2.5C17.2467 2.5 21.5 6.75329 21.5 12Z"
        fill="#E5EADB"
        stroke="#FF8C00"
      />
    </svg>
  );
}

export function TickAhead(props: P) {
  return (
    <svg viewBox="0 0 24 24" {...common} {...props}>
      <circle cx="12" cy="12" r="10" fill="#E5EADB" />
    </svg>
  );
}
