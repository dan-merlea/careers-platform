const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { convert } = require('convert-svg-to-png');
const toIco = require('to-ico');

async function convertSvgToIco(svgPath, outputPath, sizes = [16, 32, 48, 64]) {
  try {
    console.log(`Converting ${svgPath} to ICO...`);
    
    // First convert SVG to PNG with transparent background
    const pngBuffer = await convert(fs.readFileSync(svgPath, 'utf8'), {
      width: Math.max(...sizes),
      height: Math.max(...sizes)
    });
    
    // Create different size PNGs for the ICO
    const pngBuffers = await Promise.all(
      sizes.map(size => 
        sharp(pngBuffer)
          .resize(size, size)
          .toBuffer()
      )
    );
    
    // Convert PNGs to ICO
    const icoBuffer = await toIco(pngBuffers);
    
    // Write the ICO file
    fs.writeFileSync(outputPath, icoBuffer);
    
    console.log(`Successfully created ${outputPath}`);
    return true;
  } catch (error) {
    console.error('Error converting SVG to ICO:', error);
    return false;
  }
}

// Define paths
const svgPath = path.join(__dirname, '../public/logo_white.svg');
const icoPath = path.join(__dirname, '../public/favicon.ico');

// Run the conversion
convertSvgToIco(svgPath, icoPath)
  .then(success => {
    if (success) {
      console.log('Conversion completed successfully!');
    } else {
      console.log('Conversion failed.');
    }
  });
