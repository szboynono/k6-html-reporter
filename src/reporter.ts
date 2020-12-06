import fs from 'fs';

export function generate(options: Options) {
  const jsonReport = readJsonReport(options.jsonFile);
  writeHtmlReport(jsonReport, options.output);
}

function readJsonReport(path: string): JSON {
  const rawData = fs.readFileSync(path);
  return JSON.parse(rawData.toString());
}

function writeHtmlReport(content: JSON, path: string) {
  fs.writeFile(`${path}/report.json`, JSON.stringify(content), function (err) {
    if (err) throw err;
    console.log('Saved!');
  });
}