const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const toIco = require('to-ico');

async function createFavicon(svgPath, outputName, sizes = [16, 32, 48, 64]) {
  try {
    console.log(`Processing ${svgPath}...`);
    const svgBuffer = fs.readFileSync(svgPath);
    
    // Create PNG files for different sizes
    const pngBuffers = [];
    
    for (const size of sizes) {
      console.log(`Creating ${size}x${size} PNG...`);
      const pngBuffer = await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toBuffer();
      
      pngBuffers.push(pngBuffer);
      
      // Save individual PNG files
      fs.writeFileSync(
        path.join(__dirname, `../public/${outputName}-${size}.png`), 
        pngBuffer
      );
    }
    
    // Convert PNGs to ICO
    console.log(`Creating ${outputName}.ico...`);
    const icoBuffer = await toIco(pngBuffers);
    
    // Write the ICO file
    fs.writeFileSync(
      path.join(__dirname, `../public/${outputName}.ico`), 
      icoBuffer
    );
    
    return true;
  } catch (error) {
    console.error(`Error creating ${outputName}:`, error);
    return false;
  }
}

async function createDualFavicons() {
  // Create light mode favicon (colored logo)
  await createFavicon(
    path.join(__dirname, '../public/logo.svg'),
    'favicon-light'
  );
  
  // Create dark mode favicon (white logo)
  await createFavicon(
    path.join(__dirname, '../public/logo_white.svg'),
    'favicon-dark'
  );
  
  // Also create the default favicon.ico (same as light mode)
  fs.copyFileSync(
    path.join(__dirname, '../public/favicon-light.ico'),
    path.join(__dirname, '../public/favicon.ico')
  );
  
  console.log('All favicons created successfully!');
}

createDualFavicons();
