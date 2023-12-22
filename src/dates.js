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

module.exports = { generateDateArray };
