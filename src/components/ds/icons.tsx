import type { SVGProps } from 'react';

/**
 * ds icons: inline SVG, decorative by default (aria-hidden), colour from currentColor.
 * Use these instead of an icon library on the landing and inner pages.
 */
type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & { size?: number };

function base({ size, ...rest }: IconProps, w: number, h: number): SVGProps<SVGSVGElement> {
  return {
    width: size ?? w,
    height: size ? Math.round((size * h) / w) : h,
    viewBox: `0 0 ${w} ${h}`,
    fill: 'none',
    'aria-hidden': true,
    focusable: false,
    ...rest,
  };
}

/** 20px arrow used on every CTA pill. */
export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...base(props, 20, 20)}>
      <path d="M4 10h11m0 0-4.5-4.5M15 10l-4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The four-point sparkle in the eyebrow pill (20 x 17). */
export function SparkleIcon(props: IconProps) {
  return (
    <svg {...base(props, 20, 17)}>
      <path
        d="M8 1.2c.5 3.9 1.9 5.4 5.8 5.8-3.9.5-5.3 1.9-5.8 5.8-.5-3.9-1.9-5.3-5.8-5.8C6.1 6.6 7.5 5.1 8 1.2Z"
        fill="currentColor"
      />
      <path
        d="M15.5 9.2c.3 2.1 1 2.9 3.1 3.1-2.1.3-2.8 1-3.1 3.1-.3-2.1-1-2.8-3.1-3.1 2.1-.2 2.8-1 3.1-3.1Z"
        fill="currentColor"
        opacity=".7"
      />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...base(props, 24, 24)}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function MinusIcon(props: IconProps) {
  return (
    <svg {...base(props, 24, 24)}>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base(props, 24, 24)}>
      <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
