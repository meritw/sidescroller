import * as Phaser from "phaser";
import { TILE_PX, TILE_SCALE, GROUND_Y } from "../level/TileRegistry";
import { generateLevel } from "../level/LevelGenerator";
import { PlatformBuilder } from "../objects/PlatformBuilder";

const PLAYER_SPEED  = 220;
const JUMP_VELOCITY = -520;

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private coins!: Phaser.Physics.Arcade.StaticGroup;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    up: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };

  private bgCity!: Phaser.GameObjects.TileSprite;
  private bgFogMid!: Phaser.GameObjects.TileSprite;
  private bgFogNear!: Phaser.GameObjects.TileSprite;

  private score = 0;
  private debugKey!: Phaser.Input.Keyboard.Key;
  private tileOverlay!: Phaser.GameObjects.Group;
  private canDoubleJump = false;
  private hasJumped = false;
  private lastPlayerX = 0;
  private gamepadJumpPressed = false;

  constructor() {
    super({ key: "GameScene" });
  }

  create() {
    const seed = Date.now();
    const levelData = generateLevel(seed);

    this.createBackground();

    const builder = new PlatformBuilder(this);
    this.platforms = builder.build(levelData);
    this.tileOverlay = builder.debugDraw(this.platforms);

    this.createCoins(levelData.coins);
    this.createPlayer();
    this.setupInput();
    this.setupCamera(levelData.worldWidthPx);
    this.setupCollisions();
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.debugKey)) {
      this.toggleDebug();
    }
    this.handleMovement();
    this.updateParallax();
    this.updateUIData();
  }

  private toggleDebug(): void {
    const enabled = !this.physics.world.drawDebug;
    this.physics.world.drawDebug = enabled;

    if (enabled) {
      this.physics.world.createDebugGraphic();
    } else {
      this.physics.world.debugGraphic?.destroy();
    }

    this.tileOverlay.setVisible(enabled);
    this.registry.set("debug", enabled);
  }

  // ── Scene setup ─────────────────────────────────────────────────────────────

  private createBackground(): void {
    // Sky — solid gradient, fills viewport, never scrolls
    this.add
      .image(480, 270, "bg-base")
      .setDisplaySize(960, 540)
      .setScrollFactor(0);

    // Distant city silhouette — tiled, slow parallax
    this.bgCity = this.add
      .tileSprite(0, 540 - 208, 960, 208, "bg-city")
      .setOrigin(0, 0)
      .setScrollFactor(0);

    // Mid fog — sits above ground, moderate parallax
    this.bgFogMid = this.add
      .tileSprite(0, 540 - 200, 960, 200, "bg-fog-mid")
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setAlpha(0.6);

    // Near fog — hugs the ground, fast parallax
    this.bgFogNear = this.add
      .tileSprite(0, 540 - 120, 960, 120, "bg-fog-near")
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setAlpha(0.5);
  }

  private createCoins(coinDefs: { x: number; y: number }[]): void {
    this.coins = this.physics.add.staticGroup();
    for (const def of coinDefs) {
      this.coins.create(def.x, def.y, "coin")
        .setScale(TILE_SCALE)
        .refreshBody();
    }
  }

  private createPlayer(): void {
    this.player = this.physics.add.sprite(
      3 * TILE_PX + TILE_PX / 2,
      GROUND_Y - 50,
      "player-run",
      0
    );

    // Scale the large sprite down to fit ~1 tile wide × 2 tiles tall
    this.player.setDisplaySize(52, 100);

    // Physics body smaller than display so the character doesn't "float"
    this.player.setBodySize(36, 80);
    this.player.setOffset(
      (271 - 36) / 2,  // centre the body horizontally in the 271px frame
      (724 - 80) / 2   // centre vertically in the 724px frame
    );

    // ADD blend: makes the solid black background transparent
    this.player.setBlendMode(Phaser.BlendModes.ADD);

    this.player.setCollideWorldBounds(true);
    this.player.setDragX(600);
    this.player.setMaxVelocity(400, 1200);

    this.player.play("idle");
  }

  private setupInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      up:    this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      left:  this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.debugKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.FORWARD_SLASH
    );

    this.input.gamepad!.on(
      "down",
      (_pad: Phaser.Input.Gamepad.Gamepad, button: Phaser.Input.Gamepad.Button) => {
        if (button.index === 0 || button.index === 12) {
          this.gamepadJumpPressed = true;
        }
      }
    );
    this.input.gamepad!.on("connected", (pad: Phaser.Input.Gamepad.Gamepad) => {
      pad.setAxisThreshold(0.2);
    });
  }

  private setupCamera(worldWidthPx: number): void {
    this.cameras.main.setBounds(0, 0, worldWidthPx, 540);
    this.cameras.main.startFollow(this.player, false, 0.1, 0.1);
    this.physics.world.setBounds(0, 0, worldWidthPx, 600);
  }

  private setupCollisions(): void {
    this.physics.add.collider(this.player, this.platforms);

    this.physics.add.overlap(
      this.player,
      this.coins,
      (_player, coin) => {
        const c = coin as Phaser.Physics.Arcade.Image;
        c.destroy();
        this.score += 10;
        this.registry.set("score", this.score);

        const text = this.add
          .text(c.x, c.y - 10, "+10", {
            fontSize: "14px",
            color: "#ffdd00",
            fontStyle: "bold",
          })
          .setOrigin(0.5);

        this.tweens.add({
          targets: text,
          y: text.y - 40,
          alpha: 0,
          duration: 600,
          onComplete: () => text.destroy(),
        });

        const rumblePad = this.input.gamepad!.pad1;
        if (rumblePad?.vibration) {
          rumblePad.vibration.playEffect("dual-rumble", {
            duration: 80,
            strongMagnitude: 0.1,
            weakMagnitude: 0.4,
          });
        }
      },
      undefined,
      this
    );
  }

  // ── Per-frame ────────────────────────────────────────────────────────────────

  private handleMovement(): void {
    const body     = this.player.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down;

    const pad    = this.input.gamepad!.pad1;
    const stickX = pad ? pad.leftStick.x : 0;

    const left  = this.cursors.left.isDown  || this.wasd.left.isDown  || pad?.left  === true || stickX < -0.2;
    const right = this.cursors.right.isDown || this.wasd.right.isDown || pad?.right === true || stickX >  0.2;

    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
      Phaser.Input.Keyboard.JustDown(this.wasd.up) ||
      this.gamepadJumpPressed;

    this.gamepadJumpPressed = false;

    if (onGround) {
      this.canDoubleJump = true;
      this.hasJumped = false;
    }

    if (left)       { this.player.setVelocityX(-PLAYER_SPEED); this.player.setFlipX(true);  }
    else if (right) { this.player.setVelocityX( PLAYER_SPEED); this.player.setFlipX(false); }

    // Animation state
    if (!onGround) {
      if (this.player.anims.currentAnim?.key !== "jump") {
        this.player.play("jump");
      }
    } else if (left || right) {
      if (this.player.anims.currentAnim?.key !== "walk") {
        this.player.play("walk");
      }
    } else {
      if (this.player.anims.currentAnim?.key !== "idle") {
        this.player.play("idle");
      }
    }

    if (jumpPressed) {
      if (onGround || !this.hasJumped) {
        this.player.setVelocityY(JUMP_VELOCITY);
        this.hasJumped = true;
        this.canDoubleJump = true;
      } else if (this.canDoubleJump) {
        this.player.setVelocityY(JUMP_VELOCITY * 0.8);
        this.canDoubleJump = false;
      }
    }
  }

  private updateParallax(): void {
    const cx = this.cameras.main.scrollX;
    this.bgCity.tilePositionX     = cx * 0.15;
    this.bgFogMid.tilePositionX   = cx * 0.4;
    this.bgFogNear.tilePositionX  = cx * 0.7;
  }

  private updateUIData(): void {
    const x = Math.floor(this.player.x);
    if (x !== this.lastPlayerX) {
      this.lastPlayerX = x;
      this.registry.set("playerX", x);
    }
  }
}
