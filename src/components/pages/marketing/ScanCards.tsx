import type { CSSProperties, ReactNode } from 'react';
import { GlassCard } from '@/components/ds';
import { FaceIcon, IrisIcon, TongueIcon } from './icons';
import styles from './ScanCards.module.css';

type Scan = { title: string; icon: ReactNode; text: string; note: string };

/**
 * The three scans the app does today, as feature cards. This is what replaces the plan and price cards of the old pages
 * (docs/landing-decisions.md D5, narrowed by docs/landing-copy.md): the app sells nothing yet and has no report or history,
 * so the cards show what it really does. Each card says what the person does and what DiDi does with the photo, and nothing
 * about what the photo "reveals". DRAFT wording, from the client's "what it does now" and data sentences.
 */
const SCANS: readonly Scan[] = [
  {
    title: 'Tongue',
    icon: <TongueIcon />,
    text: 'Tap Start Tongue Scan on the home screen. DiDi notes visible signals like colour and coating, then explains them in plain language.',
    note: 'Natural light works best.',
  },
  {
    title: 'Face',
    icon: <FaceIcon />,
    text: 'Take a quick photo of your face. DiDi reads it and shares a short wellness insight in plain words.',
    note: 'Face photos are biometric data, so checkapp asks your permission first.',
  },
  {
    title: 'Iris',
    icon: <IrisIcon />,
    text: 'Take a close-up photo of your eye. DiDi reads it and shares a short wellness insight in plain words.',
    note: 'Iris photos are biometric data, so checkapp asks your permission first.',
  },
];

/** Three glass cards: icon, title, what happens, and one line of good to know. Row layout on tablets, columns from 880px. */
export function ScanCards() {
  return (
    <ul className={styles.grid}>
      {SCANS.map((scan, index) => (
        <li key={scan.title} className={styles.item}>
          <GlassCard as="article" glow className={styles.card} data-fx="rise" style={{ '--i': index } as CSSProperties}>
            <div className={styles.inner}>
              <span className={styles.mark}>{scan.icon}</span>
              <div className={styles.body}>
                <h3 className={styles.title}>{scan.title}</h3>
                <p className={styles.text}>{scan.text}</p>
                <p className={styles.note}>{scan.note}</p>
              </div>
            </div>
          </GlassCard>
        </li>
      ))}
    </ul>
  );
}
