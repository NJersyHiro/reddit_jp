const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Icon sizes needed
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname);

// Function to create a simple icon
function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Fill background with brand color
  ctx.fillStyle = '#DC2626';
  ctx.fillRect(0, 0, size, size);
  
  // Add white text
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.6}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('い', size / 2, size / 2);
  
  return canvas.toBuffer('image/png');
}

// Create icons
sizes.forEach(size => {
  try {
    const filename = path.join(iconsDir, `icon-${size}x${size}.png`);
    const buffer = createIcon(size);
    fs.writeFileSync(filename, buffer);
    console.log(`Created ${filename}`);
  } catch (err) {
    console.error(`Failed to create ${size}x${size} icon:`, err.message);
  }
});

console.log('Icon generation complete!');