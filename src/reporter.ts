import fs from 'fs';
import path from 'path';
import ejs from 'ejs';

export function generate(options: Options) {
  const resolvedInputPath = path.resolve(process.cwd(), options.jsonFile);
  const resolvedOutputPath = path.resolve(process.cwd(), options.output);
  const jsonReport = readJsonReport(resolvedInputPath);
  writeHtmlReport(jsonReport, resolvedOutputPath);
}



function readJsonReport(filePath: string): JSON {
  const resolvedPath = path.resolve(__dirname, filePath);
  const rawData = fs.readFileSync(resolvedPath);
  return JSON.parse(rawData.toString());
}

function writeHtmlReport(content: JSON, filePath: string): void {
  const templatePath = path.resolve(__dirname, '../templates/template.ejs');
  const groups = content["root_group"]["groups"];

  ejs.renderFile(templatePath, { groups: groups }, {}, function (err, str) {
    if (err) {
      console.error(err);
    }


    let html = ejs.render(str);
    fs.writeFile(`${filePath}/report.html`, html, function (err) {
      if (err) throw err;
      console.log(`Report is created at ${filePath}`);
    });
  });
}