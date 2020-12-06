const reporter = require('../dist/index');

reporter.generateSummaryReport({
  jsonFile: './export.json',
  output: '.'
})