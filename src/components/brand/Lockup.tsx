import { LogoMark } from './LogoMark';

/**
 * Logo lockup: the DiDi tile followed by "CheckApp" in Bricolage Grotesque Bold
 * (the `--font-bricolage` variable set up in the root layout). The text carries the name,
 * so the mark is decorative. The text colour is inherited (`currentColor`).
 */
export type LockupProps = {
  /** Tile side in CSS px (UI minimum 28). The wordmark scales with it. Default 32. */
  size?: number;
  priority?: boolean;
  className?: string;
};

export function Lockup({ size = 32, priority = false, className }: LockupProps) {
  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: Math.round(size * 0.3), color: 'inherit' }}
    >
      <LogoMark size={size} decorative priority={priority} />
      <span
        style={{
          fontFamily: 'var(--font-bricolage), system-ui, sans-serif',
          fontWeight: 700,
          fontSize: Math.round(size * 0.62),
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}
      >
        CheckApp
      </span>
    </span>
  );
}
