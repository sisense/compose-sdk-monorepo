import { BuildContext } from '../../../types.js';
import { colorChineseSilver, colorWhite } from '@/chart-data-options/coloring/consts.js';
import {
  applyFormat,
  getCompleteNumberFormatConfig,
} from '@/chart-options-processor/translations/number-format-config.js';
import {
  tooltipSeparator,
  tooltipWrapper,
} from '@/chart-options-processor/translations/scatter-tooltip.js';
import { getDataOptionGranularity } from '@/chart-data-options/utils.js';
import { getDefaultDateFormat } from '@/chart-options-processor/translations/axis-section.js';
import { HighchartsOptionsInternal } from '@/chart-options-processor/chart-options-service.js';

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

  return {
    animation: false,
    backgroundColor: colorWhite,
    borderColor: colorChineseSilver,
    borderRadius: 10,
    borderWidth: 1,
    useHTML: true,
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

      return tooltipWrapper(`
        ${valueName}
        <br />${formattedValue}
        ${tooltipSeparator()}
        ${formattedDate}
      `);
    },
  };
}
