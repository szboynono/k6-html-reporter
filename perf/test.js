const reporter = require('../dist/index.js');

const options = {
  jsonFile: 'perf/export.json',
  output: 'perf/',
}
reporter.generateSummaryReport(options);