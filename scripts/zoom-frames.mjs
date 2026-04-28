// Zoom in on a particular range of frames from a sheet.
// Usage: node scripts/zoom-frames.mjs <file> <cols-in-sheet> <startFrame> <endFrame>
import puppeteer from "puppeteer";

const file       = process.argv[2];
const sheetCols  = Number(process.argv[3]);
const startF     = Number(process.argv[4]);
const endF       = Number(process.argv[5]);
const SCALE      = 8;

// Show frames in their natural grid layout (so multi-tile sprites read).
const minCol = startF % sheetCols;
const minRow = Math.floor(startF / sheetCols);
const maxCol = endF % sheetCols;
const maxRow = Math.floor(endF / sheetCols);
const colSpan = sheetCols;             // full width
const rowSpan = maxRow - minRow + 1;
const W = colSpan * 16 * SCALE;
const H = rowSpan * 16 * SCALE + 20;

const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });

const html = `<!doctype html>
<style>body{margin:0;background:#202;color:#fff;font:bold 12px monospace}
canvas{image-rendering:pixelated;display:block}</style>
<canvas id=c width=${W} height=${H}></canvas>
<script>
const img = new Image();
img.onload = () => {
  const c = document.getElementById('c').getContext('2d');
  c.imageSmoothingEnabled = false;
  c.fillStyle = '#202';
  c.fillRect(0,0,${W},${H});
  c.drawImage(img, 0, ${minRow*16}, ${colSpan*16}, ${rowSpan*16}, 0, 0, ${W}, ${rowSpan*16*SCALE});
  c.strokeStyle = 'rgba(0,255,255,0.5)';
  c.fillStyle = '#0ff';
  for (let r=0; r<${rowSpan}; r++) {
    for (let cc=0; cc<${colSpan}; cc++) {
      const x = cc*16*${SCALE}, y = r*16*${SCALE};
      const f = (${minRow}+r)*${sheetCols}+cc;
      c.strokeRect(x, y, 16*${SCALE}, 16*${SCALE});
      c.fillText(String(f), x+3, y+13);
    }
  }
  document.body.dataset.done = '1';
};
img.src = "http://localhost:3000/assets/${file}";
</script>`;
await page.setContent(html, { waitUntil: "load" });
await page.waitForFunction(() => document.body.dataset.done === "1", { timeout: 10000 });
const out = `/tmp/shots/zoom-${file.replace(/\W+/g,'_')}-${startF}-${endF}.png`;
await page.screenshot({ path: out });
await browser.close();
console.log("Saved", out);
