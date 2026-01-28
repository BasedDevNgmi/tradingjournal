#!/usr/bin/env node
/**
 * Generates PWA icons (192x192 and 512x512) from scripts/icon-source.svg
 * into public/icons/. Run: node scripts/generate-pwa-icons.mjs
 */
import sharp from "sharp";
import { readFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const sourcePath = join(root, "scripts", "icon-source.svg");
const outDir = join(root, "public", "icons");

if (!existsSync(sourcePath)) {
  console.error("Missing scripts/icon-source.svg");
  process.exit(1);
}

const svg = readFileSync(sourcePath);

mkdirSync(outDir, { recursive: true });

async function generate() {
  await sharp(svg)
    .resize(192, 192)
    .png()
    .toFile(join(outDir, "icon-192x192.png"));
  await sharp(svg)
    .resize(512, 512)
    .png()
    .toFile(join(outDir, "icon-512x512.png"));
  console.log("Generated public/icons/icon-192x192.png and icon-512x512.png");
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
