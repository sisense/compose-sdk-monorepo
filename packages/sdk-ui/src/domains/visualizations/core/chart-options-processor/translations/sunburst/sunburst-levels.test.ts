import { PointLabelObject } from '@sisense/sisense-charts';

import { CategoricalChartDataOptionsInternal } from '@/domains/visualizations/core/chart-data-options/types';
import { CategoricalChartData } from '@/domains/visualizations/core/chart-data/types';
import { SunburstChartDesignOptions } from '@/domains/visualizations/core/chart-options-processor/translations/design-options';
import { mockedSunburstSeriesProps } from '@/domains/visualizations/core/chart-options-processor/translations/sunburst/mock/sunburst-series-props';
import { prepareSunburstLevels } from '@/domains/visualizations/core/chart-options-processor/translations/sunburst/sunburst-levels';
import { CompleteThemeSettingsInternal } from '@/types';

describe('prepareSunburstLevels', () => {
  it("should give the root level label's text an explicit line-height", () => {
    const [rootLevelOptions] = prepareSunburstLevels(
      mockedSunburstSeriesProps.chartData as CategoricalChartData,
      mockedSunburstSeriesProps.dataOptions as CategoricalChartDataOptionsInternal,
      {} as SunburstChartDesignOptions,
      mockedSunburstSeriesProps.themeSettings as CompleteThemeSettingsInternal,
    );

    const formatter = rootLevelOptions.dataLabels.formatter as (this: PointLabelObject) => string;
    const html = formatter.call({
      point: { name: 'Total Revenue', value: 7090000 },
    } as unknown as PointLabelObject);

    // both text rows must set an explicit line-height wide enough for their own font-size,
    // instead of inheriting Highcharts' undersized default for its own (smaller) label font.
    expect(html).toMatch(
      /white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 18px; line-height: 22px/,
    );
    expect(html).toMatch(/font-weight: 600;\s*font-size: 18px;\s*line-height: 22px/);
  });
});
