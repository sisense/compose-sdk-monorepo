import { deriveChartFamily } from './derive-chart-family.js';

describe('deriveChartFamily', () => {
  it('should return correct chart families for chart types', () => {
    const tests: { chartType: string; chartFamily: string }[] = [
      {
        chartType: 'column',
        chartFamily: 'cartesian',
      },
      {
        chartType: 'pie',
        chartFamily: 'categorical',
      },
      {
        chartType: 'scatter',
        chartFamily: 'scatter',
      },
      {
        chartType: 'scattermap',
        chartFamily: 'scattermap',
      },
      {
        chartType: 'indicator',
        chartFamily: 'indicator',
      },
      {
        chartType: 'areamap',
        chartFamily: 'areamap',
      },
      {
        chartType: 'boxplot',
        chartFamily: 'boxplot',
      },
      {
        chartType: 'table',
        chartFamily: 'table',
      },
    ];
    tests.forEach((test) => {
      expect(deriveChartFamily(test.chartType)).toBe(test.chartFamily);
    });
  });
});
