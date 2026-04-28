import * as Phaser from "phaser";
import {
  TILE_PX, TILE_SCALE, GROUND_TILE_Y,
  GROUND_LEFT, GROUND_MID, GROUND_RIGHT, GROUND_FILL,
  PLAT_LEFT, PLAT_MID, PLAT_RIGHT, PLAT_SOLO, PLAT_FILL,
  PILLAR,
} from "../level/TileRegistry";
import type { LevelData } from "../level/LevelData";

export class PlatformBuilder {
  constructor(private scene: Phaser.Scene) {}

  /**
   * Instantiates all level geometry from LevelData.
   * Returns the StaticGroup that the player should collide with.
   */
  build(data: LevelData): Phaser.Physics.Arcade.StaticGroup {
    const platforms = this.scene.physics.add.staticGroup();

    this.placeWallDecor(data);
    for (const p of data.pillars) this.placePillar(p.tileX, p.tileY);
    this.placeGroundFill(data);
    this.placeGround(data, platforms);
    this.placeFloatingPlatforms(data, platforms);
    this.placeProps(data);

    return platforms;
  }

  // ── Private placement methods ──────────────────────────────────────────────

  private placeWallDecor(data: LevelData): void {
    for (const d of data.wallDecor) {
      this.tile(d.tileX, d.tileY, d.frame);
    }
  }

  private placeGroundFill(data: LevelData): void {
    for (const seg of data.ground) {
      for (let i = 0; i < seg.tileCount; i++) {
        const tx = seg.tileX + i;
        this.tile(tx, GROUND_TILE_Y + 1, GROUND_FILL);
        this.tile(tx, GROUND_TILE_Y + 2, GROUND_FILL);
      }
    }

    for (const plat of data.platforms) {
      for (let row = 1; row <= plat.fillRows; row++) {
        for (let i = 0; i < plat.tileCount; i++) {
          this.tile(plat.tileX + i, plat.tileY + row, PLAT_FILL);
        }
      }
    }
  }

  private placeGround(data: LevelData, group: Phaser.Physics.Arcade.StaticGroup): void {
    for (const seg of data.ground) {
      for (let i = 0; i < seg.tileCount; i++) {
        const tx = seg.tileX + i;
        const isLeft  = i === 0;
        const isRight = i === seg.tileCount - 1;
        const frame = isLeft ? GROUND_LEFT : isRight ? GROUND_RIGHT : GROUND_MID;
        this.physicsTile(tx, GROUND_TILE_Y, frame, group);
      }
    }
  }

  private placeFloatingPlatforms(
    data: LevelData,
    group: Phaser.Physics.Arcade.StaticGroup
  ): void {
    for (const plat of data.platforms) {
      const w = plat.tileCount;
      for (let i = 0; i < w; i++) {
        const tx = plat.tileX + i;
        const frame = w === 1 ? PLAT_SOLO
          : i === 0 ? PLAT_LEFT
          : i === w - 1 ? PLAT_RIGHT
          : PLAT_MID;
        this.physicsTile(tx, plat.tileY, frame, group);
      }
    }
  }

  /**
   * Place the 2×3 pillar group at tileX, tileY (tileY = top row).
   * Frames 24,25 / 30,31 / 36,37 — flat-topped pillar.
   */
  placePillar(tileX: number, tileY: number): void {
    this.tile(tileX,     tileY,     PILLAR.TOP_L);
    this.tile(tileX + 1, tileY,     PILLAR.TOP_R);
    this.tile(tileX,     tileY + 1, PILLAR.MID_L);
    this.tile(tileX + 1, tileY + 1, PILLAR.MID_R);
    this.tile(tileX,     tileY + 2, PILLAR.BASE_L);
    this.tile(tileX + 1, tileY + 2, PILLAR.BASE_R);
  }

  private placeProps(data: LevelData): void {
    for (const prop of data.props) {
      this.scene.add
        .image(prop.x + TILE_PX / 2, prop.y + TILE_PX / 2, "props", prop.frame)
        .setScale(TILE_SCALE);
    }
  }

  // ── Tile helpers ──────────────────────────────────────────────────────────

  /** Place a purely visual tile (no physics body). */
  private tile(tileX: number, tileY: number, frame: number): void {
    this.scene.add
      .image(cx(tileX), cy(tileY), "tiles", frame)
      .setScale(TILE_SCALE);
  }

  /** Place a tile with a static physics body. */
  private physicsTile(
    tileX: number,
    tileY: number,
    frame: number,
    group: Phaser.Physics.Arcade.StaticGroup
  ): void {
    (group.create(cx(tileX), cy(tileY), "tiles", frame) as Phaser.Physics.Arcade.Image)
      .setScale(TILE_SCALE)
      .refreshBody();
  }

  // ── Debug overlay ─────────────────────────────────────────────────────────

  /**
   * Draws frame index numbers over every tile in a StaticGroup.
   * Call from GameScene.create() to calibrate TileRegistry frame constants.
   *
   *   builder.debugDraw(platforms);
   */
  /**
   * Creates a hidden group of frame-index labels over every physics tile.
   * Toggle `.setVisible()` on the returned group to show/hide.
   */
  debugDraw(group: Phaser.Physics.Arcade.StaticGroup): Phaser.GameObjects.Group {
    const overlay = this.scene.add.group();
    group.getChildren().forEach((child) => {
      const img = child as Phaser.Physics.Arcade.Image;
      const frame = img.frame?.name ?? "?";
      const text = this.scene.add
        .text(img.x, img.y, String(frame), {
          fontSize: "10px",
          color: "#ffff00",
          stroke: "#000000",
          strokeThickness: 2,
        })
        .setOrigin(0.5)
        .setDepth(100)
        .setVisible(false);
      overlay.add(text);
    });
    return overlay;
  }
}

/** Pixel X centre for a tile column. */
function cx(tileX: number): number { return tileX * TILE_PX + TILE_PX / 2; }
/** Pixel Y centre for a tile row. */
function cy(tileY: number): number { return tileY * TILE_PX + TILE_PX / 2; }
