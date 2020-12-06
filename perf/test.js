const reporter = require('../dist/index.js');

const options = {
  jsonFile: './export.json',
  output: './',
}
reporter.generateSummaryReport(options);