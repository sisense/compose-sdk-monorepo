/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable max-lines */
import { PlotOptions } from '../chart_options_service';
import { fontStyleDefault } from '../defaults/cartesian';
import { ValueLabelSettings } from './value_label_section';
import { defaultConfig, applyFormatPlainText } from './number_format_config';
import { NumberFormatConfig } from '../../types';
import { InternalSeries } from '../tooltip';
import { FunnelChartDesignOptions } from './design_options';
import { withPercentSign, fraction, fromFraction } from '../../chart-data/utils';
import {
  ChartDataOptionsInternal,
  CategoricalChartDataOptionsInternal,
} from '../../chart-data-options/types';

export const DefaultFunnelLabels: FunnelLabels = {
  enabled: true,
  showCategories: true,
  showValue: true,
  showPercent: true,
  showDecimals: false,
};

export type FunnelLabels = {
  enabled: boolean;
  showCategories: boolean;
  showValue: boolean;
  showPercent: boolean;
  showDecimals: boolean;
};

export const DefaultFunnelSize: FunnelSize = 'regular';
export const funnelSizes = ['wide', 'regular', 'narrow'] as const;
/** Visual size of the lowest slice (degree of funnel narrowing from highest to lowest slices)*/
export type FunnelSize = (typeof funnelSizes)[number];

export const DefaultFunnelType: FunnelType = 'regular';
export const funnelTypes = ['regular', 'pinched'] as const;
/** Visual type of the lowest slice of Funnel chart */
export type FunnelType = (typeof funnelTypes)[number];

export const DefaultFunnelDirection: FunnelDirection = 'regular';
export const funnelDirections = ['regular', 'inverted'] as const;
/** Direction of Funnel chart narrowing */
export type FunnelDirection = (typeof funnelDirections)[number];

export type FunnelOptions = {
  allowPointSelect: boolean;
  cursor: 'pointer';
  dataLabels: ValueLabelSettings & {
    funnelMinimumFontSizeToTextLabel: number;
    formatter?: () => string;
  };
  showInLegend: boolean;
  reversed: boolean;
  neckWidth: string | number;
  neckHeight: string | number;
  width: string | number;
};

export const isFunnelReversed = (direction: FunnelDirection): boolean => direction !== 'regular';

const defaultFunnelOptions = (): FunnelOptions => ({
  allowPointSelect: false,
  cursor: 'pointer',
  showInLegend: true,
  dataLabels: {
    enabled: false,
    funnelMinimumFontSizeToTextLabel: 8,
    align: 'center',
    style: fontStyleDefault,
  },
  reversed: true,
  neckWidth: DEFAULT_NECK_WIDTH,
  neckHeight: 0,
  width: MAX_FUNNEL_WIDTH,
});

const defaultSeriesOptions = (): PlotOptions['series'] => ({
  dataLabels: {
    enabled: false,
  },
});

export const seriesDataLabels = (labels: FunnelLabels): { enabled: boolean } => {
  const { enabled, showCategories, showValue, showPercent } = labels;

  return {
    enabled: enabled && [showCategories, showValue, showPercent].find(Boolean) !== undefined,
  };
};

const getCategory = (ctx: InternalSeries, labels: FunnelLabels): string => {
  if (!labels.showCategories) return '';

  return ctx.point.name || ctx.series.name;
};

const getValue = (
  ctx: InternalSeries,
  labels: FunnelLabels,
  numberFormatConfig: NumberFormatConfig,
): string => {
  if (!labels.showValue) return '';
  const value = applyFormatPlainText(numberFormatConfig, ctx.y);
  if (labels.showValue && labels.showCategories) return `<br />${value}`;

  return value;
};

const getPercent = (ctx: InternalSeries, labels: FunnelLabels): string => {
  if (!labels.showPercent) return '';
  const percent = ctx.point?.custom?.number1 || 0;
  const percentString = labels.showDecimals ? percent.toFixed(1) : `${Math.round(percent)}`;

  return ` <b>${withPercentSign(percentString)}</b>`;
};

export type RenderTo = { clientWidth: number; clientHeight: number };

export const MAX_FUNNEL_WIDTH = 66.6; // percentage
export const HEIGHT_TO_WIDTH_COEFFICIENT = 1.5;
export const DEFAULT_NECK_WIDTH = 15; // percentage
export const DEFAULT_SHIFT = 50; // percentage

const noMeasurableClientWidth = (renderTo: RenderTo | null): renderTo is null =>
  renderTo === null || renderTo.clientWidth === 0;

export const funnelWidthPercentage = (renderTo: RenderTo | null): number => {
  if (noMeasurableClientWidth(renderTo)) return MAX_FUNNEL_WIDTH;

  const { clientWidth, clientHeight } = renderTo;
  const maxFunnelWidth = fraction(clientWidth, MAX_FUNNEL_WIDTH);
  const funnelWidth = clientHeight * HEIGHT_TO_WIDTH_COEFFICIENT;

  return funnelWidth > maxFunnelWidth ? MAX_FUNNEL_WIDTH : fromFraction(clientWidth, funnelWidth);
};

const funnelNeck: Record<FunnelSize, number> = {
  wide: 60,
  regular: 30,
  narrow: 15,
};

export const funnelNeckWidth = (widthPercentage: number, funnelSize: FunnelSize): number =>
  Math.round(fraction(widthPercentage, funnelNeck[funnelSize]));

export const funnelNeckHeight = (type: FunnelType): number => (type === 'pinched' ? 30 : 0);

export const getFunnelPlotOptions = (
  funnelDesignOptions: FunnelChartDesignOptions,
  chartDataOptions: ChartDataOptionsInternal,
): PlotOptions => {
  const {
    funnelType = DefaultFunnelType,
    funnelSize = DefaultFunnelSize,
    funnelDirection = DefaultFunnelDirection,
    funnelLabels = DefaultFunnelLabels,
  } = funnelDesignOptions;

  const seriesOptions = {
    ...defaultSeriesOptions(),
    dataLabels: seriesDataLabels(funnelLabels),
  };

  const numberFormatConfig =
    (chartDataOptions as CategoricalChartDataOptionsInternal).y[0]?.numberFormatConfig ??
    defaultConfig;

  const renderTo = null;

  const funnelWidth = funnelWidthPercentage(renderTo);

  const funnelOptions = {
    ...defaultFunnelOptions(),
    dataLabels: {
      ...defaultFunnelOptions().dataLabels,
      enabled: funnelLabels.enabled && (funnelLabels.showCategories || funnelLabels.showValue),
      formatter: function (this: InternalSeries) {
        const category = getCategory(this, funnelLabels);
        const value = getValue(this, funnelLabels, numberFormatConfig);
        const percent = getPercent(this, funnelLabels);

        return `${category}${value}${percent}`;
      },
    },
    reversed: isFunnelReversed(funnelDirection),
    neckWidth: withPercentSign(funnelNeckWidth(funnelWidth, funnelSize)),
    neckHeight: withPercentSign(funnelNeckHeight(funnelType)),
    width: withPercentSign(funnelWidth),
  };

  return {
    funnel: funnelOptions,
    series: seriesOptions,
  };
};
