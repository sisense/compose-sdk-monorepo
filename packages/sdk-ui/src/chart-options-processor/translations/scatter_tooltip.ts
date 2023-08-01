import { InternalSeries, TooltipSettings } from '../tooltip';
import { ScatterChartDataOptionsInternal } from '../../chart-data-options/types';
import { getDataOptionTitle } from '../../chart-data-options/utils';

export interface ScatterTooltipElements {
  x: string;
  y: string;
  breakByPoint: string;
  breakByColor: string;
  size: string;
}

export interface ScatterCustomPointOptions {
  maskedX: string;
  maskedY: string;
  maskedBreakByPoint?: string;
  maskedBreakByColor?: string;
  maskedSize?: string;
}

export const spanSegment = (value: number | string, color?: string): string =>
  value !== '' ? `<span style="fill:${color ?? 'currentColor'}">${value}</span>` : '';

const block = (element: string, title?: string): string => `${title || ''}<br />${element || ''}`;

const buildTooltip = (blocks: string[]): string =>
  blocks.reduce((tooltip, value) => tooltip + (value !== '<br />' ? `<br />${value}` : ''));

const buildSpans = (ctx: InternalSeries): ScatterTooltipElements => {
  const { maskedX, maskedY, maskedBreakByPoint, maskedSize, maskedBreakByColor } = ctx.point
    .custom as ScatterCustomPointOptions;
  const x = spanSegment(maskedX, ctx.point.color);
  const y = spanSegment(maskedY, ctx.point.color);
  const breakByPoint = spanSegment(maskedBreakByPoint || '', ctx.point.color);
  const breakByColor = spanSegment(maskedBreakByColor || '', ctx.point.color);
  const size = spanSegment(maskedSize || '', ctx.point.color);

  return {
    x,
    y,
    breakByPoint,
    breakByColor,
    size,
  };
};

const buildBlocks = (
  spans: ScatterTooltipElements,
  dataOptions: ScatterChartDataOptionsInternal,
): ScatterTooltipElements => {
  const x = block(spans.x, dataOptions.x && getDataOptionTitle(dataOptions.x));
  const y = block(spans.y, dataOptions.y && getDataOptionTitle(dataOptions.y));
  const breakByPoint = block(
    spans.breakByPoint,
    dataOptions.breakByPoint && getDataOptionTitle(dataOptions.breakByPoint),
  );
  const breakByColor = block(
    spans.breakByColor,
    dataOptions.breakByColor && getDataOptionTitle(dataOptions.breakByColor),
  );
  const size = block(spans.size, dataOptions.size && getDataOptionTitle(dataOptions.size));

  return {
    x,
    y,
    breakByPoint,
    breakByColor,
    size,
  };
};

export const tooltipFormatter = (
  ctx: InternalSeries,
  dataOptions: ScatterChartDataOptionsInternal,
): string => {
  const spans = buildSpans(ctx);
  const { x, y, breakByPoint, breakByColor, size } = buildBlocks(spans, dataOptions);

  return buildTooltip([x, y, breakByPoint, breakByColor, size]);
};

export const getScatterTooltipSettings = (
  dataOptions: ScatterChartDataOptionsInternal,
): TooltipSettings => ({
  enabled: true,
  formatter(): string {
    const ctx: InternalSeries = this as InternalSeries;
    return tooltipFormatter(ctx, dataOptions);
  },
});