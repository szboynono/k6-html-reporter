import { generate } from "./reporter";
import { Options } from "./types";

export function generateSummaryReport(options: Options) {
  generate(options);
}
