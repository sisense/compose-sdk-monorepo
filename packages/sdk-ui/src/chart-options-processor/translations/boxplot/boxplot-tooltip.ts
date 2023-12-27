import { BoxplotChartDataOptionsInternal } from '../../../chart-data-options/types';
import { colorChineseSilver, colorWhite } from '../../../chart-data-options/coloring/consts';
import {
  InternalSeries,
  TooltipSettings,
  formatTooltipValue,
  formatTooltipXValue,
} from '../tooltip-utils';
import { spanSegment, tooltipSeparator, tooltipWrapper } from '../scatter-tooltip';
import { isUndefined } from 'lodash';
import './boxplot-tooltip.scss';

// eslint-disable-next-line max-lines-per-function
export const getBoxplotTooltipSettings = (
  dataOptions: BoxplotChartDataOptionsInternal,
): TooltipSettings => {
  return {
    animation: false,
    backgroundColor: colorWhite,
    borderColor: colorChineseSilver,
    borderRadius: 10,
    borderWidth: 1,
    useHTML: true,
    // eslint-disable-next-line max-lines-per-function
    formatter(this: InternalSeries) {
      const { x, y } = this;
      const {
        high: whiskerMax,
        low: whiskerMin,
        q3: boxMax,
        q1: boxMin,
        median: boxMedian,
      } = this.point;
      const isOutliersPoint = isUndefined(whiskerMax);
      const formattedX = formatTooltipXValue(dataOptions.category, x, `${x}`);

      if (isOutliersPoint) {
        const formattedY = formatTooltipValue(dataOptions.outliers, y, `${y}`);

        return tooltipWrapper(`
          <div>${this.series.name}</div>
          <div>${spanSegment(formattedY, this.point.color)}</div>
          ${dataOptions.category ? `${tooltipSeparator()}<div>${formattedX}</div>` : ''}
        `);
      }

      const formatedWhiskerMax = formatTooltipValue(
        dataOptions.whiskerMax,
        whiskerMax,
        `${whiskerMax}`,
      );
      const formatedWhiskerMin = formatTooltipValue(
        dataOptions.whiskerMin,
        whiskerMin,
        `${whiskerMin}`,
      );
      const formatedBoxMax = formatTooltipValue(dataOptions.boxMax, boxMax, `${boxMax}`);
      const formatedBoxMin = formatTooltipValue(dataOptions.boxMin, boxMin, `${boxMin}`);
      const formatedBoxMedian = formatTooltipValue(
        dataOptions.boxMedian,
        boxMedian,
        `${boxMedian}`,
      );

      return tooltipWrapper(`
        <div>Whiskers</div>
        <div class="csdk-boxplot-tooltip-row">
          Max
          ${spanSegment(formatedWhiskerMax, this.point.color)}
        </div>
        <div class="csdk-boxplot-tooltip-row">
          Min
          ${spanSegment(formatedWhiskerMin, this.point.color)}
        </div>
        ${tooltipSeparator()}
        <div>Box</div>
        <div class="csdk-boxplot-tooltip-row">
          Max
          ${spanSegment(formatedBoxMax, this.point.color)}
        </div>
        <div class="csdk-boxplot-tooltip-row">
          Min
          ${spanSegment(formatedBoxMin, this.point.color)}
        </div>
        <div class="csdk-boxplot-tooltip-row">
        Median
          ${spanSegment(formatedBoxMedian, this.point.color)}
        </div>
        ${tooltipSeparator()}
        <div>${dataOptions.category ? formattedX : this.series.name}</div>
      `);
    },
  };
};
