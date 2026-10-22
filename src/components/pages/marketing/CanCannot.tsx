import type { CSSProperties } from 'react';
import { CheckIcon, GlassCard } from '@/components/ds';
import styles from './CanCannot.module.css';

/** DRAFT. Only what the app does today: a photo you choose to take, a short wellness insight, a nudge for the day. */
const CAN = [
  'Read a photo of your tongue, face or iris when you choose to take one',
  'Share a short wellness insight in plain language',
  'Give you something small to use as a nudge for your day',
] as const;

/** DRAFT, from the client's disclaimer ("not intended to diagnose, treat, cure or prevent any disease. Not for emergencies.") and FAQ. */
const CANNOT = [
  'Diagnose, treat, cure or prevent any disease',
  'Replace a doctor or another qualified clinician',
  'Help in an emergency',
  'Run in the background. It scans only when you take a photo',
] as const;

/**
 * Two glass cards: what DiDi does, and what it does not. The second card is a disclaimer, so it carries `data-disclaimer`
 * (that is what lets it name the things the product must never claim without tripping the claims scan).
 */
export function CanCannot() {
  return (
    <div className={styles.grid}>
      <GlassCard className={styles.card} data-fx="rise">
        <h3 className={styles.title}>DiDi does</h3>
        <ul className={styles.list}>
          {CAN.map((line) => (
            <li key={line}>
              <CheckIcon className={styles.yes} size={20} />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </GlassCard>
      <GlassCard className={styles.card} data-fx="rise" data-disclaimer style={{ '--i': 1 } as CSSProperties}>
        <h3 className={styles.title}>DiDi does not</h3>
        <ul className={styles.list}>
          {CANNOT.map((line) => (
            <li key={line}>
              <span className={styles.no} aria-hidden="true" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </GlassCard>
    </div>
  );
}
