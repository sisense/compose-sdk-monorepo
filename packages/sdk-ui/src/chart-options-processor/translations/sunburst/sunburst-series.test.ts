import { prepareSunburstDataItems } from '@/chart-options-processor/translations/sunburst/sunburst-series';
import { mockedSunburstSeriesProps } from '@/chart-options-processor/translations/sunburst/mock/sunburst-series-props';
import { CategoricalChartData } from '@/chart-data/types';
import { CategoricalChartDataOptionsInternal } from '@/chart-data-options/types';
import { CompleteThemeSettings } from '@/types';

describe('prepareSunburstDataItems', () => {
  it('should prepare data items with sorting and coloring', () => {
    const result = prepareSunburstDataItems(
      mockedSunburstSeriesProps.chartData as CategoricalChartData,
      mockedSunburstSeriesProps.dataOptions as unknown as CategoricalChartDataOptionsInternal,
      mockedSunburstSeriesProps.themeSettings as CompleteThemeSettings,
    );

    expect(result).toMatchSnapshot();
  });
});
