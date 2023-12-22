const GIFEncoder = require('gifencoder');
const PNG = require('png-js');
const fs = require('fs');
const path = require('path');

function decodePNG(filePath) {
  return new Promise((resolve) => {
    const png = new PNG(fs.readFileSync(filePath));
    png.decode((pixels) => {
      resolve(pixels);
    });
  });
}

function removePNGs(files, dirPath) {
  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    fs.unlinkSync(filePath);
    console.log('Deleted file:', filePath);
  });
}

async function createGifFromPngs(dirPath, outputFilePath, width, height, gifQuality, deletePNGs) {
  const files = fs.readdirSync(dirPath).filter((file) => file.endsWith('.png'));
  files.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  const encoder = new GIFEncoder(width, height);
  encoder.createReadStream().pipe(fs.createWriteStream(outputFilePath));

  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(500);
  encoder.setQuality(gifQuality);

  // eslint-disable-next-line no-restricted-syntax
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    console.log('Processing file:', filePath);

    // eslint-disable-next-line no-await-in-loop
    const pixels = await decodePNG(filePath);
    encoder.addFrame(pixels);
  }

  encoder.finish();
  console.log('GIF created at:', outputFilePath);

  if (deletePNGs) {
    removePNGs(files, dirPath);
  }
}

module.exports = { createGifFromPngs };
