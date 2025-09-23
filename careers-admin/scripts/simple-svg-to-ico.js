const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function convertSvgToIco() {
  try {
    const svgPath = path.join(__dirname, '../public/logo.svg');
    const pngPath = path.join(__dirname, '../public/favicon.png');
    const icoPath = path.join(__dirname, '../public/favicon.ico');
    
    console.log('Reading SVG file...');
    const svgBuffer = fs.readFileSync(svgPath);
    
    console.log('Converting SVG to PNG...');
    // Convert SVG to PNG with transparent background
    await sharp(svgBuffer)
      .resize(256, 256)
      .png()
      .toFile(pngPath);
    
    console.log('Converting PNG to ICO...');
    // Convert PNG to ICO (multiple sizes)
    const pngBuffer = fs.readFileSync(pngPath);
    
    // Create different sizes
    const sizes = [16, 32, 48, 64];
    const promises = sizes.map(size => {
      const outputPath = path.join(__dirname, `../public/favicon-${size}.png`);
      return sharp(pngBuffer)
        .resize(size, size)
        .toFile(outputPath);
    });
    
    await Promise.all(promises);
    
    console.log('Favicon files created successfully!');
    console.log('You can now use the favicon.png file as your favicon.');
    console.log('For ICO format, you may need to use an online converter or another tool.');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

convertSvgToIco();
