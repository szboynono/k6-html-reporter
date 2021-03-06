export type Options = {
  jsonFile: string,
  output: string,
}

export enum MetricsType {
  GAUGE = 'gauge',
  RATE = 'rate',
  TREND = 'trend',
  COUNTER = 'counter'
}

export interface DisplayTotalThresholdResult {
  passes: number,
  fails: number,
  failedMetricsNum: number
}