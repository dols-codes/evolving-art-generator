const puppeteer = require('puppeteer');

const url = 'https://generator.artblocks.io/0x99a9b7c1116f9ceeb1652de04d5969cce509b069/476000025';

async function takeScreenshotWhenRendered(url) {
  console.log('Opening URL: ' + url);
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: false, // set to true in production
  });
  const page = await browser.newPage();

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
  await page.screenshot({ path: 'rendered_page.png', fullPage: true });
  console.log('Screenshot taken. Closing browser.');
  await browser.close();
}

takeScreenshotWhenRendered(url);
