import type { CSSProperties } from 'react';
import { Picture } from '@/components/ds';
import styles from './PhoneShot.module.css';

/**
 * The two phone mock-ups these pages use, exported from the Figma Landing frame (node 2601:12733 home, 2601:12907 scan details)
 * and encoded by scripts/assets/encode.mjs into public/pages/marketing. Transparent corners, so they sit on the black page.
 * The alt text describes the screen without repeating anything a claims scan would object to.
 */
const SHOTS = {
  home: {
    base: '/pages/marketing/phone-home',
    alt: 'The checkapp home screen: DiDi waves hello above a Start Tongue Scan button and a four-day streak card.',
  },
  scan: {
    base: '/pages/marketing/phone-scan',
    alt: 'A checkapp scan result with tongue colour, coating, moisture and surface texture readings, a short summary and a recommended next step.',
  },
} as const;

export type PhoneShotName = keyof typeof SHOTS;

/**
 * A phone on a soft green stage. The stage clips the glow (overflow: clip never breaks the view() timeline on the phone),
 * and the phone drifts a few pixels against the scroll where the browser supports scroll timelines: finished layout elsewhere.
 */
export function PhoneShot({ name, priority = false }: { name: PhoneShotName; priority?: boolean }) {
  const shot = SHOTS[name];
  return (
    <div className={`${styles.stage} fx-dither`}>
      <div
        className={styles.phone}
        data-fx="drift"
        style={{ '--fx-from': '0px, 14px', '--fx-to': '0px, -14px' } as CSSProperties}
      >
        <Picture
          base={shot.base}
          widths={[420, 840]}
          width={840}
          height={1711}
          sizes="min(80vw, 300px)"
          alt={shot.alt}
          priority={priority}
          className={styles.img}
        />
      </div>
    </div>
  );
}
