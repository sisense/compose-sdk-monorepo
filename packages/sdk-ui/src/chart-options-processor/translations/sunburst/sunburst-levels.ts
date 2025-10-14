import { PointLabelObject } from '@sisense/sisense-charts';

import { CategoricalChartDataOptionsInternal } from '../../../chart-data-options/types';
import { CategoricalChartData } from '../../../chart-data/types';
import { CompleteThemeSettings } from '../../../types';
import { getDarkFactor, toColor } from '../../../utils/color';
import { SunburstChartDesignOptions } from '../design-options';
import { applyFormat, getCompleteNumberFormatConfig } from '../number-format-config';
import { tooltipSeparator } from '../scatter-tooltip';

const ROOT_LEVEL_SIZE_PER_CATEGORIES = Object.freeze({
  1: 80,
  2: 70,
  3: 60,
  4: 50,
});

export function prepareSunburstLevels(
  chartData: CategoricalChartData,
  dataOptions: CategoricalChartDataOptionsInternal,
  designOptions: SunburstChartDesignOptions,
  themeSettings?: CompleteThemeSettings,
) {
  const rootLevelOptions = {
    level: 1,
    color: themeSettings?.chart?.backgroundColor ?? 'white',
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
          <div style="color: ${
            themeSettings?.chart?.secondaryTextColor ?? '#9EA2AB'
          }; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 18px">${
          this.point.name
        }</div>
          ${tooltipSeparator()}
          <div style="
            font-weight: 600;
            font-size: 18px;
            color: ${themeSettings?.chart?.textColor ?? '#5B6372'}
            "
            >${applyFormat(numberFormatConfig, value)}</div>
        </div>
      `;
      },
    },
    levelSize: {
      unit: 'percentage',
      value: ROOT_LEVEL_SIZE_PER_CATEGORIES[dataOptions.breakBy.length] || 50,
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
