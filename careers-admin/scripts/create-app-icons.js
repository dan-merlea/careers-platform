const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function createAppIcons() {
  try {
    const svgPath = path.join(__dirname, '../public/logo_white.svg');
    const svgBuffer = fs.readFileSync(svgPath);
    
    console.log('Creating app icons from SVG...');
    
    // Create PNG files for different sizes
    const sizes = [192, 512];
    
    for (const size of sizes) {
      console.log(`Creating ${size}x${size} PNG...`);
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(__dirname, `../public/logo${size}.png`));
    }
    
    console.log('App icons created successfully!');
  } catch (error) {
    console.error('Error creating app icons:', error);
  }
}

createAppIcons();
