import { CategoricalChartDataOptionsInternal } from '@/domains/visualizations/core/chart-data-options/types';
import { CategoricalChartData } from '@/domains/visualizations/core/chart-data/types';
import { mockedSunburstSeriesProps } from '@/domains/visualizations/core/chart-options-processor/translations/sunburst/mock/sunburst-series-props';
import {
  prepareSunburstDataItems,
  SUNBURST_ROOT_PARENT_ID,
} from '@/domains/visualizations/core/chart-options-processor/translations/sunburst/sunburst-series';
import { CompleteThemeSettingsInternal } from '@/types';

const TOTAL_REVENUE = 22_870_000;

// A sunburst with a measure and no categories: the data layer still produces a single x-value with
// an empty display value, which is what used to leak into the chart as a nameless point.
const chartDataWithoutCategories = {
  type: 'categorical',
  xAxisCount: 0,
  xValues: [{ key: '', xValues: [''], rawValues: [] }],
  series: [
    {
      name: '$measure0_Total Revenue',
      title: 'Total Revenue',
      data: [
        {
          rawValue: TOTAL_REVENUE,
          xValue: [],
          xDisplayValue: [''],
          value: TOTAL_REVENUE,
        },
      ],
    },
  ],
} as unknown as CategoricalChartData;

const dataOptionsWithoutCategories = {
  y: [
    {
      column: { name: '$measure0_Total Revenue', type: 'basemeasure', title: 'Total Revenue' },
    },
  ],
  breakBy: [],
} as unknown as CategoricalChartDataOptionsInternal;

describe('prepareSunburstDataItems', () => {
  it('should prepare data items with sorting and coloring', () => {
    const result = prepareSunburstDataItems(
      mockedSunburstSeriesProps.chartData as CategoricalChartData,
      mockedSunburstSeriesProps.dataOptions as CategoricalChartDataOptionsInternal,
      mockedSunburstSeriesProps.themeSettings as CompleteThemeSettingsInternal,
    );

    expect(result).toMatchSnapshot();
  });

  describe('when there are no categories', () => {
    it('should return only the root item, carrying the aggregated measure value', () => {
      const result = prepareSunburstDataItems(
        chartDataWithoutCategories,
        dataOptionsWithoutCategories,
        mockedSunburstSeriesProps.themeSettings as CompleteThemeSettingsInternal,
      );

      expect(result).toEqual([
        {
          id: SUNBURST_ROOT_PARENT_ID,
          name: 'Total Revenue',
          value: TOTAL_REVENUE,
          custom: { level: 0, levelsCount: 0 },
        },
      ]);
    });

    it('should not produce nameless items, which Highcharts would label with an internal id', () => {
      const result = prepareSunburstDataItems(
        chartDataWithoutCategories,
        dataOptionsWithoutCategories,
        mockedSunburstSeriesProps.themeSettings as CompleteThemeSettingsInternal,
      );

      expect(result.every(({ name }) => !!name)).toBe(true);
    });

    it('should return no items when there is no data', () => {
      const result = prepareSunburstDataItems(
        { ...chartDataWithoutCategories, series: [], xValues: [] } as CategoricalChartData,
        dataOptionsWithoutCategories,
        mockedSunburstSeriesProps.themeSettings as CompleteThemeSettingsInternal,
      );

      expect(result).toEqual([]);
    });
  });
});
