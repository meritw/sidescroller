// ─── Scale ────────────────────────────────────────────────────────────────────
export const TILE_SIZE  = 16;
export const TILE_SCALE = 3;
export const TILE_PX    = TILE_SIZE * TILE_SCALE; // 48 — screen pixels per tile

// ─── World dimensions ─────────────────────────────────────────────────────────
export const WORLD_COLS  = 167;
export const WORLD_WIDTH = WORLD_COLS * TILE_PX;  // 8016 px
export const GROUND_TILE_Y = 9;
export const GROUND_Y      = GROUND_TILE_Y * TILE_PX; // 432 px

// Maximum vertical extent of the building backdrop, in tiles above ground.
export const BACKDROP_HEIGHT_MAX = 12;
export const BACKDROP_HEIGHT_MIN = 6;

// ─── tiles.png  (6 cols × 9 rows = 54 frames) ─────────────────────────────────
const t = (row: number, col: number) => row * 6 + col;

export const SURFACE = {
  LEFT:  t(0, 0),
  MID_A: t(0, 1),
  MID_B: t(0, 2),
  RIGHT: t(0, 3),
} as const;

export const FILL = {
  A: t(8, 0), // 48
  B: t(8, 1), // 49
  C: t(8, 4), // 52
  D: t(8, 5), // 53
} as const;

export const GROUND_LEFT  = SURFACE.LEFT;
export const GROUND_MID   = SURFACE.MID_A;
export const GROUND_RIGHT = SURFACE.RIGHT;
export const GROUND_FILL  = FILL.A;

export const PLAT_LEFT  = SURFACE.LEFT;
export const PLAT_MID   = SURFACE.MID_A;
export const PLAT_RIGHT = SURFACE.RIGHT;
export const PLAT_SOLO  = SURFACE.MID_A;
export const PLAT_FILL  = FILL.B;

// ─── buildings.png  (25 cols × 15 rows = 375 frames) ─────────────────────────
const b = (row: number, col: number) => row * 25 + col;

/** Brick wall tiles — vary at random for organic look. */
export const BRICK_FRAMES = [
  b(1, 0), b(1, 1), b(1, 2), b(1, 3), b(1, 4),
  b(2, 0), b(2, 1), b(2, 2), b(2, 3), b(2, 4),
  b(3, 0), b(3, 1), b(3, 2), b(3, 3), b(3, 4),
];

/** Dark "alleyway" tiles between buildings. */
export const ALLEY_FRAMES = [
  b(1, 6), b(1, 7), b(2, 6), b(2, 7), b(3, 6), b(3, 7),
  b(4, 6), b(4, 7),
];

/** A 2×2 wooden door embedded in a wall.
 * Top: 9, 10  /  Bottom: 34, 35
 */
export const WOOD_DOOR = {
  TL: b(0, 9),  TR: b(0, 10),
  BL: b(1, 9),  BR: b(1, 10),
} as const;

/** A grand 2×3 central wooden doorway, brown panels with arch top.
 * 297, 298 (top) / 322, 323 (bottom) — using 272-273 + 297-298 + 322-323.
 */
export const GRAND_DOOR = {
  TL: b(10, 22), TR: b(10, 23),
  ML: b(11, 22), MR: b(11, 23),
  BL: b(12, 22), BR: b(12, 23),
} as const;

/** A 2×2 window with louvered shutter — frames 86-87 / 111-112. */
export const SHUTTER_WINDOW = {
  TL: b(3, 11), TR: b(3, 12),
  BL: b(4, 11), BR: b(4, 12),
} as const;

/** Vertical pink neon sign — 1 wide × 4 tall (109/134/159/184). */
export const PINK_NEON = [b(4, 9), b(5, 9), b(6, 9), b(7, 9)];

/** Red ribbed-shutter storefront — 3 wide × 6 tall.
 * Top row 191-193, then 216-218, 241-243, 266-268, 291-293, 316-318.
 */
export const SHUTTER_STORE = {
  rows: [
    [b(7, 16),  b(7, 17),  b(7, 18)],
    [b(8, 16),  b(8, 17),  b(8, 18)],
    [b(9, 16),  b(9, 17),  b(9, 18)],
    [b(10, 16), b(10, 17), b(10, 18)],
    [b(11, 16), b(11, 17), b(11, 18)],
    [b(12, 16), b(12, 17), b(12, 18)],
  ],
} as const;

/** Wooden scaffolding lattice — 5 wide × 3 tall (183-187 / 208-212 / 233-237). */
export const SCAFFOLD = {
  rows: [
    [b(7, 8),  b(7, 9),  b(7, 10), b(7, 11), b(7, 12)],
    [b(8, 8),  b(8, 9),  b(8, 10), b(8, 11), b(8, 12)],
    [b(9, 8),  b(9, 9),  b(9, 10), b(9, 11), b(9, 12)],
  ],
} as const;

/** Big red curved-corner neon sign — 4 wide × 3 tall.
 *  Frames 113-116 / 138-141 / 163-166.
 */
export const RED_NEON = {
  rows: [
    [b(4, 13), b(4, 14), b(4, 15), b(4, 16)],
    [b(5, 13), b(5, 14), b(5, 15), b(5, 16)],
    [b(6, 13), b(6, 14), b(6, 15), b(6, 16)],
  ],
} as const;

/** Horizontal dark roof / awning trim (3 wide). */
export const ROOF_TRIM = {
  L: b(0, 15), M: b(0, 16), R: b(0, 17),
} as const;

/** Curved orange awning over a doorway — 4 wide × 2 tall.
 *  Top: 191-194, bottom: 216-219.
 */
export const AWNING_ORANGE = {
  rows: [
    [b(7, 16), b(7, 17), b(7, 18), b(7, 19)],
    [b(8, 16), b(8, 17), b(8, 18), b(8, 19)],
  ],
} as const;

// ─── props.png  (8 cols × 14 rows = 112 frames) ──────────────────────────────
const p = (row: number, col: number) => row * 8 + col;

/** ANNO sign — 3 tiles wide in row 11. */
export const ANNO_SIGN = [p(11, 1), p(11, 2), p(11, 3)];

/** Yellow/red striped construction barricade — 3 wide × 2 tall. */
export const BARRICADE = {
  rows: [
    [p(11, 5), p(11, 6), p(11, 7)],
    [p(12, 5), p(12, 6), p(12, 7)],
  ],
} as const;

/** Light post — 1 wide × 4 tall (head … pole … pole … base). */
export const LIGHT_POST = [p(9, 0), p(10, 0), p(11, 0), p(12, 0), p(13, 0)];

/** Wooden lantern bar (horizontal yellow lamp): 6 tiles wide row 9-10. */
export const LAMP_BAR = {
  top: [p(9, 1), p(9, 2), p(9, 3), p(9, 4), p(9, 5)],
  bot: [p(10, 1), p(10, 2), p(10, 3), p(10, 4), p(10, 5)],
} as const;

/** Black trash bags — 2 tile cluster. */
export const TRASH = {
  L: p(0, 3), R: p(0, 4),
  L2: p(1, 3), R2: p(1, 4),
} as const;

/** Blue mailbox / dispenser — 2 wide × 3 tall. */
export const MAILBOX = {
  rows: [
    [p(2, 0), p(2, 1)],
    [p(3, 0), p(3, 1)],
    [p(4, 0), p(4, 1)],
  ],
} as const;

/** Traffic-light vertical column — 1 wide × 4 tall (4 colors). Pick one column. */
export const TRAFFIC_LIGHTS = [
  [p(12, 1), p(13, 1)],
  [p(12, 2), p(13, 2)],
  [p(12, 3), p(13, 3)],
  [p(12, 4), p(13, 4)],
];

/** Stair with railing — 2 wide × 3 tall. */
export const STAIRS = {
  rows: [
    [p(6, 0), p(6, 1)],
    [p(7, 0), p(7, 1)],
    [p(8, 0), p(8, 1)],
  ],
} as const;

/** Big blue billboard / TV — 4 wide × 3 tall (skipping the empty base row). */
export const BILLBOARD = {
  rows: [
    [p(2, 3), p(2, 4), p(2, 5), p(2, 6)],
    [p(3, 3), p(3, 4), p(3, 5), p(3, 6)],
    [p(4, 3), p(4, 4), p(4, 5), p(4, 6)],
  ],
} as const;

/** Pink window panels — 2 wide × 1 tall (frames 51-52). */
export const PINK_PANELS = [p(6, 3), p(6, 4)];

// ─── Tile frame union ─────────────────────────────────────────────────────────
export type TileFrame = number;
export type SheetKey = "tiles" | "buildings" | "props";
