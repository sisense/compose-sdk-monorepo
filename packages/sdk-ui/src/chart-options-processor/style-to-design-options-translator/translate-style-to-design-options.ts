/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */
import {
  PolarStyleOptions,
  PieStyleOptions,
  StackableStyleOptions,
  LineStyleOptions,
  FunnelStyleOptions,
  ChartType,
  StyleOptions,
  IndicatorStyleOptions,
  ScatterStyleOptions,
  AreaStyleOptions,
  TreemapStyleOptions,
  SunburstStyleOptions,
} from '../../types';
import { ChartDesignOptions } from '../translations/types';
import { chartSubtypeToDesignOptions } from '../subtype-to-design-options';
import { ChartDataOptionsInternal, ValueStyle } from '../../chart-data-options/types';
import { getIndicatorChartDesignOptions } from './translate-to-indicator-options';
import {
  getStackableChartDesignOptions,
  getLineChartDesignOptions,
  getPieChartDesignOptions,
  getFunnelChartDesignOptions,
  getPolarChartDesignOptions,
  getScatterChartDesignOptions,
  getAreaChartDesignOptions,
  getTreemapChartDesignOptions,
  getSunburstChartDesignOptions,
} from './translate-to-highcharts-options';

export const translateStyleOptionsToDesignOptions = (
  chartType: ChartType,
  styleOptions: StyleOptions,
  dataOptions: ChartDataOptionsInternal,
): ChartDesignOptions => {
  const hasY2Axis =
    'y' in dataOptions && Array.isArray(dataOptions.y)
      ? dataOptions.y.some((y) => (y as ValueStyle).showOnRightAxis)
      : false;

  let intermediateDesignOptions: ChartDesignOptions;
  switch (chartType) {
    case 'bar':
    case 'column':
      intermediateDesignOptions = getStackableChartDesignOptions(
        styleOptions as StackableStyleOptions,
        hasY2Axis,
      );
      break;
    case 'area':
      intermediateDesignOptions = getAreaChartDesignOptions(
        styleOptions as AreaStyleOptions,
        hasY2Axis,
      );
      break;
    case 'line':
      intermediateDesignOptions = getLineChartDesignOptions(
        styleOptions as LineStyleOptions,
        hasY2Axis,
      );
      break;
    case 'pie':
      intermediateDesignOptions = getPieChartDesignOptions(styleOptions as PieStyleOptions);
      break;
    case 'funnel':
      intermediateDesignOptions = getFunnelChartDesignOptions(styleOptions as FunnelStyleOptions);
      break;
    case 'treemap':
      intermediateDesignOptions = getTreemapChartDesignOptions(styleOptions as TreemapStyleOptions);
      break;
    case 'sunburst':
      intermediateDesignOptions = getSunburstChartDesignOptions(
        styleOptions as SunburstStyleOptions,
      );
      break;
    case 'polar':
      intermediateDesignOptions = getPolarChartDesignOptions(styleOptions as PolarStyleOptions);
      break;
    case 'indicator':
      intermediateDesignOptions = getIndicatorChartDesignOptions(
        styleOptions as IndicatorStyleOptions,
      );
      break;
    case 'scatter':
      intermediateDesignOptions = getScatterChartDesignOptions(styleOptions as ScatterStyleOptions);
      break;
  }

  const subtype =
    'subtype' in styleOptions && styleOptions.subtype ? styleOptions.subtype : 'line/basic';
  const subtypeOptions = chartSubtypeToDesignOptions[subtype];

  return {
    ...intermediateDesignOptions,
    ...subtypeOptions,
  };
};
