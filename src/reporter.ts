import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import { Options } from './types';
import { fail } from 'assert';

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

  const { checkMetric, countMetrics, timeMetrics, vusMetrics, allThresholds, metricThresholdsPassed, totalThresholdResult } = mapMetrics(metricsData);

  const checks = getChecks(checkRootGroupData).map((data) => {
    const splitedPath = data.path.split('::');
    splitedPath.shift();

    return {
      ...data,
      pathArray: splitedPath.join(" \u21C0 ")
    }
  });

  ejs.renderFile(templatePath, { checks, checkMetric, countMetrics, timeMetrics, vusMetrics, allThresholds, metricThresholdsPassed, totalThresholdResult }, {}, function (err, str) {
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

  let totalThresholdResult = {
    passes: 0,
    fails: 0,
    failedMetricsNum: 0
  }

  Object.entries(data).forEach(
    ([key, value]) => {
      const metric = {
        name: key,
        ...value,
        thresholdFailed: undefined
      };

      if (Object.keys(value).includes('count')) {
        if(value.thresholds) {
          const [passes, fails] = thresholdResult(value.thresholds);
          if (fails > 0) {
            totalThresholdResult.failedMetricsNum++;
            metricThresholdsPassed = false
          }
          totalThresholdResult.passes += passes;
          totalThresholdResult.fails += fails;
          metric.thresholdFailed = fails > 0;
          allThresholds.push({
            name: key,
            thresholds: value.thresholds
          });
        }
        countMetrics.push(metric);
      } else if (Object.keys(value).includes('avg')) {
        if(value.thresholds) {
          const [passes, fails] = thresholdResult(value.thresholds);
          if (fails > 0) {
            totalThresholdResult.failedMetricsNum++;
            metricThresholdsPassed = false
          }
          totalThresholdResult.passes += passes;
          totalThresholdResult.fails += fails;
          metric.thresholdFailed = fails > 0;
          allThresholds.push({
            name: key,
            thresholds: value.thresholds
          });
        }
        timeMetrics.push(metric);
      } else if (Object.keys(value).includes('passes')) {
        if(value.thresholds) {
          const [passes, fails] = thresholdResult(value.thresholds);
          if (fails > 0) {
            totalThresholdResult.failedMetricsNum++;
          }
          totalThresholdResult.passes += passes;
          totalThresholdResult.fails += fails;
          metric.thresholdFailed = fails > 0;
          allThresholds.push({
            name: key,
            thresholds: value.thresholds
          });
        }
        checkMetric = metric;
      } else if (key.includes('vus')) {
        if(value.thresholds) {
          const [passes, fails] = thresholdResult(value.thresholds);
          if (fails > 0) {
            totalThresholdResult.failedMetricsNum++;
            metricThresholdsPassed = false
          }
          totalThresholdResult.passes += passes;
          totalThresholdResult.fails += fails;
          metric.thresholdFailed = fails > 0;
          allThresholds.push({
            name: key,
            thresholds: value.thresholds
          });
        }
        vusMetrics.push(metric);
      }
    }
  );
  return { checkMetric, countMetrics, timeMetrics, vusMetrics, allThresholds, metricThresholdsPassed, totalThresholdResult }
}

function thresholdResult(thresholds: Object | undefined) {
  if (thresholds) {
    const thresholdArr = Object.values(thresholds);
    const passes = thresholdArr.filter(value => value === false).length;
    const fails = thresholdArr.length - passes;
    return [passes, fails];
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
