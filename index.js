#!/usr/bin/env node

const { takeScreenshotWhenRendered } = require('./src/browser');
const { generateDateArray } = require('./src/dates');
const { processInBatches } = require('./src/batchProcessor');
const { createGifFromPngs } = require('./src/gifCreator');
const config = require('./config/default.json');

const fs = require('fs');
const path = require('path');

// TODO: make this an executable file with params to control config settings

// Create a new directory for each execution
const dirName = `render_${Date.now()}`;
const dirPath = path.join(__dirname, dirName);
if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
}

const datetimes = generateDateArray(config.startDateTime, config.endDateTime, config.interval);
const tasks = datetimes.map((datetime, index) => () => takeScreenshotWhenRendered(config.url, datetime, dirPath, index + 1));

// After all batches are processed
processInBatches(tasks, config.maxConcurrentBrowsers).then(() => {
    console.log('All tasks completed. Creating GIF...');

    // Path where the GIF will be saved
    const gifPath = path.join(dirPath, 'output.gif');
    createGifFromPngs(dirPath, gifPath);
});