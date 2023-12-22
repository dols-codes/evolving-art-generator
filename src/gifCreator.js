const GIFEncoder = require('gifencoder');
const PNG = require('png-js');
const fs = require('fs');
const path = require('path');
const config = require('../config/default.json');

function decodePNG(filePath) {
    return new Promise((resolve, reject) => {
        const png = new PNG(fs.readFileSync(filePath));
        png.decode(pixels => {
            resolve(pixels);
        });
    });
}

function deletePNGs(files, dirPath) {
    for (const file of files) {
        const filePath = path.join(dirPath, file);
        fs.unlinkSync(filePath);
        console.log('Deleted file:', filePath);
    }
}

async function createGifFromPngs(dirPath, outputFilePath) {
    const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.png'));
    files.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

    const encoder = new GIFEncoder(config.width, config.height);
    encoder.createReadStream().pipe(fs.createWriteStream(outputFilePath));

    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(500);
    encoder.setQuality(10);

    for (const file of files) {
        const filePath = path.join(dirPath, file);
        console.log('Processing file:', filePath);

        const pixels = await decodePNG(filePath);
        encoder.addFrame(pixels);
    }

    encoder.finish();
    console.log('GIF created at:', outputFilePath);

    if (config.deletePNGs) {
        deletePNGs(files, dirPath);
    }
}

module.exports = { createGifFromPngs };