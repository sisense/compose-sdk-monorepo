import cloneDeep from 'lodash-es/cloneDeep';
import merge from 'lodash-es/merge';

import { CALENDAR_HEATMAP_DEFAULTS } from '@/domains/visualizations/components/chart/restructured-charts/highchart-based-charts/calendar-heatmap-chart/constants.js';
import { DynamicChartType } from '@/domains/visualizations/core/chart-options-processor/translations/types.js';
import {
  AreamapStyleOptions,
  AreaRangeStyleOptions,
  AreaStyleOptions,
  BoxplotStyleOptions,
  CalendarHeatmapStyleOptions,
  ChartStyleOptions,
  FunnelStyleOptions,
  IndicatorStyleOptions,
  LineStyleOptions,
  PieStyleOptions,
  PivotTableStyleOptions,
  PolarStyleOptions,
  ScattermapStyleOptions,
  ScatterStyleOptions,
  StackableStyleOptions,
  SunburstStyleOptions,
  TableStyleOptions,
  TreemapStyleOptions,
} from '@/types.js';

export type WidgetStyleOptions = ChartStyleOptions | PivotTableStyleOptions | TableStyleOptions;

export const INDICATOR_DEFAULT_STYLE_OPTIONS: IndicatorStyleOptions = {
  subtype: 'indicator/numeric',
  numericSubtype: 'numericSimple',
  skin: 'vertical',
  indicatorComponents: {
    title: {
      shouldBeShown: true,
      text: undefined,
    },
    secondaryTitle: {
      text: '',
    },
    ticks: {
      shouldBeShown: false,
    },
    labels: {
      shouldBeShown: false,
    },
  },
};

export const CARTESIAN_CHARTS_DEFAULT_STYLE_OPTIONS = {
  legend: {
    enabled: true,
    position: 'bottom',
  },
  xAxis: {
    enabled: true,
    gridLines: true,
    intervalJumps: null as unknown as number,
    isIntervalEnabled: true,
    min: undefined,
    max: undefined,
    logarithmic: undefined,
    title: {
      enabled: false,
      text: null as unknown as string,
    },
    labels: {
      enabled: true,
    },
  },
  yAxis: {
    enabled: false,
    gridLines: true,
    intervalJumps: null as unknown as number,
    isIntervalEnabled: false,
    min: undefined,
    max: undefined,
    logarithmic: false,
    title: {
      enabled: false,
      text: null as unknown as string,
    },
    labels: {
      enabled: true,
    },
  },
  y2Axis: {
    enabled: true,
    gridLines: false,
    intervalJumps: undefined,
    isIntervalEnabled: true,
    min: undefined,
    max: undefined,
    logarithmic: false,
    title: {
      enabled: false,
      text: undefined,
    },
    labels: {
      enabled: true,
    },
  },
  seriesLabels: {
    enabled: false,
    rotation: 0,
    showValue: false,
    showPercentage: false,
  },
  dataLimits: {
    seriesCapacity: 50,
    categoriesCapacity: 100000,
  },
  navigator: {
    enabled: true,
  },
};

export const LINE_DEFAULT_STYLE_OPTIONS: Partial<LineStyleOptions> = {
  subtype: 'line/basic',
  lineWidth: {
    width: 'bold',
  },
  markers: {
    enabled: false,
    size: 'small',
    fill: 'filled',
  },
};

export const AREA_DEFAULT_STYLE_OPTIONS: Partial<AreaStyleOptions> = {
  subtype: 'area/basic',
  lineWidth: {
    width: 'bold',
  },
  markers: {
    enabled: false,
    size: 'small',
    fill: 'filled',
  },
};

export const BAR_DEFAULT_STYLE_OPTIONS: Partial<StackableStyleOptions> = {
  subtype: 'bar/classic',
};

export const COLUMN_DEFAULT_STYLE_OPTIONS: Partial<StackableStyleOptions> = {
  subtype: 'column/classic',
};

export const POLAR_DEFAULT_STYLE_OPTIONS: Partial<PolarStyleOptions> = {
  subtype: 'polar/column',
  yAxis: {
    enabled: true,
    gridLines: true,
    intervalJumps: undefined,
    isIntervalEnabled: false,
    min: undefined,
    max: undefined,
    logarithmic: false,
    labels: {
      enabled: true,
    },
    title: {
      enabled: false,
    },
  },
  dataLimits: {
    seriesCapacity: 50,
    categoriesCapacity: 200,
  },
};

function buildCartesian<T>(unique: Partial<T>): T {
  return merge({}, CARTESIAN_CHARTS_DEFAULT_STYLE_OPTIONS, unique) as T;
}

export const PIE_DEFAULT_STYLE_OPTIONS: PieStyleOptions = {
  subtype: 'pie/classic',
  legend: {
    enabled: false,
    position: 'left',
  },
  labels: {
    enabled: true,
    categories: true,
    percent: true,
    decimals: false,
    value: false,
  },
  dataLimits: {
    seriesCapacity: 100000,
    categoriesCapacity: undefined,
  },
  convolution: {
    enabled: true,
    independentSlicesCount: 7,
    minimalIndependentSlicePercentage: 3,
    selectedConvolutionType: 'byPercentage',
  },
};

export const FUNNEL_DEFAULT_STYLE_OPTIONS: FunnelStyleOptions = {
  legend: {
    enabled: false,
    position: 'left',
  },
  seriesLabels: {
    enabled: true,
    showCategory: true,
    showPercentage: true,
    showPercentDecimals: false,
    showValue: true,
  },
  funnelSize: 'regular',
  funnelType: 'regular',
  funnelDirection: 'regular',
};

export const PIVOT_DEFAULT_STYLE_OPTIONS: PivotTableStyleOptions = {
  rowsPerPage: 25,
  isAutoHeight: true,
  rowHeight: null as unknown as number,
  alternatingRowsColor: true,
  alternatingColumnsColor: false,
  headersColor: false,
  membersColor: false,
  totalsColor: false,
};

export const TREEMAP_DEFAULT_STYLE_OPTIONS: TreemapStyleOptions = {
  labels: {
    category: [
      {
        enabled: true,
      },
      {
        enabled: true,
      },
      {
        enabled: true,
      },
    ],
  },
  tooltip: {
    mode: 'value',
  },
};

export const CALENDAR_HEATMAP_DEFAULT_STYLE_OPTIONS: CalendarHeatmapStyleOptions = {
  subtype: CALENDAR_HEATMAP_DEFAULTS.SUBTYPE,
  viewType: 'month',
  startOfWeek: 'sunday',
  cellLabels: {
    enabled: true,
  },
  dayLabels: {
    enabled: true,
  },
  monthLabels: {
    enabled: true,
  },
  weekends: {
    days: [],
    cellColor: '#e6e6e6',
    hideValues: true,
  },
};

export const SUNBURST_DEFAULT_STYLE_OPTIONS: SunburstStyleOptions = {
  legend: {
    enabled: true,
    position: 'bottom',
  },
  tooltip: {
    mode: 'value',
  },
};

export const SCATTER_DEFAULT_STYLE_OPTIONS: ScatterStyleOptions = {
  legend: {
    enabled: true,
    position: 'bottom',
  },
  xAxis: {
    enabled: true,
    gridLines: true,
    intervalJumps: null as unknown as number,
    isIntervalEnabled: false,
    min: undefined,
    max: undefined,
    logarithmic: null as unknown as boolean,
    title: {
      enabled: false,
      text: null as unknown as string,
    },
    labels: {
      enabled: true,
    },
  },
  yAxis: {
    enabled: true,
    gridLines: true,
    intervalJumps: null as unknown as number,
    isIntervalEnabled: false,
    min: undefined,
    max: undefined,
    logarithmic: null as unknown as boolean,
    title: {
      enabled: false,
      text: null as unknown as string,
    },
    labels: {
      enabled: true,
    },
  },
  dataLimits: {
    seriesCapacity: 50,
    categoriesCapacity: undefined,
  },
  seriesLabels: {
    enabled: false,
    rotation: 0,
    showValue: false,
    showPercentage: false,
  },
  markerSize: {
    scatterDefaultSize: 10,
    scatterBubbleMinSize: 10,
    scatterBubbleMaxSize: 10,
  },
} as unknown as ScatterStyleOptions;

export const TABLE_DEFAULT_STYLE_OPTIONS: TableStyleOptions = {
  header: {
    color: {
      enabled: false,
    },
  },
  rows: {
    alternatingColor: {
      enabled: false,
    },
  },
  columns: {
    alternatingColor: {
      enabled: false,
    },
  },
};

export const AREARANGE_DEFAULT_STYLE_OPTIONS: AreaRangeStyleOptions = {
  lineWidth: { width: 'thin' },
  markers: { enabled: true, fill: 'filled', size: 'small' },
};

export const SCATTERMAP_DEFAULT_STYLE_OPTIONS: ScattermapStyleOptions = {
  subtype: 'scattermap',
  markers: {
    fill: 'filled',
    size: {
      defaultSize: 4,
      minSize: 4,
      maxSize: 24,
    },
  },
} as unknown as ScattermapStyleOptions;

export const AREAMAP_DEFAULT_STYLE_OPTIONS: AreamapStyleOptions = {
  mapType: 'world',
};

export const BOXPLOT_DEFAULT_STYLE_OPTIONS: BoxplotStyleOptions = {
  subtype: 'boxplot/full',
  legend: {
    enabled: true,
    position: 'bottom',
  },
  xAxis: {
    enabled: true,
    gridLines: true,
    intervalJumps: undefined,
    isIntervalEnabled: true,
    min: undefined,
    max: undefined,
    logarithmic: undefined,
    title: {
      enabled: false,
      text: undefined,
    },
    labels: {
      enabled: true,
    },
  },
  yAxis: {
    enabled: true,
    gridLines: true,
    intervalJumps: undefined,
    isIntervalEnabled: true,
    min: undefined,
    max: undefined,
    logarithmic: undefined,
    title: {
      enabled: false,
      text: undefined,
    },
    labels: {
      enabled: true,
    },
  },
  seriesLabels: {
    enabled: false,
    rotation: 0,
    showValue: false,
    showPercentage: false,
  },
  dataLimits: {
    seriesCapacity: 50,
    categoriesCapacity: 100000,
  },
  navigator: {
    enabled: true,
  },
};

export function getWidgetTypeDefaultStyleOptions(
  chartType: DynamicChartType | 'pivot' | 'pivot2',
): WidgetStyleOptions {
  switch (chartType) {
    case 'indicator':
      return cloneDeep(INDICATOR_DEFAULT_STYLE_OPTIONS);
    case 'line':
      return buildCartesian<LineStyleOptions>(LINE_DEFAULT_STYLE_OPTIONS);
    case 'area':
      return buildCartesian<AreaStyleOptions>(AREA_DEFAULT_STYLE_OPTIONS);
    case 'bar':
      return buildCartesian<StackableStyleOptions>(BAR_DEFAULT_STYLE_OPTIONS);
    case 'column':
      return buildCartesian<StackableStyleOptions>(COLUMN_DEFAULT_STYLE_OPTIONS);
    case 'polar':
      return buildCartesian<PolarStyleOptions>(POLAR_DEFAULT_STYLE_OPTIONS);
    case 'pie':
      return cloneDeep(PIE_DEFAULT_STYLE_OPTIONS);
    case 'funnel':
      return cloneDeep(FUNNEL_DEFAULT_STYLE_OPTIONS);
    case 'treemap':
      return cloneDeep(TREEMAP_DEFAULT_STYLE_OPTIONS);
    case 'calendar-heatmap':
      return cloneDeep(CALENDAR_HEATMAP_DEFAULT_STYLE_OPTIONS);
    case 'sunburst':
      return cloneDeep(SUNBURST_DEFAULT_STYLE_OPTIONS);
    case 'scatter':
      return cloneDeep(SCATTER_DEFAULT_STYLE_OPTIONS);
    case 'scattermap':
      return cloneDeep(SCATTERMAP_DEFAULT_STYLE_OPTIONS);
    case 'areamap':
      return cloneDeep(AREAMAP_DEFAULT_STYLE_OPTIONS);
    case 'boxplot':
      return cloneDeep(BOXPLOT_DEFAULT_STYLE_OPTIONS);
    case 'table':
      return cloneDeep(TABLE_DEFAULT_STYLE_OPTIONS);
    case 'pivot':
      return cloneDeep(PIVOT_DEFAULT_STYLE_OPTIONS);
    case 'pivot2':
      return {};
    case 'image':
      return {};
    default:
      return {};
  }
}
