import {
  PolarStyleOptions,
  PieStyleOptions,
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
  ScattermapStyleOptions,
} from '../../types';
import { DesignOptions } from '../translations/types';
import { chartSubtypeToDesignOptions } from '../subtype-to-design-options';
import {
  CartesianChartDataOptionsInternal,
  ChartDataOptionsInternal,
  ValueStyle,
} from '../../chart-data-options/types';
import { getIndicatorChartDesignOptions } from './translate-to-indicator-options';
import {
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
    case 'area':
      intermediateDesignOptions = getAreaChartDesignOptions(
        styleOptions as AreaStyleOptions,
        dataOptions as CartesianChartDataOptionsInternal,
        hasY2Axis,
      );
      break;
    case 'arearange':
    case 'line':
      intermediateDesignOptions = getLineChartDesignOptions(
        styleOptions as LineStyleOptions,
        dataOptions as CartesianChartDataOptionsInternal,
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
        dataOptions as CartesianChartDataOptionsInternal,
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
