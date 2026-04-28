// Capture a screenshot of the running game.
// Usage: node scripts/screenshot.mjs [outputPath] [scrollX] [waitMs]
import puppeteer from "puppeteer";

const outPath  = process.argv[2] || "screenshot.png";
const scrollX  = Number(process.argv[3] ?? 0);
const waitMs   = Number(process.argv[4] ?? 1500);
const url      = process.env.GAME_URL || "http://localhost:3000";

const browser = await puppeteer.launch({
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 960, height: 540, deviceScaleFactor: 1 });

page.on("pageerror", (err) => console.error("PAGE ERROR:", err.message));
page.on("console", (msg) => {
  if (msg.type() === "error" || msg.type() === "warning") {
    console.error("CONSOLE:", msg.type(), msg.text());
  }
});

await page.goto(url, { waitUntil: "load", timeout: 30000 });

// Wait for Phaser to start and the GameScene to settle.
await page.waitForFunction(() => {
  const c = document.querySelector("canvas");
  return c && c.width > 0;
}, { timeout: 15000 });

await new Promise((r) => setTimeout(r, waitMs));

if (scrollX !== 0) {
  await page.evaluate((sx) => {
    const game = (window).Phaser?.GAMES?.[0] ?? (window).game;
    const scene = game?.scene?.getScene?.("GameScene");
    if (scene && scene.cameras?.main) {
      scene.cameras.main.stopFollow();
      scene.cameras.main.scrollX = sx;
    }
  }, scrollX);
  await new Promise((r) => setTimeout(r, 300));
}

await page.screenshot({ path: outPath, omitBackground: false });
await browser.close();
console.log("Saved", outPath);
