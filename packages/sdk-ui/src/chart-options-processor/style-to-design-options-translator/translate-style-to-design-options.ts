import {
  PolarStyleOptions,
  PieStyleOptions,
  StackableStyleOptions,
  LineStyleOptions,
  FunnelStyleOptions,
  ChartType,
  ChartStyleOptions,
  IndicatorStyleOptions,
  ScatterStyleOptions,
  AreaStyleOptions,
  TreemapStyleOptions,
  SunburstStyleOptions,
  BoxplotStyleOptions,
  AreamapStyleOptions,
  ScattermapStyleOptions,
} from '../../types';
import { DesignOptions } from '../translations/types';
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
  getBoxplotChartDesignOptions,
  getScattermapChartDesignOptions,
} from './translate-to-highcharts-options';
import { TranslatableError } from '../../translation/translatable-error';
import { getAreamapChartDesignOptions } from './translate-to-areamap-options';

export const translateStyleOptionsToDesignOptions = (
  chartType: ChartType,
  styleOptions: ChartStyleOptions,
  dataOptions: ChartDataOptionsInternal,
): DesignOptions => {
  const hasY2Axis =
    'y' in dataOptions && Array.isArray(dataOptions.y)
      ? dataOptions.y.some((y) => (y as ValueStyle).showOnRightAxis)
      : false;

  let intermediateDesignOptions: DesignOptions;
  switch (chartType) {
    case 'bar':
    case 'column':
      intermediateDesignOptions = getStackableChartDesignOptions(
        styleOptions as StackableStyleOptions,
        dataOptions,
        hasY2Axis,
        chartType,
      );
      break;
    case 'area':
      intermediateDesignOptions = getAreaChartDesignOptions(
        styleOptions as AreaStyleOptions,
        dataOptions,
        hasY2Axis,
      );
      break;
    case 'line':
      intermediateDesignOptions = getLineChartDesignOptions(
        styleOptions as LineStyleOptions,
        dataOptions,
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
      intermediateDesignOptions = getPolarChartDesignOptions(
        styleOptions as PolarStyleOptions,
        dataOptions,
      );
      break;
    case 'indicator':
      intermediateDesignOptions = getIndicatorChartDesignOptions(
        styleOptions as IndicatorStyleOptions,
      );
      break;
    case 'scatter':
      intermediateDesignOptions = getScatterChartDesignOptions(styleOptions as ScatterStyleOptions);
      break;
    case 'boxplot':
      intermediateDesignOptions = getBoxplotChartDesignOptions(styleOptions as BoxplotStyleOptions);
      break;
    case 'areamap':
      intermediateDesignOptions = getAreamapChartDesignOptions(styleOptions as AreamapStyleOptions);
      break;
    case 'scattermap':
      intermediateDesignOptions = getScattermapChartDesignOptions(
        styleOptions as ScattermapStyleOptions,
      );
      break;
    default:
      throw new TranslatableError('errors.chartTypeNotSupported', { chartType });
  }

  const subtype =
    'subtype' in styleOptions && styleOptions.subtype ? styleOptions.subtype : 'line/basic';
  const subtypeOptions = chartSubtypeToDesignOptions[subtype];

  return {
    ...intermediateDesignOptions,
    ...subtypeOptions,
  };
};
