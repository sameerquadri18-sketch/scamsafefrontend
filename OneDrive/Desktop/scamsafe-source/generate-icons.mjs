import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.join('public', 'favicon.svg');
const svg = fs.readFileSync(svgPath);

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

for (const { name, size } of sizes) {
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(path.join('public', name));
  console.log(`Generated ${name} (${size}x${size})`);
}

console.log('All icons generated!');
