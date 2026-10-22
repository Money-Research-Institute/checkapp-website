import Link from 'next/link';
import { isValidElement } from 'react';
import type {
  AnchorHTMLAttributes,
  HTMLAttributes,
  ImgHTMLAttributes,
  ReactElement,
  ReactNode,
  TableHTMLAttributes,
} from 'react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { Prose } from '@/components/ds/Prose';
import { headingSlug } from '@/lib/blog';
import styles from './MdxContent.module.css';

/** The plain text of a rendered node, so an `h2` with emphasis or a link still gets the same id as its TOC entry. */
function textOf(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (isValidElement(node)) return textOf((node as ReactElement<{ children?: ReactNode }>).props.children);
  return '';
}

/** The header cells of a table (first row of its `thead`), used to name the scroll region. */
function headerCells(node: ReactNode): string[] {
  const cells: string[] = [];
  const visit = (child: ReactNode) => {
    if (Array.isArray(child)) {
      child.forEach(visit);
      return;
    }
    if (!isValidElement(child)) return;
    const element = child as ReactElement<{ children?: ReactNode }>;
    if (element.type === 'tbody') return;
    if (element.type === 'th') {
      const label = textOf(element.props.children).trim();
      if (label) cells.push(label);
      return;
    }
    visit(element.props.children);
  };
  visit(node);
  return cells;
}

const isInternal = (href: string) => href.startsWith('/') && !href.startsWith('//');

const components = {
  h2: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
    <h2 id={headingSlug(textOf(children)) || undefined} {...props}>
      {children}
    </h2>
  ),

  // Internal links navigate client-side (no prefetch: a long article links to many pages). Everything else is a
  // plain anchor, exactly as written in the post.
  a: ({ href = '', children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) =>
    isInternal(href) ? (
      <Link href={href} prefetch={false} {...props}>
        {children}
      </Link>
    ) : (
      <a href={href} {...props}>
        {children}
      </a>
    ),

  // A wide table scrolls inside its own labelled, keyboard-focusable region; the page never scrolls sideways.
  table: (props: TableHTMLAttributes<HTMLTableElement>) => {
    const cells = headerCells(props.children);
    const label = cells.length > 0 ? `Table: ${cells.slice(0, 3).join(', ')}` : 'Table';
    return (
      <div className={styles.tableWrap} role="region" aria-label={label} tabIndex={0}>
        <table {...props} />
      </div>
    );
  },

  pre: (props: HTMLAttributes<HTMLPreElement>) => <pre tabIndex={0} {...props} />,

  // Explicit dimensions plus a fixed aspect ratio: the box is reserved before the image arrives, so nothing shifts.
  // The photos are Unsplash links written into the posts at w=800.
  img: ({ src, alt }: ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={styles.image}
      src={typeof src === 'string' ? src : undefined}
      alt={alt ?? ''}
      width={800}
      height={533}
      loading="lazy"
      decoding="async"
    />
  ),
};

/** An article body: MDX rendered at build time into the dark Prose styles (68ch measure, 17-18px / 1.7). */
export function MdxContent({ source }: { source: string }) {
  return (
    <Prose className={styles.article}>
      <MDXRemote
        source={source}
        components={components}
        options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
      />
    </Prose>
  );
}
