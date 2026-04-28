// Render an asset sheet at high zoom with a grid + frame numbers, save to /tmp.
// Usage: node scripts/inspect-tiles.mjs <relative-path-under-public/assets> <cols> <rows> [scale]
import puppeteer from "puppeteer";

const file  = process.argv[2];
const cols  = Number(process.argv[3]);
const rows  = Number(process.argv[4]);
const scale = Number(process.argv[5] ?? 4);

const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage();
const W = cols * 16 * scale + 200;
const H = rows * 16 * scale + 60;
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });

const html = `<!doctype html>
<style>body{margin:0;background:#202;color:#fff;font:12px monospace}
canvas{image-rendering:pixelated;display:block}</style>
<canvas id=c width=${W} height=${H}></canvas>
<script>
const img = new Image();
img.onload = () => {
  const c = document.getElementById('c').getContext('2d');
  c.imageSmoothingEnabled = false;
  c.fillStyle = '#202';
  c.fillRect(0,0,${W},${H});
  c.drawImage(img, 0, 0, ${cols*16}, ${rows*16}, 0, 0, ${cols*16*scale}, ${rows*16*scale});
  c.strokeStyle = 'rgba(0,255,255,0.4)';
  c.font = 'bold 11px monospace';
  c.fillStyle = '#0ff';
  for (let r=0; r<${rows}; r++) {
    for (let cc=0; cc<${cols}; cc++) {
      const x = cc*16*${scale}, y = r*16*${scale};
      c.strokeRect(x, y, 16*${scale}, 16*${scale});
      c.fillText(String(r*${cols}+cc), x+2, y+12);
    }
  }
  document.body.dataset.done = '1';
};
img.src = "http://localhost:3000/assets/${file}";
</script>`;
await page.setContent(html, { waitUntil: "load" });
await page.waitForFunction(() => document.body.dataset.done === "1", { timeout: 10000 });
const out = `/tmp/shots/inspect-${file.replace(/\W+/g,'_')}.png`;
await page.screenshot({ path: out, omitBackground: false });
await browser.close();
console.log("Saved", out);
