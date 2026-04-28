import * as Phaser from "phaser";

export class UIScene extends Phaser.Scene {
  private scoreText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "UIScene" });
  }

  create() {
    this.scoreText = this.add
      .text(16, 16, "Score: 0", {
        fontSize: "20px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setScrollFactor(0);

    this.add
      .text(16, 510, "Arrow Keys / WASD / Left Stick / D-Pad  |  Jump: Up/W/Space/A  |  Double Jump!", {
        fontSize: "12px",
        color: "#aaaaaa",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setScrollFactor(0);

    // Position indicator (top-right)
    this.add
      .text(944, 16, "", {
        fontSize: "12px",
        color: "#888888",
        align: "right",
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setName("posText");

    this.add
      .text(944, 510, "/ = debug", {
        fontSize: "12px",
        color: "#555566",
        align: "right",
      })
      .setOrigin(1, 1)
      .setScrollFactor(0);

    const debugBadge = this.add
      .text(480, 16, "DEBUG", {
        fontSize: "13px",
        color: "#ff4444",
        stroke: "#000000",
        strokeThickness: 3,
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setVisible(false)
      .setName("debugBadge");

    this.registry.events.on("changedata-score", (_parent: unknown, value: number) => {
      this.scoreText.setText(`Score: ${value}`);
    });

    this.registry.events.on("changedata-debug", (_parent: unknown, value: boolean) => {
      debugBadge.setVisible(value);
    });
  }

  update() {
    const posText = this.children.getByName("posText") as Phaser.GameObjects.Text | null;
    if (posText) {
      const x = this.registry.get("playerX") ?? 0;
      posText.setText(`x: ${x}`);
    }
  }
}
