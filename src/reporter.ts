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
  const template = `
  <!DOCTYPE html> 
  <html> 
  <head> 
      <title>K6 Summary Report</title> 
      <style type="text/css" media="screen"> 
          body { 
              background-color: skyblue; 
              text-decoration-color: white; 
              font-size:7em;  
          } 
      </style> 
  </head> 
  <body> 
      <center> 
          This is our home page.<br/> 
          <%= people.join(", "); %>
          <%= jsonReport%>
      </center> 
  </body> 
  </html>`

  let ejs = require('ejs');
  let people = ['geddy', 'neil', 'alex'];
  let html = ejs.render(template, { people: people, jsonReport: JSON.stringify(content) });
  fs.writeFile(`${filePath}/report.html`, html, function (err) {
    if (err) throw err;
    console.log(`Report is created at ${filePath}`);
  });
}