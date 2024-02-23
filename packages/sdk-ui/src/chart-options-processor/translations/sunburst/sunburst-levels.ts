import { CategoricalChartData } from '../../../chart-data/types';
import { PointLabelObject } from '@sisense/sisense-charts';
import { applyFormat, getCompleteNumberFormatConfig } from '../number-format-config';
import { CategoricalChartDataOptionsInternal } from '../../../chart-data-options/types';
import { tooltipSeparator } from '../scatter-tooltip';
import { SunburstChartDesignOptions } from '../design-options';
import { getDarkFactor, toColor } from '../../../utils/color';
import { CompleteThemeSettings } from '../../../types';

export function prepareSunburstLevels(
  chartData: CategoricalChartData,
  dataOptions: CategoricalChartDataOptionsInternal,
  designOptions: SunburstChartDesignOptions,
  themeSettings?: CompleteThemeSettings,
) {
  const rootLevelOptions = {
    level: 1,
    color: 'white',
    dataLabels: {
      enabled: true,
      useHTML: true,
      className: '!csdk-overflow-visible',
      formatter(this: PointLabelObject) {
        const numberFormatConfig = getCompleteNumberFormatConfig(
          dataOptions.y?.[0]?.numberFormatConfig,
        );
        const { value } = this.point as unknown as { value: number };

        return `
        <div style="text-align: center; transform: translateY(calc(-50% + 15px))">
          <div style="color: #9EA2AB">${this.point.name}</div>
          ${tooltipSeparator()}
          <div style="
            font-weight: 600;
            font-size: 18px;
            color: ${themeSettings?.typography?.primaryTextColor ?? '#5B6372'}
            "
            >${applyFormat(numberFormatConfig, value)}</div>
        </div>
      `;
      },
    },
    levelSize: {
      unit: 'pixels',
      value: 60,
    },
  };

  const secondaryLevelOptions = Array.from(new Array(chartData.xAxisCount)).map((_, i) => ({
    level: i + 2,
    dataLabels: {
      enabled: designOptions?.labels?.category?.[i]?.enabled ?? false,
      formatter(this: PointLabelObject) {
        const isDarkBG = getDarkFactor(toColor(this.color as string)) > 0.4;
        const color = isDarkBG ? 'white' : 'rgb(43, 51, 66)';

        return `<span style="color: ${color}">${this.point.name}</span>`;
      },
    },
  }));

  return [rootLevelOptions, ...secondaryLevelOptions];
}
