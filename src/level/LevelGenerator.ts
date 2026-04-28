import {
  TILE_PX,
  WORLD_COLS,
  WORLD_WIDTH,
  GROUND_TILE_Y,
  GROUND_Y,
  BACKDROP_HEIGHT_MAX,
  BACKDROP_HEIGHT_MIN,
  BRICK_FRAMES,
  ALLEY_FRAMES,
  WOOD_DOOR,
  GRAND_DOOR,
  SHUTTER_WINDOW,
  PINK_NEON,
  RED_NEON,
  SHUTTER_STORE,
  SCAFFOLD,
  ROOF_TRIM,
  AWNING_ORANGE,
  ANNO_SIGN,
  BARRICADE,
  LIGHT_POST,
  LAMP_BAR,
  TRASH,
  MAILBOX,
  TRAFFIC_LIGHTS,
  STAIRS,
  BILLBOARD,
  PINK_PANELS,
} from "./TileRegistry";
import type {
  LevelData,
  GroundSegment,
  PlatformDef,
  DecorTile,
  PropDef,
  CoinDef,
} from "./LevelData";

// ─── Physics constraints (must match main.ts arcade config) ───────────────────
const PLAYER_SPEED   = 220;
const JUMP_VELOCITY  = 520;
const GRAVITY        = 800;

const JUMP_DURATION  = (2 * JUMP_VELOCITY) / GRAVITY;
const MAX_JUMP_PX    = Math.floor(PLAYER_SPEED * JUMP_DURATION);
const MAX_JUMP_TILES = Math.floor(MAX_JUMP_PX / TILE_PX);

const MAX_HEIGHT_PX    = Math.floor((JUMP_VELOCITY * JUMP_VELOCITY) / (2 * GRAVITY));
const MAX_HEIGHT_TILES = Math.floor(MAX_HEIGHT_PX / TILE_PX);

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
  bool(p = 0.5): boolean { return this.next() < p; }
  pick<T>(arr: readonly T[]): T { return arr[Math.floor(this.next() * arr.length)]; }
}

// ─── Generator ────────────────────────────────────────────────────────────────
export function generateLevel(seed: number): LevelData {
  const rng = new RNG(seed);

  const ground: GroundSegment[]  = [];
  const platforms: PlatformDef[] = [];
  const backdrop: DecorTile[]    = [];
  const foreground: DecorTile[]  = [];
  const props: PropDef[]         = [];
  const coins: CoinDef[]         = [];

  const hasGround = new Uint8Array(WORLD_COLS);

  // ── Ground / platforms layout ───────────────────────────────────────────────
  pushGround(0, 12, ground, hasGround);
  let x = 12;

  while (x < WORLD_COLS - 8) {
    const remaining = WORLD_COLS - 8 - x;
    const segW = Math.min(rng.int(5, 14), remaining);
    pushGround(x, segW, ground, hasGround);

    if (rng.bool(0.45) && segW >= 3) {
      const platW       = rng.int(2, Math.min(5, segW));
      const platOffset  = rng.int(0, segW - platW);
      const platTileX   = x + platOffset;
      const heightAbove = rng.int(2, MAX_HEIGHT_TILES);
      const platTileY   = GROUND_TILE_Y - heightAbove;

      platforms.push({
        tileX:     platTileX,
        tileY:     platTileY,
        tileCount: platW,
        fillRows:  heightAbove - 1,
      });

      const coinTileX = platTileX + Math.floor(platW / 2);
      coins.push(tileToPixelCentre(coinTileX, platTileY - 1));
    }

    x += segW;

    if (rng.bool(0.3) && remaining > 10) {
      const gapW = rng.int(2, Math.min(4, MAX_JUMP_TILES - 1));
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
  pushGround(WORLD_COLS - 8, 8, ground, hasGround);

  // Coins on ground
  for (let tx = 15; tx < WORLD_COLS - 10; tx += rng.int(6, 12)) {
    if (hasGround[tx]) coins.push(tileToPixelCentre(tx, GROUND_TILE_Y - 1));
  }

  // ── Building backdrop ───────────────────────────────────────────────────────
  // Divide the world into "buildings" of 6–14 tiles wide, each at its own
  // height. Between buildings we leave a 1-tile dark "alleyway" seam.
  let bx = 0;
  let prevHeight = rng.int(BACKDROP_HEIGHT_MIN, BACKDROP_HEIGHT_MAX);
  while (bx < WORLD_COLS) {
    const bw = Math.min(rng.int(6, 14), WORLD_COLS - bx);
    // Vary height — keep step within ±3 so the skyline reads as continuous.
    const delta = rng.int(-3, 3);
    const h = clamp(prevHeight + delta, BACKDROP_HEIGHT_MIN, BACKDROP_HEIGHT_MAX);
    prevHeight = h;
    const topY = GROUND_TILE_Y - h;
    drawBuilding(bx, bw, topY, rng, backdrop, foreground);
    bx += bw;

    // Alleyway seam (1 tile of dark fill, only as tall as the shorter neighbor)
    if (bx < WORLD_COLS) {
      const alley = rng.pick(ALLEY_FRAMES);
      const nextH = clamp(h + rng.int(-3, 3), BACKDROP_HEIGHT_MIN, BACKDROP_HEIGHT_MAX);
      const seamTop = GROUND_TILE_Y - Math.min(h, nextH);
      for (let row = seamTop; row < GROUND_TILE_Y; row++) {
        backdrop.push({ tileX: bx, tileY: row, frame: alley, sheet: "buildings", depth: -10 });
      }
      bx += 1;
    }
  }

  // ── Foreground props on the ground ─────────────────────────────────────────
  placeForegroundProps(rng, hasGround, props, foreground);

  return {
    seed,
    worldWidthPx: WORLD_WIDTH,
    groundY: GROUND_Y,
    ground,
    platforms,
    backdrop,
    foreground,
    props,
    coins,
  };
}

// ─── Building backdrop drawing ────────────────────────────────────────────────
function drawBuilding(
  x0: number,
  w: number,
  topY: number,
  rng: RNG,
  backdrop: DecorTile[],
  foreground: DecorTile[],
): void {
  const groundRow = GROUND_TILE_Y - 1; // first row above ground surface
  const wallTopRow = topY;

  // Fill brick wall over the entire footprint. Vary frame per tile.
  for (let row = wallTopRow; row <= groundRow; row++) {
    for (let col = x0; col < x0 + w; col++) {
      backdrop.push({
        tileX: col,
        tileY: row,
        frame: rng.pick(BRICK_FRAMES),
        sheet: "buildings",
        depth: -20,
      });
    }
  }

  // Roof trim (single row of darker capping at the top edge of the building)
  if (rng.bool(0.4) && w >= 3) {
    const trim = ROOF_TRIM;
    for (let col = x0; col < x0 + w; col++) {
      const f = col === x0 ? trim.L : col === x0 + w - 1 ? trim.R : trim.M;
      backdrop.push({ tileX: col, tileY: wallTopRow, frame: f, sheet: "buildings", depth: -15 });
    }
  }

  // Pick a couple of accents to place inside the wall (more for wider buildings).
  const maxAccents = w >= 10 ? 3 : w >= 6 ? 2 : 1;
  const accents = rng.int(1, maxAccents);
  const used = new Set<number>(); // columns already occupied
  for (let i = 0; i < accents; i++) {
    placeAccent(x0, w, wallTopRow, groundRow, used, rng, backdrop, foreground);
  }
}

function placeAccent(
  x0: number,
  w: number,
  topRow: number,
  groundRow: number,
  used: Set<number>,
  rng: RNG,
  backdrop: DecorTile[],
  foreground: DecorTile[],
): void {
  // Weighted picks: duplicates increase frequency.
  const choices: Array<() => boolean> = [
    () => tryWoodDoor(x0, w, groundRow, used, rng, backdrop),
    () => tryWoodDoor(x0, w, groundRow, used, rng, backdrop),
    () => tryGrandDoor(x0, w, groundRow, used, rng, backdrop),
    () => tryShutterWindow(x0, w, topRow, groundRow, used, rng, backdrop),
    () => tryShutterWindow(x0, w, topRow, groundRow, used, rng, backdrop),
    () => tryPinkNeon(x0, w, topRow, groundRow, used, rng, foreground),
    () => tryPinkNeon(x0, w, topRow, groundRow, used, rng, foreground),
    () => tryRedNeon(x0, w, topRow, groundRow, used, rng, foreground),
    () => tryShutterStore(x0, w, topRow, groundRow, used, rng, backdrop, foreground),
    () => tryScaffold(x0, w, topRow, groundRow, used, rng, foreground),
    () => tryBillboard(x0, w, topRow, groundRow, used, rng, foreground),
    () => tryOrangeAwning(x0, w, groundRow, used, rng, foreground),
    () => tryOrangeAwning(x0, w, groundRow, used, rng, foreground),
  ];
  // Try a couple of shuffled choices until one fits.
  for (let attempt = 0; attempt < 4; attempt++) {
    const fn = rng.pick(choices);
    if (fn()) return;
  }
}

function reserve(used: Set<number>, x: number, w: number): boolean {
  for (let c = x; c < x + w; c++) if (used.has(c)) return false;
  for (let c = x; c < x + w; c++) used.add(c);
  return true;
}

function tryWoodDoor(
  x0: number, w: number, groundRow: number,
  used: Set<number>, rng: RNG, out: DecorTile[],
): boolean {
  if (w < 2) return false;
  const px = x0 + rng.int(0, w - 2);
  if (!reserve(used, px, 2)) return false;
  const py = groundRow - 1; // door is 2 tall, sits flush with ground
  out.push({ tileX: px,     tileY: py,     frame: WOOD_DOOR.TL, sheet: "buildings", depth: -10 });
  out.push({ tileX: px + 1, tileY: py,     frame: WOOD_DOOR.TR, sheet: "buildings", depth: -10 });
  out.push({ tileX: px,     tileY: py + 1, frame: WOOD_DOOR.BL, sheet: "buildings", depth: -10 });
  out.push({ tileX: px + 1, tileY: py + 1, frame: WOOD_DOOR.BR, sheet: "buildings", depth: -10 });
  return true;
}

function tryGrandDoor(
  x0: number, w: number, groundRow: number,
  used: Set<number>, rng: RNG, out: DecorTile[],
): boolean {
  if (w < 2) return false;
  const px = x0 + rng.int(0, w - 2);
  if (!reserve(used, px, 2)) return false;
  const py = groundRow - 2;
  const cells = [
    [GRAND_DOOR.TL, GRAND_DOOR.TR],
    [GRAND_DOOR.ML, GRAND_DOOR.MR],
    [GRAND_DOOR.BL, GRAND_DOOR.BR],
  ];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) {
    out.push({ tileX: px + c, tileY: py + r, frame: cells[r][c], sheet: "buildings", depth: -10 });
  }
  return true;
}

function tryShutterWindow(
  x0: number, w: number, topRow: number, groundRow: number,
  used: Set<number>, rng: RNG, out: DecorTile[],
): boolean {
  if (w < 2) return false;
  const px = x0 + rng.int(0, w - 2);
  if (!reserve(used, px, 2)) return false;
  const py = topRow + rng.int(1, Math.max(1, groundRow - topRow - 3));
  out.push({ tileX: px,     tileY: py,     frame: SHUTTER_WINDOW.TL, sheet: "buildings", depth: -10 });
  out.push({ tileX: px + 1, tileY: py,     frame: SHUTTER_WINDOW.TR, sheet: "buildings", depth: -10 });
  out.push({ tileX: px,     tileY: py + 1, frame: SHUTTER_WINDOW.BL, sheet: "buildings", depth: -10 });
  out.push({ tileX: px + 1, tileY: py + 1, frame: SHUTTER_WINDOW.BR, sheet: "buildings", depth: -10 });
  return true;
}

function tryPinkNeon(
  x0: number, w: number, topRow: number, groundRow: number,
  used: Set<number>, rng: RNG, out: DecorTile[],
): boolean {
  if (w < 1 || groundRow - topRow < 4) return false;
  const px = x0 + rng.int(0, w - 1);
  if (!reserve(used, px, 1)) return false;
  const py = topRow + 1;
  for (let i = 0; i < PINK_NEON.length; i++) {
    out.push({ tileX: px, tileY: py + i, frame: PINK_NEON[i], sheet: "buildings", depth: -5 });
  }
  return true;
}

function tryRedNeon(
  x0: number, w: number, topRow: number, groundRow: number,
  used: Set<number>, rng: RNG, out: DecorTile[],
): boolean {
  if (w < 4 || groundRow - topRow < 4) return false;
  const px = x0 + rng.int(0, w - 4);
  if (!reserve(used, px, 4)) return false;
  const py = topRow + 1;
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    out.push({
      tileX: px + c, tileY: py + r,
      frame: RED_NEON.rows[r][c],
      sheet: "buildings",
      depth: -5,
    });
  }
  return true;
}

function tryShutterStore(
  x0: number, w: number, topRow: number, groundRow: number,
  used: Set<number>, rng: RNG, _backdrop: DecorTile[], foreground: DecorTile[],
): boolean {
  if (w < 3 || groundRow - topRow < 5) return false;
  const px = x0 + rng.int(0, w - 3);
  if (!reserve(used, px, 3)) return false;
  // 6 rows tall, anchor bottom to ground row
  const py = groundRow - 5;
  for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) {
    foreground.push({
      tileX: px + c, tileY: py + r,
      frame: SHUTTER_STORE.rows[r][c],
      sheet: "buildings",
      depth: -5,
    });
  }
  return true;
}

function tryScaffold(
  x0: number, w: number, topRow: number, groundRow: number,
  used: Set<number>, rng: RNG, out: DecorTile[],
): boolean {
  if (w < 5 || groundRow - topRow < 3) return false;
  const px = x0 + rng.int(0, w - 5);
  if (!reserve(used, px, 5)) return false;
  const py = groundRow - 3;
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
    out.push({
      tileX: px + c, tileY: py + r,
      frame: SCAFFOLD.rows[r][c],
      sheet: "buildings",
      depth: -5,
    });
  }
  return true;
}

function tryBillboard(
  x0: number, w: number, topRow: number, groundRow: number,
  used: Set<number>, rng: RNG, out: DecorTile[],
): boolean {
  if (w < 4 || groundRow - topRow < 4) return false;
  const px = x0 + rng.int(0, w - 4);
  if (!reserve(used, px, 4)) return false;
  const py = topRow + 1;
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    out.push({
      tileX: px + c, tileY: py + r,
      frame: BILLBOARD.rows[r][c],
      sheet: "props",
      depth: -5,
    });
  }
  return true;
}

function tryOrangeAwning(
  x0: number, w: number, groundRow: number,
  used: Set<number>, rng: RNG, out: DecorTile[],
): boolean {
  if (w < 4) return false;
  const px = x0 + rng.int(0, w - 4);
  if (!reserve(used, px, 4)) return false;
  const py = groundRow - 3;
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
    out.push({
      tileX: px + c, tileY: py + r,
      frame: AWNING_ORANGE.rows[r][c],
      sheet: "buildings",
      depth: -5,
    });
  }
  return true;
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

// ─── Foreground props on the ground ──────────────────────────────────────────
function placeForegroundProps(
  rng: RNG,
  hasGround: Uint8Array,
  props: PropDef[],
  foreground: DecorTile[],
): void {
  type PlaceFn = (tx: number) => boolean;

  const placeAnno: PlaceFn = (tx) => {
    if (!hasGround[tx] || !hasGround[tx + 1] || !hasGround[tx + 2]) return false;
    const py = GROUND_TILE_Y - 1;
    for (let i = 0; i < ANNO_SIGN.length; i++) {
      foreground.push({
        tileX: tx + i, tileY: py,
        frame: ANNO_SIGN[i],
        sheet: "props",
        depth: 5,
      });
    }
    return true;
  };

  const placeBarricade: PlaceFn = (tx) => {
    if (!hasGround[tx] || !hasGround[tx + 1] || !hasGround[tx + 2]) return false;
    const py = GROUND_TILE_Y - 2;
    for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
      foreground.push({
        tileX: tx + c, tileY: py + r,
        frame: BARRICADE.rows[r][c],
        sheet: "props",
        depth: 5,
      });
    }
    return true;
  };

  const placeLightPost: PlaceFn = (tx) => {
    if (!hasGround[tx]) return false;
    const py = GROUND_TILE_Y - LIGHT_POST.length;
    for (let i = 0; i < LIGHT_POST.length; i++) {
      foreground.push({
        tileX: tx, tileY: py + i,
        frame: LIGHT_POST[i],
        sheet: "props",
        depth: 5,
      });
    }
    return true;
  };

  const placeLampBar: PlaceFn = (tx) => {
    if (!hasGround[tx]) return false;
    const py = GROUND_TILE_Y - 6;
    for (let i = 0; i < LAMP_BAR.top.length; i++) {
      foreground.push({
        tileX: tx + i, tileY: py,
        frame: LAMP_BAR.top[i],
        sheet: "props",
        depth: 5,
      });
      foreground.push({
        tileX: tx + i, tileY: py + 1,
        frame: LAMP_BAR.bot[i],
        sheet: "props",
        depth: 5,
      });
    }
    return true;
  };

  const placeTrash: PlaceFn = (tx) => {
    if (!hasGround[tx]) return false;
    const py = GROUND_TILE_Y - 1;
    foreground.push({ tileX: tx,     tileY: py, frame: TRASH.L, sheet: "props", depth: 6 });
    foreground.push({ tileX: tx + 1, tileY: py, frame: TRASH.R, sheet: "props", depth: 6 });
    return true;
  };

  const placeMailbox: PlaceFn = (tx) => {
    if (!hasGround[tx] || !hasGround[tx + 1]) return false;
    const py = GROUND_TILE_Y - 3;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) {
      foreground.push({
        tileX: tx + c, tileY: py + r,
        frame: MAILBOX.rows[r][c],
        sheet: "props",
        depth: 5,
      });
    }
    return true;
  };

  const placeTrafficLights: PlaceFn = (tx) => {
    if (!hasGround[tx]) return false;
    const variant = rng.pick(TRAFFIC_LIGHTS);
    const py = GROUND_TILE_Y - 2;
    foreground.push({ tileX: tx, tileY: py,     frame: variant[0], sheet: "props", depth: 6 });
    foreground.push({ tileX: tx, tileY: py + 1, frame: variant[1], sheet: "props", depth: 6 });
    return true;
  };

  const placeStairs: PlaceFn = (tx) => {
    if (!hasGround[tx] || !hasGround[tx + 1]) return false;
    const py = GROUND_TILE_Y - 3;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) {
      foreground.push({
        tileX: tx + c, tileY: py + r,
        frame: STAIRS.rows[r][c],
        sheet: "props",
        depth: 5,
      });
    }
    return true;
  };

  const placePinkPanels: PlaceFn = (tx) => {
    if (!hasGround[tx] || !hasGround[tx + 1]) return false;
    const py = GROUND_TILE_Y - 1;
    foreground.push({ tileX: tx,     tileY: py, frame: PINK_PANELS[0], sheet: "props", depth: 4 });
    foreground.push({ tileX: tx + 1, tileY: py, frame: PINK_PANELS[1], sheet: "props", depth: 4 });
    return true;
  };

  // Mark unused-foreground param to keep TS happy and silence linter.
  void props;

  const placers: PlaceFn[] = [
    placeAnno, placeBarricade, placeLightPost, placeLampBar,
    placeTrash, placeMailbox, placeTrafficLights, placeStairs, placePinkPanels,
  ];

  // Walk the world and try to place a prop every few tiles.
  let tx = 4;
  while (tx < WORLD_COLS - 4) {
    const fn = rng.pick(placers);
    if (fn(tx)) tx += rng.int(4, 9);
    else tx += 1;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pushGround(
  tileX: number,
  tileCount: number,
  out: GroundSegment[],
  map: Uint8Array,
): void {
  out.push({ tileX, tileCount });
  for (let i = 0; i < tileCount; i++) {
    if (tileX + i < map.length) map[tileX + i] = 1;
  }
}

function tileToPixelCentre(tileX: number, tileY: number): { x: number; y: number } {
  return {
    x: tileX * TILE_PX + TILE_PX / 2,
    y: tileY * TILE_PX + TILE_PX / 2,
  };
}
