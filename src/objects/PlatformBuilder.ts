import * as Phaser from "phaser";
import {
  TILE_PX, TILE_SCALE, GROUND_TILE_Y,
  GROUND_LEFT, GROUND_MID, GROUND_RIGHT, GROUND_FILL,
  PLAT_LEFT, PLAT_MID, PLAT_RIGHT, PLAT_SOLO, PLAT_FILL,
} from "../level/TileRegistry";
import type { LevelData, DecorTile, PropDef } from "../level/LevelData";

export class PlatformBuilder {
  constructor(private scene: Phaser.Scene) {}

  build(data: LevelData): Phaser.Physics.Arcade.StaticGroup {
    const platforms = this.scene.physics.add.staticGroup();

    // Render order (back-to-front):
    //   1. backdrop (brick walls)         depth ~ -20…-5
    //   2. ground fill                    depth = -1
    //   3. ground/platforms (physics)     depth = 0
    //   4. foreground decor (signs etc.)  depth = 5+
    //   5. props (free placement)         depth from data
    this.placeBackdrop(data.backdrop);
    this.placeGroundFill(data);
    this.placeGround(data, platforms);
    this.placeFloatingPlatforms(data, platforms);
    this.placeForeground(data.foreground);
    this.placeProps(data.props);

    return platforms;
  }

  // ── Backdrop / foreground decor ────────────────────────────────────────────
  private placeBackdrop(decor: DecorTile[]): void {
    for (const d of decor) {
      this.decorTile(d);
    }
  }

  private placeForeground(decor: DecorTile[]): void {
    for (const d of decor) {
      this.decorTile(d);
    }
  }

  // ── Ground / platform tiles ────────────────────────────────────────────────
  private placeGroundFill(data: LevelData): void {
    for (const seg of data.ground) {
      for (let i = 0; i < seg.tileCount; i++) {
        const tx = seg.tileX + i;
        this.tile(tx, GROUND_TILE_Y + 1, GROUND_FILL, "tiles", -1);
        this.tile(tx, GROUND_TILE_Y + 2, GROUND_FILL, "tiles", -1);
      }
    }

    for (const plat of data.platforms) {
      for (let row = 1; row <= plat.fillRows; row++) {
        for (let i = 0; i < plat.tileCount; i++) {
          this.tile(plat.tileX + i, plat.tileY + row, PLAT_FILL, "tiles", -1);
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
    group: Phaser.Physics.Arcade.StaticGroup,
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

  // ── Props (free-placed sprites) ────────────────────────────────────────────
  private placeProps(props: PropDef[]): void {
    for (const prop of props) {
      const img = this.scene.add
        .image(prop.x + TILE_PX / 2, prop.y + TILE_PX / 2, prop.sheet, prop.frame)
        .setScale(TILE_SCALE);
      if (prop.depth !== undefined) img.setDepth(prop.depth);
      if (prop.flipX) img.setFlipX(true);
    }
  }

  // ── Tile helpers ──────────────────────────────────────────────────────────
  private decorTile(d: DecorTile): void {
    const img = this.scene.add
      .image(cx(d.tileX), cy(d.tileY), d.sheet, d.frame)
      .setScale(TILE_SCALE);
    img.setDepth(d.depth ?? 0);
    if (d.flipX) img.setFlipX(true);
  }

  private tile(
    tileX: number,
    tileY: number,
    frame: number,
    sheet: "tiles" | "buildings" | "props" = "tiles",
    depth = 0,
  ): void {
    this.scene.add
      .image(cx(tileX), cy(tileY), sheet, frame)
      .setScale(TILE_SCALE)
      .setDepth(depth);
  }

  private physicsTile(
    tileX: number,
    tileY: number,
    frame: number,
    group: Phaser.Physics.Arcade.StaticGroup,
  ): void {
    const img = group.create(cx(tileX), cy(tileY), "tiles", frame) as Phaser.Physics.Arcade.Image;
    img.setScale(TILE_SCALE).refreshBody();
    img.setDepth(0);
  }

  // ── Debug overlay ─────────────────────────────────────────────────────────
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

function cx(tileX: number): number { return tileX * TILE_PX + TILE_PX / 2; }
function cy(tileY: number): number { return tileY * TILE_PX + TILE_PX / 2; }
