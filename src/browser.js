const puppeteer = require('puppeteer');
const path = require('path');

async function takeScreenshotWhenRendered(url, datetime, dirPath, imageName) {
    console.log(imageName);
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: 'new', // set to false to open each browser for debugging
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

module.exports = { takeScreenshotWhenRendered };
