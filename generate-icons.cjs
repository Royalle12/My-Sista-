const { createCanvas } = require('canvas');
const fs = require('fs');

function createIcon(size, outputPath) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#6B3FA0';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${size * 0.35}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('MS', size / 2, size / 2);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`Created ${outputPath}`);
}

fs.mkdirSync('public/icons', { recursive: true });
createIcon(192, 'public/icons/icon-192x192.png');
createIcon(512, 'public/icons/icon-512x512.png');