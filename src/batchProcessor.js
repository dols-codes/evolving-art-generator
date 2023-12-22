async function processInBatches(tasks, batchSize) {
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    console.log(`Processing batch: ${i / batchSize + 1}`);

    // eslint-disable-next-line no-await-in-loop
    await Promise.all(batch.map((task) => task()));
  }
}

module.exports = { processInBatches };
