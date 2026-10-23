import type { CSSProperties } from 'react';
import { Picture } from '@/components/ds/Picture';
import type { HeroStrings } from './copy';
import { KeepHyphenated } from './keep-hyphenated';
import {
  CheckGlyph,
  DropGlyph,
  FaceGlyph,
  IrisGlyph,
  LayersGlyph,
  StatusDot,
  TickAhead,
  TickDone,
  TickToday,
  TongueGlyph,
} from './icons';
import s from './hero.module.css';

/**
 * The glass UI cards floating around the hero phone. They are illustration: every card is aria-hidden on its own
 * (never on a wrapper that holds the phone image), carries no controls and no claims. Numbers are mock-ups. Their words come
 * from ./copy.ts in the page's language (the region's `locale`), so /ru/ has no English on them.
 * Every size is calc(N * var(--u)) in hero.module.css, so the whole composition scales with the 1440 grid.
 *
 * The cards show only what the app does today: a photo scan of the tongue, face or iris on request, and the short wellness
 * insight that comes back (docs/landing-copy.md). The design's smartwatch, Heart Rate, Sleep and Body Composition cards are gone:
 * they advertised wearable sync and body readings the app does not have. The same Figma glass vocabulary carries the replacements.
 *
 * The element marked data-once plays a one-shot when it first comes into view (the engine's [data-once] machine): the check
 * of the finished scan pops in once. The resting state is the finished frame, so no-JS, T0 and reduced motion all show the
 * design as drawn.
 */

type GlowVars = CSSProperties & { '--gx': number; '--gy': number };
const glowAt = (fromRight: number, fromBottom: number): GlowVars => ({ '--gx': fromRight, '--gy': fromBottom });

/** Faint green corner glow of a card (Figma Ellipse 2778-2781). A radial gradient, not a blurred SVG. */
function Glow({ right, bottom, top }: { right: number; bottom?: number; top?: number }) {
  const style = (top === undefined ? glowAt(right, bottom ?? 0) : { '--gx': right, '--gt': top }) as CSSProperties;
  return <span className={top === undefined ? s.glow : `${s.glow} ${s.glowTop}`} style={style} aria-hidden="true" />;
}

/**
 * The header of a finished scan, where the smartwatch card stood in the design: the scan, that DiDi's insight is back, and when.
 * The thumb is the scan's own glyph, the same mark the Photo scans card uses.
 */
export function ResultCard({ t }: { t: HeroStrings['result'] }) {
  return (
    <div className={`${s.glass} fx-edge ${s.result}`} aria-hidden="true" data-once>
      <span className={s.resultThumb}>
        <TongueGlyph className={s.resultGlyph} />
      </span>
      <span className={s.resultText}>
        <span className={s.status}>
          <StatusDot className={s.dot} />
          <span className={s.statusLabel}>{t.title}</span>
        </span>
        <span className={s.stampRow}>
          <span className={s.stampLead}>
            <CheckGlyph className={s.check} />
            <span>{t.status}</span>
          </span>
          <span className={s.stampTime}>{t.time}</span>
        </span>
      </span>
      <Glow right={49} bottom={63.5} />
    </div>
  );
}

/** The two readings of a tongue photo, in the tile pair where Heart Rate and Sleep stood: color and coating. */
export function ReadingTiles({ t }: { t: HeroStrings['readings'] }) {
  return (
    <div className={s.vitals}>
      <div className={`${s.glass} fx-edge ${s.tile}`} aria-hidden="true">
        <span className={s.iconCircle} style={{ background: '#ffebee' }}>
          <DropGlyph className={s.tileGlyph} />
        </span>
        <span className={s.tileText}>
          <span className={s.tileLabel}>{t.color}</span>
          <span className={s.tileValue}>{t.colorValue}</span>
        </span>
        <Glow right={24.9} bottom={41.2} />
      </div>
      <div className={`${s.glass} fx-edge ${s.tile}`} aria-hidden="true">
        <span className={s.iconCircle} style={{ background: '#e3f2fd' }}>
          <LayersGlyph className={s.tileGlyph} />
        </span>
        <span className={s.tileText}>
          <span className={s.tileLabel}>{t.coating}</span>
          <span className={s.tileValue}>{t.coatingValue}</span>
        </span>
        <Glow right={24.5} bottom={41.2} />
      </div>
    </div>
  );
}

/**
 * DiDi's short answer, where the Body Composition gauge stood: a line of plain words and the one small next step. It carries no
 * reading about the body and no verdict, only what the app sends back after a photo (docs/landing-copy.md).
 */
export function NoteCard({ t }: { t: HeroStrings['note'] }) {
  return (
    <div className={`${s.glass} fx-edge ${s.note}`} aria-hidden="true">
      <div className={s.noteHead}>
        <span className={s.noteTitle}>{t.title}</span>
        <span className={s.noteSub}>
          <KeepHyphenated>{t.sub}</KeepHyphenated>
        </span>
      </div>
      <span className={s.noteText}>
        <KeepHyphenated>{t.text}</KeepHyphenated>
      </span>
      <div className={s.goal}>
        <span>{t.next}</span>
        <span className={s.goalValue}>{t.nextValue}</span>
      </div>
      <Glow right={25} top={24} />
    </div>
  );
}

/**
 * Stands where the Premium+ plan card stood (docs/landing-copy.md: the plan spots show the three scans, never a plan, a
 * price, a trial or a report). The same green foil as the design, a dark scrim to keep the white text above AA over the brightest
 * part of the sheen, and the three photo scans the app has today: tongue, face, iris. No button, nothing to tap.
 */
export function ScansCard({ t }: { t: HeroStrings['scans'] }) {
  const items = [
    { Glyph: TongueGlyph, label: t.tongue },
    { Glyph: FaceGlyph, label: t.face },
    { Glyph: IrisGlyph, label: t.iris },
  ];
  return (
    <div className={s.scanCard} aria-hidden="true">
      <Picture
        base="/landing/hero/foil"
        widths={[358, 716]}
        sizes="358px"
        width={716}
        height={358}
        alt=""
        className={s.foil}
      />
      <span className={s.scrim} />
      <span className={s.scanHead}>
        <span className={s.scanTitle}>{t.title}</span>
        <span className={s.scanSub}>{t.sub}</span>
      </span>
      <span className={s.scanRow}>
        {items.map(({ Glyph, label }) => (
          <span key={label} className={s.scanItem}>
            <span className={s.scanIcon}>
              <Glyph className={s.scanGlyph} />
            </span>
            <span className={s.scanLabel}>{label}</span>
          </span>
        ))}
      </span>
    </div>
  );
}

/**
 * The tilted Streak card, half hidden behind the phone (desktop only). DOM, not a picture, so its words are in the page's
 * language: only the tile and the first letters of the title show past the phone's edge, but they should still read as ours.
 * Figma node 2601:12539: a 358 x 140 glass card, a 84-wide tile (flame, "4 days", "Streak") and a column with the title,
 * the sub-line and the week row. The rotation lives on the card; the plane around it is the card's bounding box.
 */
export function StreakCard({ t }: { t: HeroStrings['streak'] }) {
  return (
    <div className={`${s.glass} fx-edge ${s.streakCard}`} aria-hidden="true">
      <div className={s.streakRow}>
        <div className={s.streakTile}>
          <Picture
            base="/landing/hero/flame"
            widths={[78, 117]}
            sizes="39px"
            width={117}
            height={158}
            alt=""
            className={s.flame}
          />
          <span className={s.streakDays}>{t.days}</span>
          <span className={s.streakLabel}>{t.label}</span>
        </div>
        <div className={s.streakMain}>
          <span className={s.streakText}>
            <span className={s.streakTitle}>{t.title}</span>
            <span className={s.streakSub}>{t.sub}</span>
          </span>
          <span className={s.streakWeek}>
            {t.week.map((day, i) => {
              const Tick = i < 4 ? TickDone : i === 4 ? TickToday : TickAhead;
              return (
                <span key={day} className={i === 4 ? `${s.streakDay} ${s.streakToday}` : s.streakDay}>
                  <Tick className={s.streakTick} />
                  <span>{day}</span>
                </span>
              );
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
