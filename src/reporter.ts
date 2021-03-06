import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import { DisplayTotalThresholdResult, MetricsType, Options } from './types';

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
  const time = new Date().toLocaleString();
  const templatePath = path.resolve(__dirname, '../templates/template.ejs');
  const checkRootGroupData = content["root_group"];
  const metricsData = content["metrics"];

  const { checkMetric, counterMetrics, trendMetrics, gaugeMetrics, rateMetrics, allThresholds, totalThresholdResult } = mapMetrics(metricsData);
  const checks = getChecks(checkRootGroupData).map((data) => {
    const splitedPath = data.path.split('::');
    splitedPath.shift();

    return {
      ...data,
      pathArray: splitedPath.join(" \u21C0 ")
    }
  });

  ejs.renderFile(templatePath, { checks, rateMetrics, checkMetric, counterMetrics, trendMetrics, gaugeMetrics, allThresholds, totalThresholdResult, time }, {}, function (err, str) {
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
  const counterMetrics = [];
  const trendMetrics = [];
  const gaugeMetrics = [];
  const rateMetrics = [];
  const allThresholds = [];

  let totalThresholdResult: DisplayTotalThresholdResult = {
    passes: 0,
    fails: 0,
    failedMetricsNum: 0
  }

  Object.entries(data).forEach(
    ([key, value]) => {
      if (value.type === MetricsType.COUNTER) {
        const {updatedThresholdResult, displayThreshold, metric} = handleMetricValues(key, value, totalThresholdResult)
        totalThresholdResult = {
          ...totalThresholdResult,
          ...updatedThresholdResult
        }
        if(displayThreshold) {
          allThresholds.push(displayThreshold)
        }
        counterMetrics.push(metric);
      } else if (value.type === MetricsType.TREND) {
        const {updatedThresholdResult, displayThreshold, metric} = handleMetricValues(key, value, totalThresholdResult)
        totalThresholdResult = {
          ...totalThresholdResult,
          ...updatedThresholdResult
        }
        if(displayThreshold) {
          allThresholds.push(displayThreshold)
        }
        trendMetrics.push(metric);
      } else if (key === 'checks') {
        const {updatedThresholdResult, displayThreshold, metric} = handleMetricValues(key, value, totalThresholdResult)
        totalThresholdResult = {
          ...totalThresholdResult,
          ...updatedThresholdResult
        }
        if(displayThreshold) {
          allThresholds.push(displayThreshold)
        }
        checkMetric = metric;
      } else if (value.type === MetricsType.GAUGE) {
        const {updatedThresholdResult, displayThreshold, metric} = handleMetricValues(key, value, totalThresholdResult)
        totalThresholdResult = {
          ...totalThresholdResult,
          ...updatedThresholdResult
        }
        if(displayThreshold) {
          allThresholds.push(displayThreshold)
        }
        gaugeMetrics.push(metric);
      } else if (value.type === MetricsType.RATE && key !== 'checks') {
        const {updatedThresholdResult, displayThreshold, metric} = handleMetricValues(key, value, totalThresholdResult)
        totalThresholdResult = {
          ...totalThresholdResult,
          ...updatedThresholdResult
        }
        if(displayThreshold) {
          allThresholds.push(displayThreshold)
        }
        rateMetrics.push(metric);
      }
    }
  );
  return { checkMetric, counterMetrics, trendMetrics, gaugeMetrics, rateMetrics, allThresholds, totalThresholdResult }
}

function handleMetricValues(key: string, value: any, currentTotalThresholdResult: DisplayTotalThresholdResult) {
  const metric = {
    name: key,
    ...value,
    thresholdFailed: undefined
  };

  const updatedThresholdResult = { ...currentTotalThresholdResult }

  if (value.thresholds) {
    const [passes, fails] = thresholdResult(value.thresholds);

    if (fails > 0 && key !== 'checks') {
      updatedThresholdResult.failedMetricsNum++;
    }
    updatedThresholdResult.passes += passes;
    updatedThresholdResult.fails += fails;
    metric.thresholdFailed = fails > 0;

    return {
      displayThreshold: {
        name: key,
        thresholds: value.thresholds
      }, updatedThresholdResult, metric
    }
  }

  return { updatedThresholdResult, metric }
}

function thresholdResult(thresholds: Object | undefined) {
  if (thresholds) {
    const thresholdArr = Object.values(thresholds);
    const passes = thresholdArr.filter(value => value.ok === true).length;
    const fails = thresholdArr.length - passes;
    return [passes, fails];
  }
}

function getChecks(data: any) {
  let checksOutput = [];

  findChecksRecursively(data);

  function findChecksRecursively(data) {
    if (data.groups.length === 0 && data.checks.length === 0) {
      return;
    }

    if (data.checks.length > 0) {
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
