#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const {
  url,
  startDateTime,
  endDateTime,
  interval,
  maxConcurrentBrowsers,
  deletePNGs,
  height,
  width,
  gifQuality,
  waitFor,
  waitForSelector,
} = yargs(hideBin(process.argv))
  .option('url', {
    describe: 'URL of the art generator',
    type: 'string',
    // eslint-disable-next-line max-len
    default: 'https://generator.artblocks.io/0x99a9b7c1116f9ceeb1652de04d5969cce509b069/476000025',
  })
  .option('startDateTime', {
    describe: 'Start date and time in ISO format',
    type: 'string',
    default: '2023-11-02T00:00:00Z',
  })
  .option('endDateTime', {
    describe: 'End date and time in ISO format',
    type: 'string',
    default: '2023-11-15T00:00:00Z',
  })
  .option('interval', {
    describe: 'Interval between screenshots in seconds',
    type: 'number',
    default: 86400,
  })
  .option('maxConcurrentBrowsers', {
    describe: 'Maximum number of concurrent browser instances',
    type: 'number',
    default: 5,
  })
  .option('deletePNGs', {
    describe: 'Delete PNG files after creating the GIF',
    type: 'boolean',
    default: true,
  })
  .option('height', {
    describe: 'Height of the browser window in pixels',
    type: 'number',
    default: 1003,
  })
  .option('width', {
    describe: 'Width of the browser window in pixels',
    type: 'number',
    default: 1337,
  })
  .option('gifQuality', {
    describe: 'Quality of the generated GIF (1-20). 1 is the highest quality',
    type: 'number',
    default: 5,
  })
  .option('waitFor', {
    // eslint-disable-next-line max-len
    describe: 'type of event to wait for. Options: function, selector, or empty string for immediate screenshot after network idle',
    type: 'string',
    default: 'function',
  })
  .option('waitForSelector', {
    describe: 'selector to wait for before generating screenshot. Must be set if waitFor is selector',
    type: 'string',
    default: 'canvas',
  })
  .help()
  .alias('help', 'h')
  .argv;

const { takeScreenshotWhenRendered } = require('./src/browser');
const { generateDateArray } = require('./src/dates');
const { processInBatches } = require('./src/batchProcessor');
const { createGifFromPngs } = require('./src/gifCreator');

// Create a new directory for each execution
const dirName = `render_${Date.now()}`;
const dirPath = path.join(__dirname, dirName);
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath);
}

const datetimes = generateDateArray(startDateTime, endDateTime, interval);
const tasks = datetimes
  .map((datetime, index) => () => takeScreenshotWhenRendered(
    url,
    datetime,
    dirPath,
    index + 1,
    width,
    height,
    waitFor,
    waitForSelector,
  ));

// After all batches are processed
processInBatches(tasks, maxConcurrentBrowsers).then(() => {
  console.log('All tasks completed. Creating GIF...');

  // Path where the GIF will be saved
  const gifPath = path.join(dirPath, 'output.gif');
  createGifFromPngs(dirPath, gifPath, width, height, gifQuality, deletePNGs);
});
