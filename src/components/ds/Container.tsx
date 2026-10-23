import type { ElementType, HTMLAttributes, ReactNode } from 'react';

type Size = 'wide' | 'narrow' | 'prose';

const WIDTH: Record<Size, string> = {
  wide: 'var(--measure)', // 1320: testimonials, final CTA, footer
  narrow: 'var(--measure-narrow)', // 1280: hero, process, FAQ
  prose: 'var(--measure-prose)', // legal text, blog
};

/**
 * Centred column with the fluid page gutter. The content box is `--measure` wide at most; on narrow viewports the
 * gutter shrinks to 16px. Ultrawide: content stays at its measure and is centred.
 */
export function Container({
  size = 'wide',
  as: Tag = 'div',
  className,
  style,
  children,
  ...rest
}: {
  size?: Size;
  as?: ElementType;
  className?: string;
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, 'className' | 'children'>) {
  return (
    <Tag
      className={className}
      style={{
        width: '100%',
        marginInline: 'auto',
        paddingInline: 'var(--gutter)',
        maxWidth: `calc(${WIDTH[size]} + 2 * var(--gutter))`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
