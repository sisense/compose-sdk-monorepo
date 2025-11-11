/* eslint-disable @typescript-eslint/no-use-before-define */
import merge from 'ts-deepmerge';
import { DeepPartial } from 'ts-essentials';

import { prepareDataLabelsOptions } from '@/chart-options-processor/series-labels';

import {
  CategoricalChartDataOptionsInternal,
  ChartDataOptionsInternal,
} from '../../chart-data-options/types';
import { fraction, fromFraction, withPercentSign } from '../../chart-data/utils';
import { CompleteNumberFormatConfig, FunnelSeriesLabels } from '../../types';
import { PlotOptions } from '../chart-options-service';
import { fontStyleDefault } from '../defaults/cartesian';
import { FunnelChartDesignOptions } from './design-options';
import { applyFormatPlainText, getCompleteNumberFormatConfig } from './number-format-config';
import { HighchartsDataPointContext } from './tooltip-utils';
import { DataLabelsSettings } from './value-label-section';

/**
 * Default configuration for funnel chart series labels.
 * Enables all label components (category, value, percentage) by default.
 */
export const DefaultFunnelSeriesLabels: FunnelSeriesLabels = {
  enabled: true,
  showCategory: true,
  showValue: true,
  showPercentage: true,
  showPercentDecimals: false,
} as const;

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
/** Funnel-specific data labels settings extending the base data labels configuration. */
export type FunnelDataLabelsSettings = DataLabelsSettings & {
  funnelMinimumFontSizeToTextLabel: number;
};

export type FunnelOptions = {
  allowPointSelect: boolean;
  cursor: 'pointer';
  dataLabels: FunnelDataLabelsSettings;
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

const prepareFunnelDataLabelsOptions = (
  seriesLabels: FunnelSeriesLabels,
): Partial<FunnelDataLabelsSettings> => {
  const { enabled, showCategory, showValue, showPercentage } = seriesLabels;
  return {
    ...prepareDataLabelsOptions(seriesLabels),
    enabled: enabled && [showCategory, showValue, showPercentage].find(Boolean) !== undefined,
  };
};

const getCategory = (ctx: HighchartsDataPointContext, labels: FunnelSeriesLabels): string => {
  if (!labels.showCategory) return '';

  return ctx.point.name || ctx.series.name;
};

const getValue = (
  ctx: HighchartsDataPointContext,
  labels: FunnelSeriesLabels,
  numberFormatConfig: CompleteNumberFormatConfig,
): string => {
  if (!labels.showValue) return '';
  const value = applyFormatPlainText(numberFormatConfig, ctx.y);
  if (labels.showValue && labels.showCategory) return `<br />${value}`;

  return value;
};

const getPercent = (ctx: HighchartsDataPointContext, labels: FunnelSeriesLabels): string => {
  if (!labels.showPercentage) return '';
  const percent = ctx.point?.custom?.number1 || 0;
  const percentString = labels.showPercentDecimals ? percent.toFixed(1) : `${Math.round(percent)}`;

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
    seriesLabels = DefaultFunnelSeriesLabels,
  } = funnelDesignOptions;

  const numberFormatConfig = getCompleteNumberFormatConfig(
    (chartDataOptions as CategoricalChartDataOptionsInternal).y[0]?.numberFormatConfig,
  );
  const renderTo = null;

  const funnelWidth = funnelWidthPercentage(renderTo);

  const preparedOptions: DeepPartial<FunnelOptions> = {
    dataLabels: {
      ...prepareFunnelDataLabelsOptions(seriesLabels),

      formatter: function (this: HighchartsDataPointContext) {
        const category = getCategory(this, seriesLabels);
        const value = getValue(this, seriesLabels, numberFormatConfig);
        const percent = getPercent(this, seriesLabels);

        return `${seriesLabels?.prefix ?? ''}${category}${value}${percent}${
          seriesLabels?.suffix ?? ''
        }`;
      },
    },
    reversed: isFunnelReversed(funnelDirection),
    neckWidth: withPercentSign(funnelNeckWidth(funnelWidth, funnelSize)),
    neckHeight: withPercentSign(funnelNeckHeight(funnelType)),
    width: withPercentSign(funnelWidth),
  };

  const funnelOptions = merge(defaultFunnelOptions(), preparedOptions) as FunnelOptions;

  return {
    funnel: funnelOptions,
    series: {},
  };
};
