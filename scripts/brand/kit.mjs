/**
 * The single list of what the brand kit contains. build-brand-kit.mjs writes it, verify-brand-kit.mjs
 * checks it, and docs/brand.md describes it. LogoMark.tsx mirrors the size ladders (keep them in step).
 */
export const FORMATS = ['avif', 'webp', 'png'];

/** Rounded tile, no rim, no shadow. LogoMark draws the shadow in CSS (drop-shadow) from 32 px up. */
export const BARE_SIZES = [40, 64, 96, 128, 256, 512];
/** Rounded tile with the shadow baked in (padded transparent canvas). For places that cannot run CSS. */
export const LIFTED_SIZES = [40, 64, 96, 128, 256, 512];
/** Rounded tile with a 1 px deep-green hairline (a shadow is just blur below 32 px). 1x and 2x of 16-28 px marks. */
export const HAIRLINE_SIZES = [16, 24, 28, 32, 48, 56, 64];

/** The shadow pad makeTile adds on each side, as a fraction of the tile side. Mirrors make-tile.mjs. */
export const SHADOW_PAD = 0.12;
export const liftedCanvas = (n) => n + 2 * Math.round(n * SHADOW_PAD);

/**
 * Full-bleed squares: the OS masks and frames them, so no rim and no shadow.
 * The master is tight (leaf tip 4.7 % from the top), so the character is scaled down a little, bottom-anchored,
 * and the cream background is extended (edge copy) to make room:
 *   FULL_BLEED_SCALE  0.93  -> sprout top at 11.4 %, inside the central 80 % square
 *   MASKABLE_SCALE    0.875 -> sprout, hood and chin inside the central circle of radius 40 % (Android maskable safe zone)
 */
export const FULL_BLEED_SCALE = 0.93;
export const MASKABLE_SCALE = 0.875;
/** Minimal enclosing circle of sprout tips, hood sides and chin in master pixels: centre (517, 436), radius 468. */
export const MASKABLE_CENTER = [517, 436];

export const FULL_BLEED = [
  { file: 'public/brand/icons/icon-180.png', size: 180, scale: FULL_BLEED_SCALE },
  { file: 'public/brand/icons/icon-192.png', size: 192, scale: FULL_BLEED_SCALE },
  { file: 'public/brand/icons/icon-512.png', size: 512, scale: FULL_BLEED_SCALE },
  { file: 'public/brand/icons/maskable-512.png', size: 512, scale: MASKABLE_SCALE, maskable: true },
  { file: 'src/app/apple-icon.png', size: 180, scale: FULL_BLEED_SCALE },
  { file: 'src/app/icon.png', size: 512, scale: FULL_BLEED_SCALE },
];

/**
 * Favicon entries: exact canvas sizes. makeTile pads its canvas when it draws a shadow, so for 32 and 48 the tile
 * itself is a little smaller (tile 26 + 2 x 3 = 32, tile 38 + 2 x 5 = 48). 16 px has no shadow, so the tile is the canvas.
 */
export const FAVICON = [
  { canvas: 16, tile: 16, shadow: false },
  { canvas: 32, tile: 26, shadow: true },
  { canvas: 48, tile: 38, shadow: true },
];
