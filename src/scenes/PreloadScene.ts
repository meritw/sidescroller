import * as Phaser from "phaser";
import { TILE_SIZE } from "../level/TileRegistry";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload() {
    this.showLoadingBar();

    this.load.setPath("assets/");

    // Tilesets (16×16 per frame)
    this.load.spritesheet("tiles",     "tiles.png",     { frameWidth: TILE_SIZE, frameHeight: TILE_SIZE });
    this.load.spritesheet("buildings", "buildings.png", { frameWidth: TILE_SIZE, frameHeight: TILE_SIZE });
    this.load.spritesheet("props",     "props.png",     { frameWidth: TILE_SIZE, frameHeight: TILE_SIZE });

    // Player (8 frames each, black bg — rendered with ADD blend)
    this.load.spritesheet("player-run",  "player-run.png",  { frameWidth: 271, frameHeight: 724 });
    this.load.spritesheet("player-jump", "player-jump.png", { frameWidth: 221, frameHeight: 887 });

    // Background layers
    this.load.image("bg-base",     "bg-base.png");
    this.load.image("bg-city",     "bg-city.png");
    this.load.image("bg-fog-mid",  "bg-fog-mid.png");
    this.load.image("bg-fog-near", "bg-fog-near.png");
  }

  create() {
    // Only the coin stays procedural — no coin in the urban asset pack
    this.generateCoin();
    this.createAnimations();

    this.scene.start("GameScene");
    this.scene.launch("UIScene");
  }

  // ── Procedural textures ────────────────────────────────────────────────────

  private generateCoin(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xffdd00);
    g.fillCircle(8, 8, 7);
    g.fillStyle(0xffaa00);
    g.fillCircle(8, 8, 4);
    g.generateTexture("coin", 16, 16);
    g.destroy();
  }

  private createAnimations(): void {
    // AnimationManager is global — define once here so all scenes share them.
    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNumbers("player-run", { start: 0, end: 7 }),
      frameRate: 12,
      repeat: -1,
    });
    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNumbers("player-run", { frames: [0] }),
      frameRate: 1,
      repeat: -1,
    });
    this.anims.create({
      key: "jump",
      frames: this.anims.generateFrameNumbers("player-jump", { start: 0, end: 7 }),
      frameRate: 10,
      repeat: 0,
    });
  }

  // ── Loading bar ────────────────────────────────────────────────────────────

  private showLoadingBar(): void {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;

    this.add.text(cx, cy - 30, "Loading...", {
      fontSize: "16px",
      color: "#aaaaff",
    }).setOrigin(0.5);

    this.add.rectangle(cx, cy, 400, 12, 0x222244);
    const bar = this.add.rectangle(cx - 200, cy, 0, 8, 0x7c7cff).setOrigin(0, 0.5);

    this.load.on("progress", (v: number) => { bar.width = 400 * v; });
  }
}
