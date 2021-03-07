import * as reporter from "./reporter";
import { generateSummaryReport } from './index'

describe('generateSummaryReport()', () => {
  test('should generate a summary report', () => {
    jest.spyOn(reporter, 'generate').mockImplementation(jest.fn())
    generateSummaryReport({} as any)
    expect(reporter.generate).toHaveBeenCalledWith({})
  })
})