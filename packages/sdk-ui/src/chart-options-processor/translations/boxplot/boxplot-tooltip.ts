import { TFunction } from '@sisense/sdk-common';
import isUndefined from 'lodash-es/isUndefined';

import { colorChineseSilver, colorWhite } from '../../../chart-data-options/coloring/consts';
import { BoxplotChartDataOptionsInternal } from '../../../chart-data-options/types';
import { spanSegment, tooltipSeparator, tooltipWrapper } from '../scatter-tooltip';
import { formatTooltipValue, HighchartsDataPointContext, TooltipSettings } from '../tooltip-utils';
import './boxplot-tooltip.scss';

// eslint-disable-next-line max-lines-per-function
export const getBoxplotTooltipSettings = (
  dataOptions: BoxplotChartDataOptionsInternal,
  translate: TFunction,
): TooltipSettings => {
  return {
    animation: false,
    backgroundColor: colorWhite,
    borderColor: colorChineseSilver,
    borderRadius: 10,
    borderWidth: 1,
    useHTML: true,
    // eslint-disable-next-line max-lines-per-function
    formatter(this: HighchartsDataPointContext) {
      const { x, y } = this;
      const {
        high: whiskerMax,
        low: whiskerMin,
        q3: boxMax,
        q1: boxMin,
        median: boxMedian,
      } = this.point;
      const isOutliersPoint = isUndefined(whiskerMax);
      const formattedX = formatTooltipValue(dataOptions.category, x, `${x}`);

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
        <div>${translate('boxplot.tooltip.whiskers')}</div>
        <div class="csdk-boxplot-tooltip-row">
          <span>${translate('boxplot.tooltip.max')}</span>
          ${spanSegment(formatedWhiskerMax, this.point.color)}
        </div>
        <div class="csdk-boxplot-tooltip-row">
          <span>${translate('boxplot.tooltip.min')}</span>
          ${spanSegment(formatedWhiskerMin, this.point.color)}
        </div>
        ${tooltipSeparator()}
        <div>${translate('boxplot.tooltip.box')}</div>
        <div class="csdk-boxplot-tooltip-row">
          <span>${translate('boxplot.tooltip.max')}</span>
          ${spanSegment(formatedBoxMax, this.point.color)}
        </div>
        <div class="csdk-boxplot-tooltip-row">
          <span>${translate('boxplot.tooltip.min')}</span>
          ${spanSegment(formatedBoxMin, this.point.color)}
        </div>
        <div class="csdk-boxplot-tooltip-row">
          <span>${translate('boxplot.tooltip.median')}</span>
          ${spanSegment(formatedBoxMedian, this.point.color)}
        </div>
        ${tooltipSeparator()}
        <div>${dataOptions.category ? formattedX : this.series.name}</div>
      `);
    },
  };
};
