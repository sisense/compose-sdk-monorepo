/* eslint-disable @typescript-eslint/default-param-last */
import { CompleteThemeSettings, PieSeriesLabels } from '@/types';

import {
  CategoricalChartDataOptionsInternal,
  ChartDataOptionsInternal,
} from '../../chart-data-options/types';
import { PlotOptions } from '../chart-options-service';
import { fontStyleDefault } from '../defaults/cartesian';
import { prepareDataLabelsOptions } from '../series-labels';
import { applyFormatPlainText, getCompleteNumberFormatConfig } from './number-format-config';
import { HighchartsDataPointContext } from './tooltip-utils';
import { DataLabelsSettings } from './value-label-section';

export const DefaultPieSeriesLabels: PieSeriesLabels = {
  enabled: true,
  showCategory: true,
  showValue: true,
  percentageLabels: {
    enabled: true,
    showDecimals: false,
  },
};

export type PieLabels = {
  enabled: boolean;
  showCategories: boolean;
  showValue: boolean;
  showPercent: boolean;
  showDecimals: boolean;
};

export const DefaultPieType: PieType = 'classic';
export const pieTypes = ['classic', 'donut', 'ring'] as const;
export type PieType = (typeof pieTypes)[number];

export type PieOptions = {
  allowPointSelect: boolean;
  cursor?: string;
  dataLabels: DataLabelsSettings & {
    showPercentLabels: boolean;
    showDecimals: boolean;
    pieMinimumFontSizeToTextLabel: number;
    formatter?: () => string;
  };
  showInLegend: boolean;
  innerSize?: InnerSize;
  startAngle?: number;
  endAngle?: number;
  center?: [string | number, string | number];
};

type InnerSize = '0%' | '40%' | '80%';
const pieTypeToInnerSize: Record<PieType, InnerSize> = {
  classic: '0%',
  donut: '40%',
  ring: '80%',
};

const defaultPieOptions = (): PieOptions => ({
  allowPointSelect: false,
  showInLegend: true,
  dataLabels: {
    enabled: false,
    showPercentLabels: false,
    showDecimals: false,
    pieMinimumFontSizeToTextLabel: 8,
    align: 'center',
    style: fontStyleDefault,
  },
  innerSize: '0%',
});

const defaultSeriesOptions = (): PlotOptions['series'] => ({
  dataLabels: {
    enabled: false,
  },
});

export type GetPiePlotOptionsParams = {
  pieType?: PieType;
  seriesLabels?: PieSeriesLabels;
  chartDataOptions: ChartDataOptionsInternal;
  themeSettings?: CompleteThemeSettings;
  semiCircle?: boolean;
};

export const getPiePlotOptions = ({
  pieType = DefaultPieType,
  seriesLabels = DefaultPieSeriesLabels,
  chartDataOptions,
  themeSettings,
  semiCircle,
}: GetPiePlotOptionsParams): PlotOptions => {
  const pieOptions = defaultPieOptions();
  const seriesOptions = defaultSeriesOptions();
  pieOptions.innerSize = pieTypeToInnerSize[pieType];

  if (themeSettings) {
    pieOptions.dataLabels.style = {
      color: themeSettings.chart.textColor,
      fontFamily: themeSettings.typography.fontFamily,
      textOutline: 'none',
    };
  }

  if (seriesLabels.enabled) {
    const numberFormatConfig = getCompleteNumberFormatConfig(
      (chartDataOptions as CategoricalChartDataOptionsInternal).y[0]?.numberFormatConfig,
    );
    const shouldEnableDataLabels =
      seriesLabels.enabled && (seriesLabels.showCategory || seriesLabels.showValue);
    const dataLabelsOptions = prepareDataLabelsOptions(seriesLabels);
    pieOptions.dataLabels = {
      ...pieOptions.dataLabels,
      ...dataLabelsOptions,
      enabled: shouldEnableDataLabels,
      style: {
        ...pieOptions.dataLabels.style,
        ...dataLabelsOptions.style,
      },
      formatter: function (this: HighchartsDataPointContext) {
        const name = this.point.name || this.series.name;
        const value = this.y;
        return (
          '<div>' +
          (seriesLabels.prefix ?? '') +
          (seriesLabels.showCategory ? name : '') +
          (seriesLabels.showCategory && seriesLabels.showValue ? '<br />' : '') +
          (seriesLabels.showValue ? applyFormatPlainText(numberFormatConfig, value) : '') +
          (seriesLabels.suffix ?? '') +
          '</div>'
        );
      },
      // custom options applicable only by `@sisense/sisense-charts`
      showPercentLabels: seriesLabels?.percentageLabels?.enabled ?? false,
      showDecimals: seriesLabels?.percentageLabels?.showDecimals ?? false,
    };
  }

  if (seriesOptions.dataLabels) seriesOptions.dataLabels.enabled = seriesLabels.enabled;

  // Apply semicircle angles and center positioning if enabled
  if (semiCircle) {
    pieOptions.startAngle = -90;
    pieOptions.endAngle = 90;
    // Position the center lower to better utilize vertical space
    pieOptions.center = ['50%', '75%'];
  }

  return {
    pie: pieOptions,
    series: seriesOptions,
  };
};
