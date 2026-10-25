import type { CSSProperties } from 'react';
import { Picture } from '@/components/ds/Picture';
import type { HeroStrings } from './copy';
import { KeepHyphenated } from './keep-hyphenated';
import {
  CheckGlyph,
  DropGlyph,
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
 * insight that comes back (docs/landing-copy.md). The design's smartwatch, Heart Rate, Sleep and Body Composition cards were
 * wearable sync and body readings the app does not have, and its Upgrade card sold a plan it cannot sell: each has a
 * stand-in in the same glass, in the same place, with the same accent colours (scan, two readings, a gauge, the three scans, DiDi's
 * prompt), so the composition is the design's and every word on it is true.
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
 * One reading on a gauge, where the Body Composition gauge stood: how moist the tongue looks in the photo, the way the app's own
 * scan screen words it ("Slightly dry"), and the one small next step. The bar runs from dry to moist through plain colours, no red, and
 * its three zones are descriptions, not grades: no number, no "Normal", no verdict on the body (docs/landing-copy.md).
 */
export function GaugeCard({ t }: { t: HeroStrings['gauge'] }) {
  return (
    <div className={`${s.glass} fx-edge ${s.note}`} aria-hidden="true">
      <div className={s.noteHead}>
        <span className={s.noteTitle}>{t.title}</span>
        <span className={s.noteSub}>{t.sub}</span>
      </div>
      <div className={s.gauge}>
        <span className={s.gaugeTrack}>
          <span className={s.gaugeTip}>{t.tip}</span>
          <span className={s.gaugeBar}>
            <span className={s.gaugeKnob} />
          </span>
        </span>
        <span className={s.gaugeZones}>
          {t.zones.map((zone) => (
            <span key={zone}>{zone}</span>
          ))}
        </span>
      </div>
      <div className={s.goal}>
        <span>{t.next}</span>
        <span className={s.goalValue}>{t.nextValue}</span>
      </div>
      <Glow right={25} top={24} />
    </div>
  );
}

/**
 * DiDi asking for a photo: the tilted card behind the phone's right edge (desktop only), where the design's Upgrade card stood. Same
 * glass, same tilt and the same character art (DiDi with a camera, Figma 2601:12499); the words invite a photo instead of selling a
 * plan, and the label is the scan, not an upgrade. A card the size of its picture would be a poster, so the picture is a window.
 */
export function MascotCard({ t }: { t: HeroStrings['mascot'] }) {
  return (
    <div className={`${s.glass} fx-edge ${s.mascotCard}`} aria-hidden="true">
      <Picture
        base="/landing/hero/didi-cam"
        widths={[360, 720]}
        sizes="170px"
        width={720}
        height={405}
        alt=""
        className={s.mascotArt}
      />
      <span className={s.mascotText}>
        <KeepHyphenated>{t.text}</KeepHyphenated>
      </span>
      <span className={s.mascotFoot}>
        <span className={s.mascotCta}>{t.cta}</span>
        <span className={s.mascotTime}>{t.time}</span>
      </span>
    </div>
  );
}

/**
 * DiDi's nudge (Figma "Nudge Card w/ avatar", 2822:13948, 300 x 156), where the Premium+ plan card stood: the companion's avatar,
 * its head out of the black disc, and a speech bubble that offers a check-in. It is the app's own nudge (the Home check-in prompt),
 * so it says nothing the app cannot do. The bubble is the design's own outline (a glass fill and a gradient edge, with a tail at the
 * lower left); the avatar is the design's picture, cropped to its 74 x 98 box.
 */
export function NudgeCard({ t }: { t: HeroStrings['nudge'] }) {
  return (
    <div className={s.nudge} aria-hidden="true">
      <span className={s.nudgeAvatar}>
        <Picture
          base="/landing/hero/nudge-avatar"
          widths={[148, 222]}
          sizes="74px"
          width={222}
          height={294}
          alt=""
          className={s.nudgeFace}
        />
      </span>
      <span className={s.nudgeBubble}>
        <svg className={s.nudgeShape} viewBox="0 0 220.8 108.369" preserveAspectRatio="none" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="nudgeEdge" x1="0" y1="-47.6313" x2="95.5367" y2="55.2779" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fff" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <path id="nudgePath" d="M209.8 0C215.875 0.000198415 220.8 4.92516 220.8 11V97C220.8 103.075 215.875 108 209.8 108H19.7998C17.4206 108 15.2188 107.244 13.4199 105.96C12.4197 105.245 10.5469 105.905 10.5469 107.134C10.5469 108.302 9.07393 108.815 8.3491 107.899L1.13892 98.7931C-0.379885 96.875 -0.379904 94.1641 1.13887 92.2459L7.50382 84.2071C8.34313 83.1471 8.7998 81.8346 8.7998 80.4826V11C8.8 4.92504 13.7248 0 19.7998 0H209.8Z" />
            <mask id="nudgeInside" fill="#fff">
              <use href="#nudgePath" />
            </mask>
          </defs>
          <use href="#nudgePath" fill="#fff" fillOpacity="0.06" />
          <use href="#nudgePath" stroke="url(#nudgeEdge)" strokeOpacity="0.4" strokeWidth="2" mask="url(#nudgeInside)" />
        </svg>
        <span className={s.nudgeWave}>{'\u{1F44B}'}</span>
        <span className={s.nudgeText}>
          <span>{t.line1}</span>
          <span>{t.line2}</span>
        </span>
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
