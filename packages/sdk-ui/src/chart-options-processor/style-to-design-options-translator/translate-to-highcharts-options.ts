/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable max-lines */
import merge from 'ts-deepmerge';
import {
  AxisLabel,
  Legend,
  SeriesLabels,
  Navigator,
  LineWidth,
  Markers,
  PolarStyleOptions,
  PieStyleOptions,
  StackableStyleOptions,
  LineStyleOptions,
  AreaStyleOptions,
  FunnelStyleOptions,
  ScatterStyleOptions,
  BaseStyleOptions,
  TreemapStyleOptions,
  SunburstStyleOptions,
  BoxplotStyleOptions,
  ScattermapStyleOptions,
} from '../../types';
import { Axis } from '../translations/axis-section';
import {
  BaseDesignOptions,
  CATEGORIES_CAPACITY,
  SCATTER_CATEGORIES_CAPACITY,
  SERIES_CAPACITY,
} from '../translations/base-design-options';
import {
  StackableChartDesignOptions,
  LineChartDesignOptions,
  PieChartDesignOptions,
  FunnelChartDesignOptions,
  PolarChartDesignOptions,
  PolarType,
  ScatterChartDesignOptions,
  AreaChartDesignOptions,
  TreemapChartDesignOptions,
  SunburstChartDesignOptions,
  BoxplotChartDesignOptions,
  ScattermapChartDesignOptions,
} from '../translations/design-options';
import { LegendPosition } from '../translations/legend-section';
import { Marker } from '../translations/marker-section';
import { PieLabels, PieType } from '../translations/pie-plot-options';
import {
  DefaultFunnelLabels,
  DefaultFunnelSize,
  DefaultFunnelType,
  DefaultFunnelDirection,
} from '../translations/funnel-plot-options';
import { StackType } from '../translations/translations-to-highcharts';
import { ValueLabel } from '../translations/value-label-section';
import { defaultScatterMarkerSize, ScatterMarkerSize } from '../translations/scatter-plot-options';

export const getLegend = (legend?: Legend): LegendPosition => {
  if (legend?.enabled) {
    return (legend.position || null) as LegendPosition;
  }
  return null;
};

const getSeriesLabels = (valueLabel: SeriesLabels): ValueLabel => {
  if (!valueLabel.enabled) return null;
  let rotation = null;
  switch (valueLabel.rotation) {
    case -45:
      rotation = 'diagonal';
      break;
    case 0:
      rotation = 'horizontal';
      break;
    case -90:
      rotation = 'vertical';
      break;
  }

  return rotation as ValueLabel;
};

const getAxisLabel = (axis: AxisLabel | undefined, defaultAxis: Axis): Axis => {
  if (!axis) return defaultAxis;
  return {
    enabled: axis.enabled,
    gridLine: axis.gridLines,
    labels: axis.labels?.enabled,
    type: axis.logarithmic ? 'logarithmic' : 'linear',
    titleEnabled: axis.title?.enabled,
    title: axis?.title?.text || null,
    min: axis.min ?? null,
    max: axis.max ?? null,
    tickInterval: axis.isIntervalEnabled && axis?.intervalJumps ? axis?.intervalJumps : null,
  };
};

const getNavigator = (navigator: Navigator | undefined): boolean => {
  return navigator?.enabled || false;
};

const getY2AxisLabel = (axisLabel: AxisLabel): Axis => {
  const axis = getAxisLabel(axisLabel, BaseDesignOptions.yAxis);
  axis.gridLine = axisLabel.templateMainYHasGridLines || false;
  return axis;
};

const getLineWidth = (lineWidth: LineWidth): number => {
  let width = 1;
  switch (lineWidth.width) {
    case 'thin':
      width = 1;
      break;
    case 'bold':
      width = 3;
      break;
    case 'thick':
      width = 5;
      break;
  }

  return width;
};

export const DefaultStackType: StackType = 'classic';
const getCartesianChartStyle = (
  styleOptions:
    | LineStyleOptions
    | AreaStyleOptions
    | StackableStyleOptions
    | PolarStyleOptions
    | BoxplotStyleOptions,
  hasY2Axis: boolean,
): LineChartDesignOptions => {
  const legend = getLegend(styleOptions.legend);
  const dataLimits = getDataLimits(styleOptions, 'cartesian');
  const valueLabel = styleOptions.seriesLabels ? getSeriesLabels(styleOptions.seriesLabels) : null;
  const xAxis = getAxisLabel(styleOptions.xAxis, BaseDesignOptions.xAxis);
  let x2Axis = null;
  if (styleOptions?.xAxis?.x2Title?.enabled && styleOptions?.xAxis?.x2Title?.text) {
    x2Axis = {
      ...BaseDesignOptions.xAxis,
      title: styleOptions.xAxis.x2Title.text,
    };
  }

  const yAxis = getAxisLabel(styleOptions.yAxis, BaseDesignOptions.yAxis);
  let y2Axis: Axis = {
    type: 'linear',
    enabled: true,
    titleEnabled: true,
    title: 'Y2 Axis title',
    gridLine: true,
    labels: true,
    min: null,
    max: null,
    tickInterval: null,
  };
  if (styleOptions.y2Axis) {
    y2Axis = { ...y2Axis, ...getY2AxisLabel(styleOptions.y2Axis) };
  }

  const autoZoom = getNavigator(styleOptions.navigator);

  return {
    ...BaseDesignOptions,
    legend,
    autoZoom,
    valueLabel,
    xAxis,
    yAxis,
    ...(hasY2Axis && y2Axis && { y2Axis }),
    ...(x2Axis && { x2Axis }),
    dataLimits,
  };
};

const getMarkers = (marker: Markers): Marker => {
  return {
    enabled: marker.enabled,
    fill: marker.fill === 'filled' ? 'full' : 'hollow',
    size: marker.size === 'small' ? 'small' : 'large',
  };
};

export const getStackableChartDesignOptions = (
  styleOptions: AreaStyleOptions | StackableStyleOptions,
  hasY2Axis: boolean,
): StackableChartDesignOptions => {
  return {
    ...getCartesianChartStyle(styleOptions, hasY2Axis),
    stackType: DefaultStackType,
  };
};

export const getLineChartDesignOptions = (
  styleOptions: LineStyleOptions,
  hasY2Axis: boolean,
): LineChartDesignOptions => {
  const style = getCartesianChartStyle(styleOptions, hasY2Axis);
  style.lineWidth = getLineWidth(styleOptions.lineWidth || { width: 'thin' });
  style.marker = getMarkers(
    styleOptions?.markers ?? { enabled: true, fill: 'filled', size: 'small' },
  );
  return style;
};

export const getAreaChartDesignOptions = (
  styleOptions: AreaStyleOptions,
  hasY2Axis: boolean,
): AreaChartDesignOptions => {
  return {
    ...getStackableChartDesignOptions(styleOptions, hasY2Axis),
    lineWidth: getLineWidth(styleOptions.lineWidth || { width: 'thin' }),
    marker: getMarkers(styleOptions?.markers ?? { enabled: true, fill: 'filled', size: 'small' }),
  };
};

const getDataLimits = (
  styleOptions: BaseStyleOptions,
  chartDataType: 'cartesian' | 'categorical' | 'scatter',
) => {
  const dataLimits = {
    seriesCapacity: chartDataType === 'categorical' ? CATEGORIES_CAPACITY : SERIES_CAPACITY,
    categoriesCapacity:
      chartDataType === 'scatter' ? SCATTER_CATEGORIES_CAPACITY : CATEGORIES_CAPACITY,
  };
  const styleDataLimits = styleOptions?.dataLimits ?? {};

  if (
    'categoriesCapacity' in styleDataLimits &&
    styleDataLimits?.categoriesCapacity !== undefined
  ) {
    dataLimits.categoriesCapacity = styleDataLimits?.categoriesCapacity;
  }

  if (styleDataLimits?.seriesCapacity !== undefined) {
    dataLimits.seriesCapacity = styleDataLimits?.seriesCapacity;
  }
  return dataLimits;
};

const DefaultPieLabels: PieLabels = {
  enabled: true,
  showCategories: true,
  showValue: true,
  showPercent: true,
  showDecimals: false,
};
export const DefaultPieType = 'classic';
export const getPieChartDesignOptions = (styleOptions: PieStyleOptions): PieChartDesignOptions => {
  const { legend, labels } = styleOptions;

  let pieLabels: PieLabels = DefaultPieLabels;
  if (labels) {
    pieLabels = {
      ...pieLabels,
      showCategories: labels.categories ?? false,
      showDecimals: labels.decimals ?? false,
      enabled: labels.enabled ?? false,
      showPercent: labels.percent ?? false,
      showValue: labels.value ?? false,
    };
  }

  const pieType: PieType = DefaultPieType;
  const convolution = styleOptions?.convolution ? styleOptions.convolution : { enabled: false };

  const dataLimits = getDataLimits(styleOptions, 'categorical');

  return {
    ...BaseDesignOptions,
    pieLabels,
    pieType,
    convolution,
    legend: getLegend(legend),
    dataLimits,
  };
};

export const getFunnelChartDesignOptions = (
  styleOptions: FunnelStyleOptions,
): FunnelChartDesignOptions => {
  const {
    funnelType = DefaultFunnelType,
    funnelSize = DefaultFunnelSize,
    funnelDirection = DefaultFunnelDirection,
    legend,
    labels,
  } = styleOptions;

  let funnelLabels = DefaultFunnelLabels;
  if (labels) {
    funnelLabels = {
      ...funnelLabels,
      showCategories: labels.categories ?? false,
      showDecimals: labels.decimals ?? false,
      enabled: labels.enabled ?? false,
      showPercent: labels.percent ?? false,
      showValue: labels.value ?? false,
    };
  }

  const dataLimits = getDataLimits(styleOptions, 'categorical');

  return {
    ...BaseDesignOptions,
    funnelSize,
    funnelType,
    funnelDirection,
    funnelLabels,
    legend: getLegend(legend),
    dataLimits,
  };
};

export const getTreemapChartDesignOptions = (
  styleOptions: TreemapStyleOptions,
): TreemapChartDesignOptions => {
  return styleOptions as TreemapChartDesignOptions;
};

export const getSunburstChartDesignOptions = (
  styleOptions: SunburstStyleOptions,
): SunburstChartDesignOptions => {
  return styleOptions as SunburstChartDesignOptions;
};

const DefaultPolarType: PolarType = 'column';
export const getPolarChartDesignOptions = (
  styleOptions: PolarStyleOptions,
): PolarChartDesignOptions => {
  return {
    ...getCartesianChartStyle(styleOptions, false),
    polarType: DefaultPolarType,
  };
};

const getScatterChartMarkerSize = (markerSize?: ScatterMarkerSize) => {
  return {
    ...defaultScatterMarkerSize,
    ...markerSize,
  };
};

export const getScatterChartDesignOptions = (
  styleOptions: ScatterStyleOptions,
): ScatterChartDesignOptions => {
  return {
    ...getCartesianChartStyle(styleOptions, false),
    lineWidth: 0,
    marker: getMarkers(styleOptions?.markers ?? { enabled: true, fill: 'filled', size: 'small' }),
    dataLimits: getDataLimits(styleOptions, 'scatter'),
    markerSize: getScatterChartMarkerSize(styleOptions.markerSize),
    legend: getLegend(styleOptions.legend),
  };
};

export const getBoxplotChartDesignOptions = (
  styleOptions: BoxplotStyleOptions,
): BoxplotChartDesignOptions => {
  return {
    ...getCartesianChartStyle(styleOptions, false),
    boxplotType: styleOptions.subtype === 'boxplot/hollow' ? 'hollow' : 'full',
  };
};

const defaultScattermapMarkers: ScattermapChartDesignOptions['markers'] = {
  fill: 'filled',
  size: {
    defaultSize: 4,
    minSize: 4,
    maxSize: 24,
  },
};

export const getScattermapChartDesignOptions = (
  styleOptions: ScattermapStyleOptions,
): ScattermapChartDesignOptions => {
  return {
    ...BaseDesignOptions,
    markers: merge(
      defaultScattermapMarkers,
      styleOptions.markers || {},
    ) as ScattermapChartDesignOptions['markers'],
  };
};
