import { HighchartsDataPointContext, TooltipSettings, formatTooltipValue } from './tooltip-utils';
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
  value !== ''
    ? `<span style="color:${
        color ?? 'currentColor'
      }; font-size: 15px; line-height: 18px">${value}</span>`
    : '';

const block = (element: string, title?: string): string => {
  return `${title || ''}${title && element ? '<br />' : ''}${element || ''}`;
};

export const tooltipWrapper = (content: string) =>
  `<div style="minWidth: 100px; color: #5B6372; fontSize: 13px; lineHeight: 18px; margin: 4px 6px">
    ${content}
  </div>`;

export const tooltipSeparator = () => '<hr class="csdk-border-t" style="margin: 7px 0px" />';

const buildTooltip = (blocks: string[]): string => {
  const content = blocks
    .map((value, index) => (value && index > 0 ? tooltipSeparator() + value : value))
    .join('');

  return tooltipWrapper(content);
};

const buildSpans = (
  ctx: HighchartsDataPointContext,
  dataOptions: ScatterChartDataOptionsInternal,
): ScatterTooltipElements => {
  const { maskedX, maskedY, maskedBreakByPoint, maskedSize, maskedBreakByColor } = ctx.point
    .custom as ScatterCustomPointOptions;

  const formatedX = formatTooltipValue(dataOptions.x, ctx.point.x, maskedX);
  const formatedY = formatTooltipValue(dataOptions.y, ctx.point.y, maskedY);
  const formatedSize = formatTooltipValue(dataOptions.size, ctx.point.z, maskedSize || '');

  const x = spanSegment(formatedX, ctx.point.color);
  const y = spanSegment(formatedY, ctx.point.color);
  const breakByPoint = spanSegment(maskedBreakByPoint || '', ctx.point.color);
  const breakByColor = spanSegment(maskedBreakByColor || '', ctx.point.color);
  const size = spanSegment(formatedSize, ctx.point.color);

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
  ctx: HighchartsDataPointContext,
  dataOptions: ScatterChartDataOptionsInternal,
): string => {
  const spans = buildSpans(ctx, dataOptions);
  const { x, y, breakByPoint, breakByColor, size } = buildBlocks(spans, dataOptions);

  return buildTooltip([x, y, breakByPoint, breakByColor, size]);
};

export const getScatterTooltipSettings = (
  dataOptions: ScatterChartDataOptionsInternal,
): TooltipSettings => ({
  enabled: true,
  useHTML: true,
  formatter(this: HighchartsDataPointContext): string {
    return tooltipFormatter(this, dataOptions);
  },
});
