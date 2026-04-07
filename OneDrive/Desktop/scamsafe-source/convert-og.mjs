import sharp from 'sharp';
import { readFileSync } from 'fs';

const svg = readFileSync('./og-source.svg');
await sharp(svg, { density: 150 })
  .resize(1200, 630)
  .png()
  .toFile('./public/og-image.png');

console.log('Created public/og-image.png');
