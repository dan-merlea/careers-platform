const fs = require('fs');
const path = require('path');
const toIco = require('to-ico');

async function convertPngToIco() {
  try {
    console.log('Reading PNG files...');
    
    // Read the PNG files we created earlier
    const png16 = fs.readFileSync(path.join(__dirname, '../public/favicon-16.png'));
    const png32 = fs.readFileSync(path.join(__dirname, '../public/favicon-32.png'));
    const png48 = fs.readFileSync(path.join(__dirname, '../public/favicon-48.png'));
    
    console.log('Converting PNGs to ICO...');
    // Convert PNGs to ICO
    const icoBuffer = await toIco([png16, png32, png48]);
    
    // Write the ICO file
    fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), icoBuffer);
    
    console.log('Successfully created favicon.ico!');
    return true;
  } catch (error) {
    console.error('Error converting PNGs to ICO:', error);
    return false;
  }
}

// Run the conversion
convertPngToIco();
