/**
 * Gera splash screens iOS para o PWA The Grinders.
 * Execução: node scripts/generate-splash.mjs
 *
 * Requisito: sharp (já incluído pelo Next.js)
 * Ícone fonte: public/icons/icon-512x512.png
 * Saída: public/splash/splash-{W}x{H}.png
 */

import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const BG_COLOR = { r: 10, g: 10, b: 10, alpha: 1 }; // #0a0a0a

// Dispositivos iOS mais comuns (portrait, pixels físicos)
const DEVICES = [
  { name: 'iPhone SE',              w: 640,  h: 1136 },
  { name: 'iPhone 8/SE2',           w: 750,  h: 1334 },
  { name: 'iPhone 8 Plus',          w: 1242, h: 2208 },
  { name: 'iPhone X/XS/11 Pro',     w: 1125, h: 2436 },
  { name: 'iPhone XS Max/11 Pro Max',w: 1242, h: 2688 },
  { name: 'iPhone XR/11',           w: 828,  h: 1792 },
  { name: 'iPhone 12 mini/13 mini', w: 1080, h: 2340 },
  { name: 'iPhone 12/13/14',        w: 1170, h: 2532 },
  { name: 'iPhone 12/13 Max/14 Plus',w: 1284, h: 2778 },
  { name: 'iPhone 14 Pro',          w: 1179, h: 2556 },
  { name: 'iPhone 14/15 Pro Max',   w: 1290, h: 2796 },
  { name: 'iPad mini 6',            w: 1488, h: 2266 },
  { name: 'iPad Air/Pro 11"',       w: 1668, h: 2388 },
  { name: 'iPad Pro 12.9"',         w: 2048, h: 2732 },
];

const iconSrc = join(root, 'public', 'icons', 'icon-512x512.png');
const outDir  = join(root, 'public', 'splash');
mkdirSync(outDir, { recursive: true });

async function generate() {
  for (const device of DEVICES) {
    const { w, h } = device;
    const iconSize = Math.round(h * 0.22); // ícone ≈ 22% da altura

    // Redimensiona o ícone
    const icon = await sharp(iconSrc)
      .resize(iconSize, iconSize)
      .toBuffer();

    const left = Math.round((w - iconSize) / 2);
    const top  = Math.round((h - iconSize) / 2);

    const outFile = join(outDir, `splash-${w}x${h}.png`);
    await sharp({
      create: { width: w, height: h, channels: 4, background: BG_COLOR },
    })
      .composite([{ input: icon, left, top }])
      .png()
      .toFile(outFile);

    console.log(`✓ ${device.name.padEnd(28)} → splash-${w}x${h}.png`);
  }
  console.log('\nSplash screens geradas em public/splash/');
}

generate().catch(err => { console.error(err); process.exit(1); });
