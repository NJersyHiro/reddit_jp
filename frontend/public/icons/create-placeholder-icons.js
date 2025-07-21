const fs = require('fs');
const path = require('path');

// Base64 encoded 1x1 red pixel PNG
const redPixelPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
  'base64'
);

// Icon sizes needed
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname);
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create placeholder icons
sizes.forEach(size => {
  const filename = path.join(iconsDir, `icon-${size}x${size}.png`);
  fs.writeFileSync(filename, redPixelPng);
  console.log(`Created ${filename}`);
});

// Also create favicon.ico as a copy of the smallest icon
const faviconPath = path.join(__dirname, '..', 'favicon.ico');
fs.writeFileSync(faviconPath, redPixelPng);
console.log(`Created ${faviconPath}`);

console.log('All placeholder icons created successfully!');