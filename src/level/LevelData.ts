/** A horizontal run of ground tiles. */
export interface GroundSegment {
  tileX: number;     // left edge (tile column)
  tileCount: number; // width in tiles
}

/** A floating platform the player can jump onto. */
export interface PlatformDef {
  tileX: number;      // left edge (tile column)
  tileY: number;      // surface row — the row players stand on
  tileCount: number;  // width in tiles
  fillRows: number;   // visual fill rows below surface (no physics body)
}

/** A tile from tiles.png placed purely for decoration (no physics). */
export interface WallDecoration {
  tileX: number;
  tileY: number;
  frame: number;
}

/** A sprite from props.png placed as foreground decoration. */
export interface PropDef {
  /** pixel x of left edge */
  x: number;
  /** pixel y of top edge */
  y: number;
  /** frame index into props.png (16×16 per frame, 8 cols × 14 rows) */
  frame: number;
}

export interface CoinDef {
  x: number; // pixel centre
  y: number; // pixel centre
}

/** A 2×3 pillar placed as background decoration. */
export interface PillarDef {
  tileX: number; // left column
  tileY: number; // top row
}

export interface LevelData {
  seed: number;
  worldWidthPx: number;
  /** Pixel Y of the top of the ground surface row. */
  groundY: number;
  ground: GroundSegment[];
  platforms: PlatformDef[];
  pillars: PillarDef[];
  wallDecor: WallDecoration[];
  props: PropDef[];
  coins: CoinDef[];
}
