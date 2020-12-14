import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import { Options } from './types';

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
  const checkRootGroupData = content["root_group"];
  const metricsData = content["metrics"];

  const { checkMetric, countMetrics, timeMetrics, vusMetrics, allThresholds, metricThresholdsPassed, failedThresholdsNum } = mapMetrics(metricsData);

  const checks = getChecks(checkRootGroupData).map((data) => {
    const splitedPath = data.path.split('::');
    splitedPath.shift();

    return {
      ...data,
      pathArray: splitedPath.join(" \u21C0 ")
    }
  });

  ejs.renderFile(templatePath, { checks, checkMetric, countMetrics, timeMetrics, vusMetrics, allThresholds, metricThresholdsPassed, failedThresholdsNum }, {}, function (err, str) {
    if (err) {
      console.error(err);
    }

    let html = ejs.render(str);
    fs.writeFileSync(`${filePath}/report.html`, html);
    console.log(`Report is created at ${filePath}`);
  });
}

function mapMetrics(data: Object) {
  let checkMetric = {};
  const countMetrics = [];
  const timeMetrics = [];
  const vusMetrics = [];
  const allThresholds = [];
  let metricThresholdsPassed = true;
  let failedThresholdsNum = 0;

  Object.entries(data).forEach(
    ([key, value]) => {
      if (Object.keys(value).includes('count')) {
        const thresholdFailed = thresholdResult(value.thresholds)
        if (thresholdFailed === true) {
          failedThresholdsNum++;
          metricThresholdsPassed = false
        }
        countMetrics.push({
          name: key,
          ...value,
          thresholdFailed
        });
        if (Object.keys(value).includes('thresholds')) {
          allThresholds.push({
            name: key,
            thresholds: value.thresholds
          });
        }
      } else if (Object.keys(value).includes('avg')) {
        const thresholdFailed = thresholdResult(value.thresholds)
        if (thresholdFailed === true) {
          failedThresholdsNum++;
          metricThresholdsPassed = false
        }
        timeMetrics.push({
          name: key,
          ...value,
          thresholdFailed
        });
        if (Object.keys(value).includes('thresholds')) {
          allThresholds.push({
            name: key,
            thresholds: value.thresholds
          });
        }
      } else if (Object.keys(value).includes('passes')) {
        const thresholdFailed = thresholdResult(value.thresholds)
        if (thresholdFailed === true) {
          failedThresholdsNum++;
        }
        checkMetric = {
          name: key,
          ...value,
          thresholdFailed
        }
        if (Object.keys(value).includes('thresholds')) {
          allThresholds.push({
            name: key,
            thresholds: value.thresholds
          });
        }
      } else if (key.includes('vus')) {
        const thresholdFailed = thresholdResult(value.thresholds)
        if (thresholdFailed === true) {
          failedThresholdsNum++;
          metricThresholdsPassed = false
        }
        vusMetrics.push({
          name: key,
          ...value,
          thresholdFailed
        });
        if (Object.keys(value).includes('thresholds')) {
          allThresholds.push({
            name: key,
            thresholds: value.thresholds
          });
        }
      }
    }
  );
  return { checkMetric, countMetrics, timeMetrics, vusMetrics, allThresholds, metricThresholdsPassed, failedThresholdsNum }
}

function thresholdResult(thresholds: Object | undefined): boolean | undefined {
  if (thresholds) {
    return Object.values(thresholds).some(value => value === true);
  }
}

function getChecks(data: any) {
  const checksOutput = [];
  findChecksRecursively(data);

  function findChecksRecursively(data) {
    if (data.groups.length === 0) {
      return;
    }

    if (Object.keys(data.checks).length > 0) {
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
