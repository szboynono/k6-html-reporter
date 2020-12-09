import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import { group } from 'console';

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
  const data = content["root_group"];
  
  const proccessedChecks = getChecks(data).map((data) => {
    const splitedArr = data.path.split("::");
    return {
      ...data,
      pathArray: splitedArr
    }
  });
  

  ejs.renderFile(templatePath, { checks: proccessedChecks }, {}, function (err, str) {
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


function getChecks(data: any) {

  const checksOutput = [];
  findChecksRecursively(data);
  
  function findChecksRecursively(data) {
    if (data.groups.length === 0) {
      return;
    }
    
    if(Object.keys(data.checks).length > 0) {
      Object.values(data.checks).forEach((value) => {
        checksOutput.push(value);
      })
    }
 
    for (let item in data.groups) {
      findChecksRecursively(data.groups[item]);
    }
  }

  return checksOutput;
}
