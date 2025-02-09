/* eslint-disable @typescript-eslint/default-param-last */
import { PlotOptions } from '../chart-options-service';
import { fontStyleDefault } from '../defaults/cartesian';
import { ValueLabelSettings } from './value-label-section';
import { applyFormatPlainText, getCompleteNumberFormatConfig } from './number-format-config';
import {
  ChartDataOptionsInternal,
  CategoricalChartDataOptionsInternal,
} from '../../chart-data-options/types';
import { InternalSeries } from './tooltip-utils';
import { CompleteThemeSettings } from '@/types';

export const DefaultPieLabels: PieLabels = {
  enabled: true,
  showCategories: true,
  showValue: true,
  showPercent: true,
  showDecimals: false,
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
  dataLabels: ValueLabelSettings & {
    showPercentLabels: boolean;
    showDecimals: boolean;
    pieMinimumFontSizeToTextLabel: number;
    formatter?: () => string;
  };
  showInLegend: boolean;
  innerSize?: InnerSize;
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

export const getPiePlotOptions = (
  pieType: PieType = DefaultPieType,
  pieLabels: PieLabels = DefaultPieLabels,
  chartDataOptions: ChartDataOptionsInternal,
  themeSettings?: CompleteThemeSettings,
  // eslint-disable-next-line sonarjs/cognitive-complexity
): PlotOptions => {
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

  if (pieLabels.enabled) {
    const dataLabelsEnabled = pieLabels.showCategories || pieLabels.showValue;
    const { dataLabels: pieDataLabels } = pieOptions;
    pieDataLabels.enabled = dataLabelsEnabled;
    // custom options applicable only by `@sisense/sisense-charts`
    pieDataLabels.showPercentLabels = pieLabels.showPercent;
    pieDataLabels.showDecimals = pieLabels.showDecimals;

    const numberFormatConfig = getCompleteNumberFormatConfig(
      (chartDataOptions as CategoricalChartDataOptionsInternal).y[0]?.numberFormatConfig,
    );
    pieDataLabels.formatter = function (this: InternalSeries) {
      const name = this.point.name || this.series.name;
      const value = this.y;
      return `<div>
          ${pieLabels.showCategories ? name : ''}
          ${pieLabels.showCategories && pieLabels.showValue ? '<br />' : ''}
          ${pieLabels.showValue ? applyFormatPlainText(numberFormatConfig, value) : ''}
        </div>`;
    };

    if (seriesOptions.dataLabels) seriesOptions.dataLabels.enabled = dataLabelsEnabled;
  }

  return {
    pie: pieOptions,
    series: seriesOptions,
  };
};
