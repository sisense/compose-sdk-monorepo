import { CategoricalChartDataOptionsInternal } from '@/chart-data-options/types';
import { CategoricalChartData } from '@/chart-data/types';
import { mockedSunburstSeriesProps } from '@/chart-options-processor/translations/sunburst/mock/sunburst-series-props';
import { prepareSunburstDataItems } from '@/chart-options-processor/translations/sunburst/sunburst-series';
import { CompleteThemeSettings } from '@/types';

describe('prepareSunburstDataItems', () => {
  it('should prepare data items with sorting and coloring', () => {
    const result = prepareSunburstDataItems(
      mockedSunburstSeriesProps.chartData as CategoricalChartData,
      mockedSunburstSeriesProps.dataOptions as CategoricalChartDataOptionsInternal,
      mockedSunburstSeriesProps.themeSettings as CompleteThemeSettings,
    );

    expect(result).toMatchSnapshot();
  });
});
