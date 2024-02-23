/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable max-params */
/* eslint-disable max-lines */
import cloneDeep from 'lodash/cloneDeep';
import type {
  Options,
  DrilldownOptions,
  SeriesLegendItemClickCallbackFunction,
} from '@sisense/sisense-charts';
import { TFunction } from '@sisense/sdk-common';
import { ChartData } from '../chart-data/types';
import { ChartDesignOptions } from './translations/types';
import { LegendSettings } from './translations/legend-section';
import { ValueLabelSettings } from './translations/value-label-section';
import { MarkerSettings } from './translations/marker-section';
import { AxisSettings } from './translations/axis-section';
import { HighchartsType, HighchartsSeriesValues } from './translations/translations-to-highcharts';
import { TooltipSettings } from './tooltip';
import { PieOptions } from './translations/pie-plot-options';
import { FunnelOptions } from './translations/funnel-plot-options';
import {
  ChartType,
  OptionsWithAlerts,
  CompleteThemeSettings,
  ChartStyleOptions,
  HighchartsSelectEvent,
} from '../types';
import { getCartesianChartOptions } from './cartesian-chart-options';
import { getCategoricalChartOptions } from './category-chart-options';
import { getScatterChartOptions } from './scatter-chart-options';
import {
  BoxplotChartDataOptionsInternal,
  CartesianChartDataOptionsInternal,
  ChartDataOptionsInternal,
} from '../chart-data-options/types';
import { ScatterBubbleOptions } from './translations/scatter-plot-options';
import { getBoxplotChartOptions } from './boxplot-chart-options';

// Notes: extends type by recreating it via `Pick` in order to force IntelliSense to use it as target type.
/**
 * Highcharts options
 *
 * @internal
 */
export type HighchartsOptions = Pick<Options, keyof Options>;

/**
 * Convert intermediate chart data, data options, and design options
 * into pure highcharts config data.
 *
 * @param chartData - the data for the chart in an intermediate format
 * @param chartType -
 * @param chartDesignOptions -
 * @param dataOptions -
 * @param translate - translation function
 * @param themeSettings -
 * @param dateFormatter
 */
export const highchartsOptionsService = (
  chartData: ChartData,
  chartType: ChartType,
  chartDesignOptions: ChartDesignOptions,
  dataOptions: ChartDataOptionsInternal,
  translate: TFunction,
  themeSettings?: CompleteThemeSettings,
  dateFormatter?: (date: Date, format: string) => string,
): OptionsWithAlerts<HighchartsOptionsInternal> => {
  switch (chartData.type) {
    case 'cartesian': {
      return getCartesianChartOptions(
        chartData,
        chartType,
        chartDesignOptions,
        dataOptions as CartesianChartDataOptionsInternal,
        themeSettings,
        dateFormatter,
      );
    }
    case 'categorical': {
      return getCategoricalChartOptions(
        chartData,
        chartType,
        chartDesignOptions,
        dataOptions,
        themeSettings,
      );
    }
    case 'scatter': {
      return getScatterChartOptions(
        chartData,
        chartType,
        chartDesignOptions,
        dataOptions,
        themeSettings,
      );
    }
    case 'boxplot': {
      return getBoxplotChartOptions(
        chartData,
        chartDesignOptions,
        dataOptions as BoxplotChartDataOptionsInternal,
        translate,
      );
    }
    default:
      // TODO: "typescript exhaustive union type switch" so this is a compile error
      throw new Error('Unexpected chart type');
  }
};

export type SeriesType = HighchartsSeriesValues & {
  index?: number;
  animation?: boolean;
  showInNavigator?: boolean;
  showInLegend?: boolean;
  stickyTracking?: boolean;
  boostThreshold?: number;
  turboThreshold?: number;
  color?: string;
  yAxis?: number;
  marker?: MarkerSettings;
  type?: string;
  id?: string;
  medianWidth?: number;
  maxPointWidth?: number;
  minPointWidth?: number;
  whiskerWidth?: number;
  whiskerLength?: number | string;
  fillOpacity?: number;
  strokeOpacity?: number;
  legendIndex?: number;
};

type ChartPlotOptions = {
  dataLabels?: ValueLabelSettings;
  groupPadding?: number;
  pointPadding?: number;
  pointPlacement?: null;
  animation?: boolean;
  shadow?: boolean;
  marker?: MarkerSettings;
  borderWidth?: number;
  className?: string;
  events?: {
    legendItemClick?: SeriesLegendItemClickCallbackFunction;
  };
  states?: {
    inactive?: {
      enabled?: boolean;
      opacity?: number;
    };
  };
};

export type Stacking = 'normal' | 'percent';

export type PlotOptions = {
  series: {
    lineWidth?: number;
    dataLabels?: ValueLabelSettings;
    marker?: MarkerSettings;
    stacking?: Stacking;
    stickyTracking?: boolean;
    groupPadding?: number;
    pointPadding?: number;
    grouping?: boolean;
    states?: {
      select?: {
        color?: string | null;
        opacity?: number;
        borderColor?: string;
      };
    };
    allowPointSelect?: boolean;
    boostThreshold?: number;
    turboThreshold?: number;
    softThreshold?: boolean;
    fillOpacity?: number;
    connectNulls?: boolean;
    animation?: {
      duration?: number;
    };
  };
  line?: ChartPlotOptions;
  area?: ChartPlotOptions;
  bar?: ChartPlotOptions;
  column?: ChartPlotOptions;
  pie?: PieOptions;
  funnel?: FunnelOptions;
  bubble?: ScatterBubbleOptions;
  sunburst?: ChartPlotOptions;
  boxplot?: ChartPlotOptions;
  scatter?: ChartPlotOptions;
};

/**
 * Highcharts options internal
 */
export type HighchartsOptionsInternal = {
  chart: {
    type: HighchartsType;
    renderTo?: string; // DOM element id
    events?: {
      load?: () => void;
      redraw?: () => void;
      selection?: (nativeEvent: HighchartsSelectEvent) => void;
    };
    spacing?: number[];
    marginTop?: number;
    alignTicks?: boolean;
    polar: boolean;
    animation?: {
      duration?: number;
    };
    zooming?: {
      type: string;
    };
  };
  title?: {
    text: string | null;
  };
  subtitle?: {
    text: string | null;
  };
  series: SeriesType[];
  xAxis?: AxisSettings[];
  yAxis?: AxisSettings[];
  legend?: LegendSettings;
  plotOptions?: PlotOptions;
  navigator?: Navigator | { enabled: boolean };
  tooltip?: TooltipSettings;
  boost?: { useGPUTranslations: boolean; usePreAllocated: boolean };
  credits?: { enabled: boolean };
  exporting?: { enabled: boolean };
  drilldown?: DrilldownOptions;
};

export type Style = {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  textOutline?: string;
  pointerEvents?: string;
  textOverflow?: string;
  width?: string;
};

type Navigator = {
  series: {
    type: HighchartsType;
    dataGrouping: { enabled: boolean };
    color?: string;
  };
  enabled: boolean;
  margin: number;
  height: number;
  xAxis: AxisSettings;
  handles: {
    symbols?: string[];
    backgroundColor?: string;
    borderColor?: string;
  };
  maskInside: boolean;
  maskFill: string;
  outlineColor: string;
  outlineWidth: number;
  threshold?: number;
  tooltipFormatter?: (min: number, max: number) => { left: string; right: string };
};

const DEFAULT_STYLE_OPTIONS: ChartStyleOptions = {
  legend: {
    enabled: true,
    position: 'bottom',
  },
  navigator: {
    enabled: true,
  },
  markers: { enabled: false, fill: 'filled', size: 'small' },
  seriesLabels: { enabled: false, rotation: 0 },
  xAxis: {
    enabled: true,
    gridLines: false,
    isIntervalEnabled: false,
    labels: {
      enabled: true,
    },
    logarithmic: false,
    title: {
      enabled: false,
      text: 'X Axis title',
    },
  },
  yAxis: {
    enabled: true,
    gridLines: true,
    isIntervalEnabled: false,
    labels: {
      enabled: true,
    },
    logarithmic: false,
    title: {
      enabled: false,
      text: 'Y Axis title',
    },
  },
  y2Axis: {
    enabled: true,
    gridLines: true,
    isIntervalEnabled: false,
    labels: {
      enabled: true,
    },
    logarithmic: false,
    title: {
      enabled: false,
      text: 'Y2 Axis title',
    },
  },
  convolution: {
    enabled: false,
    selectedConvolutionType: 'byPercentage',
    minimalIndependentSlicePercentage: 3,
    independentSlicesCount: 7,
  },
  labels: {
    categories: true,
    enabled: true,
    percent: true,
    decimals: false,
    value: false,
  },
} as const;

/**
 * Returns default style options, which can be used as base for custom style options.
 *
 * @returns Style options object
 */
export const getDefaultStyleOptions = (): typeof DEFAULT_STYLE_OPTIONS =>
  cloneDeep(DEFAULT_STYLE_OPTIONS);
