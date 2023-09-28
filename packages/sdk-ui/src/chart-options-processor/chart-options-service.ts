/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable max-params */
/* eslint-disable max-lines */
import cloneDeep from 'lodash/cloneDeep';
import type { Options, DrilldownOptions } from '@sisense/sisense-charts';
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
import { ChartType, OptionsWithAlerts, CompleteThemeSettings } from '../types';
import { getCartesianChartOptions } from './cartesian-chart-options';
import { getCategoricalChartOptions } from './category-chart-options';
import { getScatterChartOptions } from './scatter-chart-options';
import {
  CartesianChartDataOptionsInternal,
  ChartDataOptionsInternal,
} from '../chart-data-options/types';
import { ScatterBubbleOptions } from './translations/scatter-plot-options';

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
 * @param themeSettings -
 * @param dateFormatter
 */
export const highchartsOptionsService = (
  chartData: ChartData,
  chartType: ChartType,
  chartDesignOptions: ChartDesignOptions,
  dataOptions: ChartDataOptionsInternal,
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
    default:
      // TODO: "typescript exhaustive union type switch" so this is a compile error
      throw new Error('Unexpected chart type');
  }
};

// temp until we implement series colors
export const colorChineseSilver = '#CCCCCC';
export const colorWhite = '#FFFFFF';
export const DEFAULT_SERIES_COLORS = [
  '#00cee6',
  '#9b9bd7',
  '#6eda55',
  '#fc7570',
  '#fbb755',
  '#218a8c',
  '#08e5ff',
  '#b3b3f7',
  '#7efb62',
  '#ff8a87',
  '#ffc26a',
  '#279fa1',
];

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
};

type ChartPlotOptions = {
  dataLabels?: ValueLabelSettings;
  groupPadding?: number;
  pointPadding?: number;
  pointPlacement?: null;
  animation?: boolean;
  shadow: boolean;
  marker?: MarkerSettings;
  borderWidth?: number;
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
    };
    spacing?: number[];
    marginTop?: number;
    alignTicks?: boolean;
    polar: boolean;
    animation?: {
      duration?: number;
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
  series: { type: HighchartsType; dataGrouping: { enabled: boolean } };
  enabled: boolean;
  margin: number;
  height: number;
  xAxis: AxisSettings;
  handles: {
    symbols: string[];
    backgroundColor: string;
    borderColor: string;
  };
  maskInside: boolean;
  maskFill: string;
  outlineColor: string;
  outlineWidth: number;
  threshold?: number;
  tooltipFormatter?: (min: number, max: number) => { left: string; right: string };
};

const DEFAULT_STYLE_OPTIONS = {
  legend: {
    enabled: true,
    position: 'bottom',
  },
  navigator: {
    enabled: true,
  },
  markers: { enabled: true, fill: 'hollow', size: 'small' },
  seriesLabels: { enabled: false, rotation: 0 },
  xAxis: {
    enabled: true,
    gridLines: true,
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
    enabled: false,
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
