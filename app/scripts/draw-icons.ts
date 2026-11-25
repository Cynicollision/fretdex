// Draws the app's PNG icons from static/icon.svg in Playwright's Chromium: `node app/scripts/draw-icons.ts` from the
// repository root, after changing the SVG. The PNGs are committed.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const staticDir = path.resolve(import.meta.dirname, '../static');
const svg = await readFile(path.join(staticDir, 'icon.svg'), 'utf8');
const sizes = { 'apple-touch-icon-180x180.png': 180, 'pwa-192x192.png': 192, 'pwa-512x512.png': 512 };

const browser = await chromium.launch();
try {
    for (const [file, size] of Object.entries(sizes)) {
        const page = await browser.newPage({ viewport: { width: size, height: size } });
        await page.setContent(
            `<style>html,body{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`
        );
        await page.screenshot({ path: path.join(staticDir, file), omitBackground: false });
        await page.close();
    }
} finally {
    await browser.close();
}
