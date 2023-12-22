const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const GIFEncoder = require('gifencoder');
const PNG = require('png-js');

// TODO: mess with frame sizing to generate most clear image (see if there's a way to ensure high quality image)
// TODO: make this an executable file with params to control startDate, endDate, interval, and possibly concurrent page loads

async function takeScreenshotWhenRendered(url, datetime, dirPath, imageName) {
    console.log(imageName);
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: false, // set to true in production
    });
    const page = await browser.newPage();

    await page.evaluateOnNewDocument((datetime) => {
        const OriginalDate = Date;
        Date = class extends OriginalDate {
            constructor(...args) {
                if (args.length === 0) {
                    super(datetime);
                } else {
                    super(...args);
                }
            }

            static now() {
                return new OriginalDate(datetime).getTime();
            }
        };
    }, datetime);

    // Navigate to the page first
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Inject a script to override console.log and set a flag
    await page.evaluate(() => {
        window.renderingDone = false;
        const originalLog = console.log;
        console.log = function (...args) {
            if (args[0].includes('done rendering')) {
                window.renderingDone = true;
            }
            originalLog.apply(console, args);
        };
    });

    // Listen for the flag to be set
    await page.waitForFunction(() => window.renderingDone, { timeout: 0 });

    // Take a screenshot after the rendering is done
    console.log('Rendering complete. Taking screenshot...');
    const screenshotPath = path.join(dirPath, imageName + '.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('Screenshot taken. Closing browser.');
    await browser.close();
}

function generateDateArray(startDate, endDate, intervalSeconds) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let current = new Date(start);
    const dates = [];

    while (current <= end) {
        dates.push(current.toISOString());
        current = new Date(current.getTime() + intervalSeconds * 1000);
    }

    return dates;
}

async function processInBatches(tasks, batchSize) {
    for (let i = 0; i < tasks.length; i += batchSize) {
        const batch = tasks.slice(i, i + batchSize);
        console.log(`Processing batch: ${i / batchSize + 1}`);
        await Promise.all(batch.map(task => task()));
    }
}

// Create a new directory for each execution
const dirName = `render_${Date.now()}`;
const dirPath = path.join(__dirname, dirName);
if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
}

const url = 'https://generator.artblocks.io/0x99a9b7c1116f9ceeb1652de04d5969cce509b069/476000025';
const startDateTime = '2023-11-02T00:00:00Z';
const endDateTime = '2023-11-10T00:00:00Z';
const interval = 86400; // one day in seconds
const maxConcurrentBrowsers = 5;

const datetimes = generateDateArray(startDateTime, endDateTime, interval);
const tasks = datetimes.map((datetime, index) => () => takeScreenshotWhenRendered(url, datetime, dirPath, index + 1));

function decodePNG(filePath) {
    return new Promise((resolve, reject) => {
        const png = new PNG(fs.readFileSync(filePath));
        png.decode(pixels => {
            resolve(pixels);
        });
    });
}

async function createGifFromPngs(dirPath, outputFilePath) {
    const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.png'));
    files.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

    const encoder = new GIFEncoder(800, 600); // Adjust to match PNG dimensions
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

    // Delete the PNG files
    for (const file of files) {
        const filePath = path.join(dirPath, file);
        fs.unlinkSync(filePath);
        console.log('Deleted file:', filePath);
    }
}

// After all batches are processed
processInBatches(tasks, maxConcurrentBrowsers).then(() => {
    console.log('All tasks completed. Creating GIF...');

    // Path where the GIF will be saved
    const gifPath = path.join(dirPath, 'output.gif');
    createGifFromPngs(dirPath, gifPath);
});