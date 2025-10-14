import { colorChineseSilver, colorWhite } from '@/chart-data-options/coloring/consts.js';
import { getDataOptionGranularity } from '@/chart-data-options/utils.js';
import { HighchartsOptionsInternal } from '@/chart-options-processor/chart-options-service.js';
import { getDefaultDateFormat } from '@/chart-options-processor/translations/axis-section.js';
import {
  applyFormat,
  getCompleteNumberFormatConfig,
} from '@/chart-options-processor/translations/number-format-config.js';
import {
  tooltipSeparator,
  tooltipWrapper,
} from '@/chart-options-processor/translations/scatter-tooltip.js';
import { scaleBrightness } from '@/utils/color/color-interpolation.js';

import { BuildContext } from '../../../types.js';
import { CALENDAR_HEATMAP_COLORS, CALENDAR_HEATMAP_SIZING } from '../../constants.js';

/**
 * Prepares the Highcharts's tooltip options for calendar heatmap
 *
 * @param ctx - The highcharts options builder context
 * @returns Tooltip options object
 */
export function getTooltipOptions(
  ctx: BuildContext<'calendar-heatmap'>,
): HighchartsOptionsInternal['tooltip'] {
  const { dateFormatter } = ctx.extraConfig;
  const valueName = ctx.dataOptions.value.column.title || ctx.dataOptions.value.column.name;
  // Prevent tooltip cropping in small charts
  const shouldUseFixedTooltipWidth =
    ctx.designOptions.width && ctx.designOptions.width < CALENDAR_HEATMAP_SIZING.MIN_TOOLTIP_WIDTH;

  return {
    animation: false,
    backgroundColor: colorWhite,
    borderColor: colorChineseSilver,
    borderRadius: 10,
    borderWidth: 1,
    useHTML: true,
    style: {
      width: shouldUseFixedTooltipWidth ? CALENDAR_HEATMAP_SIZING.MIN_TOOLTIP_WIDTH : undefined,
    },
    position: {
      relativeTo: 'chart',
    },
    followPointer: true,
    outside: true,
    formatter: function () {
      // Use type assertion to access custom properties
      const point = this.point;

      const date = point.date && new Date(point.date);
      const isValidDate = date && !isNaN(date.getTime());

      if (!isValidDate) {
        return false;
      }

      // Get date format from data option or use default
      const dateDataOption = ctx.dataOptions.date;
      const granularity = getDataOptionGranularity(dateDataOption);
      const dateFormat = dateDataOption.dateFormat || getDefaultDateFormat(granularity)!;

      // Format the date using the dateFormatter from extraConfig
      const formattedDate = dateFormatter(date, dateFormat);

      // Format the value using the data option's number format
      let formattedValue = '';
      if (point.value !== null && point.value !== undefined && point.custom?.hasData) {
        const numberFormatConfig = ctx.dataOptions.value.numberFormatConfig;
        // Use the SDK's number formatting
        const completeConfig = getCompleteNumberFormatConfig(numberFormatConfig);
        formattedValue = applyFormat(completeConfig, point.value);
      } else {
        formattedValue = '—';
      }

      const color =
        point.color &&
        scaleBrightness(point.color, CALENDAR_HEATMAP_COLORS.TOOLTIP_COLOR_BRIGHTNESS_PERCENT);

      return tooltipWrapper(`
        ${valueName}
        <br />
        <span style="color: ${color ?? 'inherit'}">${formattedValue}</span>
        ${tooltipSeparator()}
        ${formattedDate}
      `);
    },
  };
}
