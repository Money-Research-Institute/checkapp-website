import type { ReactNode, SVGProps } from 'react';

/**
 * Line icons for the cards on /how-it-works, /features and /about: 24px grid, 1.8 stroke, currentColor, decorative. They are
 * drawn here (not an icon library) so the pages ship no icon dependency; ds already owns the arrow, sparkle, check, plus and minus.
 */
function Line({ children, size = 28, ...rest }: Omit<SVGProps<SVGSVGElement>, 'children'> & { children: ReactNode; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & { size?: number };

/** A closed mouth with the tongue out. */
export const TongueIcon = (props: IconProps) => (
  <Line {...props}>
    <path d="M4.5 8.5c1.8 1.5 4.4 2.3 7.5 2.3s5.7-.8 7.5-2.3" />
    <path d="M8.5 10.6v4.9a3.5 3.5 0 0 0 7 0v-4.9" />
    <path d="M12 12.4v3" />
  </Line>
);

/** A round face with two eyes and a smile. */
export const FaceIcon = (props: IconProps) => (
  <Line {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M9 10v1M15 10v1" />
    <path d="M8.8 14.6c.9 1.1 2 1.6 3.2 1.6s2.3-.5 3.2-1.6" />
  </Line>
);

/** An eye with its iris. */
export const IrisIcon = (props: IconProps) => (
  <Line {...props}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3.2" />
    <circle cx="12" cy="12" r="0.9" fill="currentColor" />
  </Line>
);

/** A sun: a new day, every day. */
export const SunIcon = (props: IconProps) => (
  <Line {...props}>
    <circle cx="12" cy="12" r="3.8" />
    <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M18 6l-1.4 1.4M7.4 16.6 6 18" />
  </Line>
);

/** A padlock: asked first, kept private. */
export const LockIcon = (props: IconProps) => (
  <Line {...props}>
    <rect x="5" y="11" width="14" height="9" rx="2.5" />
    <path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3" />
  </Line>
);

/** A finger tapping: it starts when you tap. */
export const TapIcon = (props: IconProps) => (
  <Line {...props}>
    <path d="M9 11.5V6a1.6 1.6 0 0 1 3.2 0v4.3" />
    <path d="M12.2 9.8a1.6 1.6 0 0 1 3.1.3v1.2a1.6 1.6 0 0 1 3.2.2V15a6 6 0 0 1-6 6h-.7a6 6 0 0 1-4.7-2.3L5 15.4a1.6 1.6 0 0 1 2.4-2.1L9 14.9" />
  </Line>
);

/** A bin: delete your data anytime. */
export const TrashIcon = (props: IconProps) => (
  <Line {...props}>
    <path d="M4.5 7h15M9.5 7V4.8h5V7" />
    <path d="M6.5 7l.8 12a1.6 1.6 0 0 0 1.6 1.5h6.2a1.6 1.6 0 0 0 1.6-1.5L17.5 7" />
    <path d="M10 11v5.5M14 11v5.5" />
  </Line>
);

/** A compass: being plain about where it stops. */
export const CompassIcon = (props: IconProps) => (
  <Line {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m14.9 9.1-1.7 4.1-4.1 1.7 1.7-4.1 4.1-1.7Z" />
  </Line>
);
