// ─── Scale ────────────────────────────────────────────────────────────────────
export const TILE_SIZE  = 16;
export const TILE_SCALE = 3;
export const TILE_PX    = TILE_SIZE * TILE_SCALE; // 48 — screen pixels per tile

// ─── World dimensions ─────────────────────────────────────────────────────────
export const WORLD_COLS  = 167;
export const WORLD_WIDTH = WORLD_COLS * TILE_PX;  // 8016 px
export const GROUND_TILE_Y = 9;
export const GROUND_Y      = GROUND_TILE_Y * TILE_PX; // 432 px

// ─── Frame index helper ───────────────────────────────────────────────────────
// tiles.png: 96×144 px → 6 cols × 9 rows = 54 frames
// Verified against annotated-tiles.png
const f = (row: number, col: number) => row * 6 + col;

// ─── Walkable surface tiles (row 0, frames 0–3) ───────────────────────────────
// These are the primary flat platform / ground tiles.
export const SURFACE = {
  LEFT:      f(0, 0), // 0
  MID_A:     f(0, 1), // 1  — primary repeating tile
  MID_B:     f(0, 2), // 2  — alternate repeating tile
  RIGHT:     f(0, 3), // 3
} as const;

// ─── Slope tiles (row 7, frames 42–45) ───────────────────────────────────────
// 42-43 slope DOWN (descends left→right), 44-45 slope UP (ascends left→right).
// Slopes are visual only — physics collision stays flat (arcade physics).
export const SLOPES = {
  DOWN_A: f(7, 0), // 42
  DOWN_B: f(7, 1), // 43
  UP_A:   f(7, 2), // 44
  UP_B:   f(7, 3), // 45
} as const;

// ─── Fill tiles under slopes (row 8) ─────────────────────────────────────────
// 48-49 pair beneath DOWN slopes, 50-51 beneath UP slopes.
export const SLOPE_FILL = {
  DOWN_A: f(8, 0), // 48
  DOWN_B: f(8, 1), // 49
  UP_A:   f(8, 2), // 50
  UP_B:   f(8, 3), // 51
} as const;

// ─── General fill tiles (below flat surfaces) ─────────────────────────────────
export const FILL = {
  A: f(8, 0), // 48
  B: f(8, 1), // 49
  C: f(8, 4), // 52
  D: f(8, 5), // 53
} as const;

// ─── Arch / decorative wall panels (rows 1–3) ─────────────────────────────────
export const WALL = {
  ARCH_A:  f(1, 0), //  6
  ARCH_B:  f(1, 1), //  7
  CRATE:   f(1, 2), //  8  — X-pattern crate
  PANEL_A: f(1, 3), //  9
  PANEL_B: f(1, 4), // 10
  PANEL_C: f(1, 5), // 11
  OVAL_A:  f(2, 0), // 12
  OVAL_B:  f(2, 1), // 13
  OVAL_C:  f(2, 2), // 14
  OVAL_D:  f(2, 3), // 15
  OVAL_E:  f(2, 4), // 16
  OVAL_F:  f(2, 5), // 17
  OVAL_G:  f(3, 0), // 18
  OVAL_H:  f(3, 1), // 19
  OVAL_I:  f(3, 2), // 20
  OVAL_J:  f(3, 3), // 21
  OVAL_K:  f(3, 4), // 22
  OVAL_L:  f(3, 5), // 23
} as const;

// ─── Pillar group (2 wide × 3 tall, rows 4–6 cols 0–1) ───────────────────────
// Frames: 24 25 / 30 31 / 36 37
// Place with placePillar(tileX, tileY) — tileY is the TOP row.
export const PILLAR = {
  TOP_L:  f(4, 0), // 24
  TOP_R:  f(4, 1), // 25
  MID_L:  f(5, 0), // 30
  MID_R:  f(5, 1), // 31
  BASE_L: f(6, 0), // 36
  BASE_R: f(6, 1), // 37
} as const;

// ─── Building window facade (4 wide × 3 tall, rows 4–6 cols 2–5) ──────────────
// Frames: 26 27 28 29 / 32 33 34 35 / 38 39 40 41
export const FACADE = {
  TL: f(4, 2), TM: f(4, 3), TR_L: f(4, 4), TR_R: f(4, 5),
  ML: f(5, 2), MM: f(5, 3), MR_L: f(5, 4), MR_R: f(5, 5),
  BL: f(6, 2), BM: f(6, 3), BR_L: f(6, 4), BR_R: f(6, 5),
} as const;

// ─── Tile frame union ─────────────────────────────────────────────────────────
export type TileFrame = number;

// ─── Semantic aliases used by PlatformBuilder ─────────────────────────────────
export const GROUND_LEFT  = SURFACE.LEFT;
export const GROUND_MID   = SURFACE.MID_A;
export const GROUND_RIGHT = SURFACE.RIGHT;
export const GROUND_FILL  = FILL.A;

export const PLAT_LEFT  = SURFACE.LEFT;
export const PLAT_MID   = SURFACE.MID_A;
export const PLAT_RIGHT = SURFACE.RIGHT;
export const PLAT_SOLO  = SURFACE.MID_A;
export const PLAT_FILL  = FILL.B;

/** Frames suitable for random wall decoration stacked behind platforms. */
export const WALL_DECOR_FRAMES: TileFrame[] = [
  WALL.ARCH_A, WALL.ARCH_B, WALL.CRATE,
  WALL.PANEL_A, WALL.PANEL_B, WALL.PANEL_C,
  WALL.OVAL_A, WALL.OVAL_B, WALL.OVAL_C,
  WALL.OVAL_G, WALL.OVAL_H, WALL.OVAL_I,
];
