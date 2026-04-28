import {
  TILE_PX,
  WORLD_COLS,
  WORLD_WIDTH,
  GROUND_TILE_Y,
  GROUND_Y,
  WALL_DECOR_FRAMES,
} from "./TileRegistry";
import type {
  LevelData,
  GroundSegment,
  PlatformDef,
  PillarDef,
  WallDecoration,
  PropDef,
  CoinDef,
} from "./LevelData";

// ─── Physics constraints (must match main.ts arcade config) ───────────────────
const PLAYER_SPEED   = 220; // px/s horizontal
const JUMP_VELOCITY  = 520; // px/s initial upward
const GRAVITY        = 800; // px/s²

// Max horizontal distance the player can cover in a full jump arc
const JUMP_DURATION  = (2 * JUMP_VELOCITY) / GRAVITY;          // ~1.3 s
const MAX_JUMP_PX    = Math.floor(PLAYER_SPEED * JUMP_DURATION); // ~286 px
const MAX_JUMP_TILES = Math.floor(MAX_JUMP_PX / TILE_PX);        // ~5

// Max upward height (v²/2g)
const MAX_HEIGHT_PX    = Math.floor((JUMP_VELOCITY * JUMP_VELOCITY) / (2 * GRAVITY)); // ~169 px
const MAX_HEIGHT_TILES = Math.floor(MAX_HEIGHT_PX / TILE_PX);                         // ~3

// ─── Seeded PRNG ──────────────────────────────────────────────────────────────
class RNG {
  private s: number;
  constructor(seed: number) { this.s = seed >>> 0; }

  next(): number {
    this.s = (Math.imul(1664525, this.s) + 1013904223) >>> 0;
    return this.s / 0x100000000;
  }
  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  bool(probability = 0.5): boolean { return this.next() < probability; }
  pick<T>(arr: readonly T[]): T { return arr[Math.floor(this.next() * arr.length)]; }
}

// ─── Prop frames ──────────────────────────────────────────────────────────────
// props.png: 128×224, 16×16 → 8 cols × 14 rows
// A handful of visually identifiable frames from the sheet:
const PROP_FRAMES = [0, 1, 8, 9, 16, 24, 32, 40];

// ─── Generator ────────────────────────────────────────────────────────────────
export function generateLevel(seed: number): LevelData {
  const rng = new RNG(seed);

  const ground: GroundSegment[]     = [];
  const platforms: PlatformDef[]    = [];
  const pillars: PillarDef[]        = [];
  const wallDecor: WallDecoration[] = [];
  const props: PropDef[]            = [];
  const coins: CoinDef[]            = [];

  // Track which tile columns have solid ground (for decoration placement)
  const hasGround = new Uint8Array(WORLD_COLS);

  // ── Safe start zone (first 12 tiles) ────────────────────────────────────────
  pushGround(0, 12, ground, hasGround);
  let x = 12;

  // ── Main generation loop ─────────────────────────────────────────────────────
  while (x < WORLD_COLS - 8) {
    const remaining = WORLD_COLS - 8 - x;

    // ── Ground segment ────────────────────────────────────────────────────────
    const segW = Math.min(rng.int(4, 12), remaining);
    pushGround(x, segW, ground, hasGround);

    // Occasionally scatter a floating platform above this segment
    if (rng.bool(0.45) && segW >= 3) {
      const platW      = rng.int(2, Math.min(5, segW));
      const platOffset = rng.int(0, segW - platW);
      const platTileX  = x + platOffset;
      const heightAbove = rng.int(2, MAX_HEIGHT_TILES); // 2–3 tiles up
      const platTileY  = GROUND_TILE_Y - heightAbove;

      platforms.push({
        tileX:     platTileX,
        tileY:     platTileY,
        tileCount: platW,
        fillRows:  heightAbove - 1,
      });

      // Coin above platform centre
      const coinTileX = platTileX + Math.floor(platW / 2);
      coins.push(tileToPixelCentre(coinTileX, platTileY - 1));
    }

    x += segW;

    // ── Optional gap ─────────────────────────────────────────────────────────
    const addGap = rng.bool(0.35) && remaining > 10;
    if (addGap) {
      const gapW = rng.int(2, Math.min(4, MAX_JUMP_TILES - 1));

      // Always provide a bridge platform so the gap is crossable
      const bridgeW      = rng.int(2, 4);
      const bridgeTileX  = x + Math.floor(gapW / 2);
      const bridgeHeight = rng.int(1, MAX_HEIGHT_TILES);
      const bridgeTileY  = GROUND_TILE_Y - bridgeHeight;

      platforms.push({
        tileX:     bridgeTileX,
        tileY:     bridgeTileY,
        tileCount: bridgeW,
        fillRows:  bridgeHeight,
      });
      coins.push(tileToPixelCentre(bridgeTileX + Math.floor(bridgeW / 2), bridgeTileY - 1));

      x += gapW;
    }
  }

  // ── Safe end zone ─────────────────────────────────────────────────────────
  pushGround(WORLD_COLS - 8, 8, ground, hasGround);

  // ── Coins on ground ───────────────────────────────────────────────────────
  for (let tx = 15; tx < WORLD_COLS - 10; tx += rng.int(6, 12)) {
    if (hasGround[tx]) {
      coins.push(tileToPixelCentre(tx, GROUND_TILE_Y - 1));
    }
  }

  // ── Pillars (2×3 decorative group, placed on ground, behind platforms) ──────
  for (let tx = 4; tx < WORLD_COLS - 4; tx += rng.int(12, 24)) {
    // Need 2 tiles of ground and 3 rows of space above
    if (!hasGround[tx] || !hasGround[tx + 1]) continue;
    pillars.push({ tileX: tx, tileY: GROUND_TILE_Y - 3 });
  }

  // ── Wall decorations (single tiles stacked above ground) ──────────────────
  for (let tx = 2; tx < WORLD_COLS - 2; tx++) {
    if (!hasGround[tx] || !rng.bool(0.12)) continue;
    // Don't place wall decor where a pillar already sits
    const hasPillar = pillars.some(p => tx >= p.tileX && tx <= p.tileX + 1);
    if (hasPillar) continue;
    const stackH = rng.int(1, 3);
    for (let row = 0; row < stackH; row++) {
      wallDecor.push({
        tileX: tx,
        tileY: GROUND_TILE_Y - 1 - row,
        frame: rng.pick(WALL_DECOR_FRAMES),
      });
    }
  }

  // ── Props (scattered along the ground in front of walls) ──────────────────
  for (let tx = 5; tx < WORLD_COLS - 5; tx += rng.int(8, 18)) {
    if (!hasGround[tx]) continue;
    props.push({
      x: tx * TILE_PX,
      y: GROUND_Y - TILE_PX, // sits on ground surface
      frame: rng.pick(PROP_FRAMES),
    });
  }

  return {
    seed,
    worldWidthPx: WORLD_WIDTH,
    groundY: GROUND_Y,
    ground,
    platforms,
    pillars,
    wallDecor,
    props,
    coins,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pushGround(
  tileX: number,
  tileCount: number,
  out: GroundSegment[],
  map: Uint8Array
): void {
  out.push({ tileX, tileCount });
  for (let i = 0; i < tileCount; i++) {
    if (tileX + i < map.length) map[tileX + i] = 1;
  }
}

/** Returns pixel centre for an object placed at a given tile coordinate. */
function tileToPixelCentre(tileX: number, tileY: number): { x: number; y: number } {
  return {
    x: tileX * TILE_PX + TILE_PX / 2,
    y: tileY * TILE_PX + TILE_PX / 2,
  };
}
