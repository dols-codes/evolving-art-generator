/* eslint-disable no-undef */
const puppeteer = require('puppeteer');
const path = require('path');

async function takeScreenshotWhenRendered(
  url,
  datetime,
  dirPath,
  imageName,
  width,
  height,
  waitFor,
  waitForSelector,
  waitForTime,
) {
  console.log(imageName);
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: 'new', // set to false to open each browser for debugging
  });
  const page = await browser.newPage();

  await page.setViewport({
    width,
    height,
    deviceScaleFactor: 1,
  });

  await page.evaluateOnNewDocument((browserDatetime) => {
    const OriginalDate = Date;
    // eslint-disable-next-line no-global-assign
    Date = class extends OriginalDate {
      constructor(...args) {
        if (args.length === 0) {
          super(browserDatetime);
        } else {
          super(...args);
        }
      }

      static now() {
        return new OriginalDate(browserDatetime).getTime();
      }
    };
  }, datetime);

  // Navigate to the page first
  await page.goto(url, { waitUntil: 'networkidle0' });

  // Inject a script to override console.log and set a flag
  await page.evaluate(() => {
    window.renderingDone = false;
    const originalLog = console.log;
    // eslint-disable-next-line func-names
    console.log = function (...args) {
      if (args[0].includes('done rendering')) {
        window.renderingDone = true;
      }
      originalLog.apply(console, args);
    };
  });

  if (waitFor === 'function') {
    await page.waitForFunction(() => window.renderingDone, { timeout: 0 });
  } else if (waitFor === 'selector') {
    await page.waitForSelector(waitForSelector);
  } else if (waitFor === 'time') {
    await new Promise((r) => { setTimeout(r, waitForTime * 1000); });
  }

  // Take a screenshot after the rendering is done
  console.log('Rendering complete. Taking screenshot...');
  const screenshotPath = path.join(dirPath, `${imageName}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log('Screenshot taken. Closing browser.');
  await browser.close();
}

module.exports = { takeScreenshotWhenRendered };
