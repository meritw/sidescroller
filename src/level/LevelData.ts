import type { SheetKey } from "./TileRegistry";

/** A horizontal run of ground tiles. */
export interface GroundSegment {
  tileX: number;
  tileCount: number;
}

/** A floating platform the player can jump onto. */
export interface PlatformDef {
  tileX: number;
  tileY: number;
  tileCount: number;
  fillRows: number;
}

/** A purely-decorative tile drawn from any sheet (no physics). */
export interface DecorTile {
  tileX: number;
  tileY: number;
  frame: number;
  sheet: SheetKey;
  /** Lower depths render further back. Default 0. */
  depth?: number;
  /** Optional horizontal flip. */
  flipX?: boolean;
}

/** A foreground prop placed at pixel coordinates (no physics). */
export interface PropDef {
  x: number;
  y: number;
  frame: number;
  sheet: SheetKey;
  depth?: number;
  flipX?: boolean;
}

export interface CoinDef {
  x: number;
  y: number;
}

export interface LevelData {
  seed: number;
  worldWidthPx: number;
  groundY: number;
  ground: GroundSegment[];
  platforms: PlatformDef[];
  /** Background decoration tiles (brick walls, doors, neon). */
  backdrop: DecorTile[];
  /** Foreground decoration tiles (overlay above platforms). */
  foreground: DecorTile[];
  /** Free-positioned props (light posts, signs, trash). */
  props: PropDef[];
  coins: CoinDef[];
}
