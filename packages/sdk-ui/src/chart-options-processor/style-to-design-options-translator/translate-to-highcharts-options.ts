/* eslint-disable @typescript-eslint/no-use-before-define */
import merge from 'ts-deepmerge';
import {
  AxisLabel,
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
  BaseAxisStyleOptions,
  ChartStyleOptions,
  ChartType,
} from '@/types';
import { Axis } from '../translations/axis-section';
import { chartSubtypeToDesignOptions } from '../subtype-to-design-options';
import {
  BaseDesignOptions,
  CATEGORIES_CAPACITY,
  SCATTER_CATEGORIES_CAPACITY,
  PIE_SERIES_CAPACITY,
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
  BaseDesignOptionsType,
} from '../translations/design-options';
import { Marker } from '../translations/marker-section';
import { PieLabels, PieType } from '../translations/pie-plot-options';
import {
  DefaultFunnelLabels,
  DefaultFunnelSize,
  DefaultFunnelType,
  DefaultFunnelDirection,
} from '../translations/funnel-plot-options';
import { StackType } from '../translations/translations-to-highcharts';
import { defaultScatterMarkerSize, ScatterMarkerSize } from '../translations/scatter-plot-options';
import { getDefaultStyleOptions } from '../chart-options-service';
import {
  extendStyleOptionsWithDefaults,
  getDesignOptionsPerSeries,
} from './prepare-design-options';
import { CartesianChartType, SeriesDesignOptions } from '../translations/types';
import { CartesianChartDataOptionsInternal } from '@/chart-data-options/types';
import { withYAxisNormalizationForPolar } from '../cartesian/utils/axis/axis-builders';

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

const getNavigator = (navigator: Navigator | undefined): Navigator => {
  return navigator?.enabled
    ? {
        enabled: true,
        scrollerLocation: navigator?.scrollerLocation,
      }
    : { enabled: false };
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
export const getCartesianChartStyle = (
  styleOptions: BaseStyleOptions & BaseAxisStyleOptions,
  shouldHaveY2Axis: boolean,
): BaseDesignOptionsType => {
  const dataLimits = getCartesianDataLimits();
  const xAxis = getAxisLabel(styleOptions.xAxis, BaseDesignOptions.xAxis);
  let x2Axis = null;
  if (styleOptions?.xAxis?.x2Title?.enabled && styleOptions?.xAxis?.x2Title?.text) {
    x2Axis = {
      ...BaseDesignOptions.xAxis,
      title: styleOptions.xAxis.x2Title.text,
    };
  }

  const yAxis = getAxisLabel(styleOptions.yAxis, BaseDesignOptions.yAxis);
  const y2Axis: Axis | undefined =
    shouldHaveY2Axis && styleOptions.y2Axis
      ? {
          type: 'linear',
          enabled: true,
          titleEnabled: true,
          title: 'Y2 Axis title',
          gridLine: true,
          labels: true,
          min: null,
          max: null,
          tickInterval: null,
          ...getY2AxisLabel(styleOptions.y2Axis),
        }
      : undefined;

  const autoZoom = getNavigator(styleOptions.navigator);

  return {
    ...BaseDesignOptions,
    legend: styleOptions.legend,
    autoZoom,
    ...(styleOptions.seriesLabels && { seriesLabels: styleOptions.seriesLabels }),
    xAxis,
    yAxis,
    ...(y2Axis && { y2Axis }),
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
  dataOptions: CartesianChartDataOptionsInternal,
  hasY2Axis: boolean,
  chartType: CartesianChartType,
): StackableChartDesignOptions => {
  const cartesianDesignOptions = getCartesianChartStyle(styleOptions, hasY2Axis);
  const styleOptionsWithDefaults = extendStyleOptionsWithDefaults(
    styleOptions ?? {},
    getDefaultStyleOptions(),
  );
  const designPerSeries = getDesignOptionsPerSeries(
    dataOptions,
    chartType,
    styleOptionsWithDefaults,
  );
  return {
    ...cartesianDesignOptions,
    designPerSeries,
    stackType: DefaultStackType,
    showTotal: styleOptions.totalLabels?.enabled ?? false,
    totalLabelRotation: styleOptions.totalLabels?.rotation ?? 0,
  };
};

export const getSeriesChartDesignOptions = (
  chartType: ChartType,
  styleOptions: ChartStyleOptions,
): SeriesDesignOptions => {
  const seriesDesignOptions = getCartesianChartStyle(
    styleOptions as LineStyleOptions,
    false,
  ) as SeriesDesignOptions;
  if (chartType === 'line') {
    const lineStyleOptions = styleOptions as LineStyleOptions;

    if (lineStyleOptions.line) {
      seriesDesignOptions.line = {
        width:
          lineStyleOptions.line?.width ??
          getLineWidth(lineStyleOptions.lineWidth ?? { width: 'bold' }),
        dashStyle: lineStyleOptions.line?.dashStyle,
        endCap: lineStyleOptions.line?.endCap,
        shadow: lineStyleOptions.line?.shadow,
      };
    }

    seriesDesignOptions.marker = getMarkers(
      lineStyleOptions?.markers ?? { enabled: true, fill: 'filled', size: 'small' },
    );

    if (lineStyleOptions.subtype === 'line/step') {
      (seriesDesignOptions as LineChartDesignOptions).step =
        lineStyleOptions.stepPosition || 'left';
    }
  }
  return seriesDesignOptions;
};

export const getLineChartDesignOptions = (
  styleOptions: LineStyleOptions,
  dataOptions: CartesianChartDataOptionsInternal,
  hasY2Axis: boolean,
): LineChartDesignOptions => {
  const style = getCartesianChartStyle(styleOptions, hasY2Axis);
  style.marker = getMarkers(
    styleOptions?.markers ?? { enabled: true, fill: 'filled', size: 'small' },
  );
  const styleOptionsWithDefaults = extendStyleOptionsWithDefaults(
    styleOptions ?? {},
    getDefaultStyleOptions(),
  );
  const designPerSeries = getDesignOptionsPerSeries(dataOptions, 'line', styleOptionsWithDefaults);

  const result: LineChartDesignOptions = {
    ...style,
    designPerSeries,
    line: {
      width: styleOptions.line?.width ?? getLineWidth(styleOptions.lineWidth ?? { width: 'bold' }),
      dashStyle: styleOptions.line?.dashStyle,
      endCap: styleOptions.line?.endCap,
      shadow: styleOptions.line?.shadow,
    },
  };

  if (styleOptions.subtype === 'line/step') {
    result.step = styleOptions.stepPosition || 'left';
  }

  return result;
};

export const getAreaChartDesignOptions = (
  styleOptions: AreaStyleOptions,
  dataOptions: CartesianChartDataOptionsInternal,
  hasY2Axis: boolean,
): AreaChartDesignOptions => {
  return {
    ...getStackableChartDesignOptions(styleOptions, dataOptions, hasY2Axis, 'area'),
    marker: getMarkers(styleOptions?.markers ?? { enabled: true, fill: 'filled', size: 'small' }),
    line: {
      width: styleOptions.line?.width ?? getLineWidth(styleOptions.lineWidth ?? { width: 'thin' }),
      dashStyle: styleOptions.line?.dashStyle,
      endCap: styleOptions.line?.endCap,
      shadow: styleOptions.line?.shadow,
    },
  };
};

const getDataLimits = (
  styleOptions: BaseStyleOptions,
  chartDataType: 'categorical' | 'pie' | 'scatter',
) => {
  const dataLimits = {
    seriesCapacity:
      chartDataType === 'categorical'
        ? CATEGORIES_CAPACITY
        : chartDataType === 'pie'
        ? PIE_SERIES_CAPACITY
        : SERIES_CAPACITY,
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

function getCartesianDataLimits(): {
  seriesCapacity: number;
  categoriesCapacity: number;
} {
  return {
    seriesCapacity: SERIES_CAPACITY,
    categoriesCapacity: CATEGORIES_CAPACITY,
  };
}

const DefaultPieLabels: PieLabels = {
  enabled: true,
  showCategories: true,
  showValue: true,
  showPercent: true,
  showDecimals: false,
};
export const DefaultPieType = 'classic';
export const getPieChartDesignOptions = (styleOptions: PieStyleOptions): PieChartDesignOptions => {
  const { legend, labels, subtype } = styleOptions;

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

  // Determine pie type from subtype, falling back to default
  const subtypeDesignOptions = subtype ? chartSubtypeToDesignOptions[subtype] : undefined;
  const pieType: PieType = subtypeDesignOptions?.pieType || DefaultPieType;

  const convolution = styleOptions?.convolution ? styleOptions.convolution : { enabled: false };

  const dataLimits = getDataLimits(styleOptions, 'pie');

  return {
    ...BaseDesignOptions,
    pieLabels,
    pieType,
    convolution,
    legend,
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
    legend,
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
  dataOptions: CartesianChartDataOptionsInternal,
): PolarChartDesignOptions => {
  const style = getCartesianChartStyle(styleOptions, false);
  const styleOptionsWithDefaults = extendStyleOptionsWithDefaults(
    styleOptions ?? {},
    getDefaultStyleOptions(),
  );
  const designPerSeries = getDesignOptionsPerSeries(dataOptions, 'polar', styleOptionsWithDefaults);

  const designOptionsBase = {
    ...style,
    polarType: DefaultPolarType,
    designPerSeries,
  };

  // Apply polar-specific Y-axis normalization at design options level
  // This disables Y-axis titles which are not meaningful in polar coordinate system
  return withYAxisNormalizationForPolar(designOptionsBase);
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
    legend: styleOptions.legend,
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
