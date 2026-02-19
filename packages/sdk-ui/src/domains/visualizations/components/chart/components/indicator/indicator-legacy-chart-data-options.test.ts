import { MeasureColumn } from '@sisense/sdk-data';

import { chartData, chartDataOptions, chartDesignOptions } from './__mocks__/indicator-mocks.js';
import { createLegacyChartDataOptions } from './indicator-legacy-chart-data-options.js';

describe('indicator-legacy-chart-data-options', () => {
  describe('createLegacyChartDataOptions', () => {
    it('should return the correct legacy chart data options', () => {
      const legacyChartDataOptions = createLegacyChartDataOptions(
        chartData,
        chartDesignOptions,
        chartDataOptions,
      );
      expect(legacyChartDataOptions).toMatchSnapshot();
    });

    it('should return the correct legacy chart data options when value defined as StyledMeasureColumn', () => {
      const legacyChartDataOptions = createLegacyChartDataOptions(chartData, chartDesignOptions, {
        ...chartDataOptions,
        value: [
          {
            column: chartDataOptions.value![0] as MeasureColumn,
            color: '#FF0000',
          },
        ],
      });
      expect(legacyChartDataOptions).toMatchSnapshot();
    });

    it('should return the correct legacy chart data options when value is "N\\A"', () => {
      const legacyChartDataOptions = createLegacyChartDataOptions(
        { ...chartData, value: NaN },
        chartDesignOptions,
        chartDataOptions,
      );
      expect(legacyChartDataOptions).toMatchSnapshot();
    });
  });
});
