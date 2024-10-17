import { WidgetContainerStyleOptions } from '../types';
import { LEGACY_DESIGN_TYPES } from './../themes/legacy-design-settings';
import { BaseJaql, Jaql, JaqlDataSource, JaqlSortDirection } from '@sisense/sdk-data';
import { HierarchyId } from '@/models/hierarchy';

/**
 * The type of a widget on a dashboard that is a variant of Cartesian widget.
 */
export type CartesianWidgetType =
  | 'chart/line'
  | 'chart/area'
  | 'chart/bar'
  | 'chart/column'
  | 'chart/polar';

/**
 * The type of a widget on a dashboard that is a variant of Categorical widget.
 */
export type CategoricalWidgetType = 'chart/pie' | 'chart/funnel' | 'treemap' | 'sunburst';

/**
 * The type of a widget on a dashboard that is a variant of tabular widget.
 */
export type TabularWidgetType = 'tablewidget' | 'tablewidgetagg' | 'pivot' | 'pivot2';

/**
 * The type of a widget on a dashboard that is a variant of text widget.
 */
export type TextWidgetType = 'richtexteditor';

/**
 * The type of a widget on a dashboard.
 */
export type WidgetType =
  | CartesianWidgetType
  | CategoricalWidgetType
  | 'chart/scatter'
  | 'indicator'
  | TabularWidgetType
  | 'chart/boxplot'
  | 'map/scatter'
  | 'map/area'
  | TextWidgetType
  | 'plugin';

export type WidgetSubtype =
  | 'area/basic'
  | 'area/stacked'
  | 'area/stacked100'
  | 'area/spline'
  | 'area/stackedspline'
  | 'area/stackedspline100'
  | 'bar/classic'
  | 'bar/stacked'
  | 'bar/stacked100'
  | 'column/classic'
  | 'column/stackedcolumn'
  | 'column/stackedcolumn100'
  | 'line/basic'
  | 'line/spline'
  | 'pie/classic'
  | 'pie/donut'
  | 'pie/ring'
  | 'column/polar'
  | 'area/polar'
  | 'line/polar'
  | 'indicator/numeric'
  | 'indicator/gauge'
  | 'bubble/scatter'
  | 'treemap'
  | 'sunburst'
  | 'boxplot/full'
  | 'boxplot/hollow'
  | 'map/scatter'
  | 'areamap/world'
  | 'areamap/usa'
  | 'richtexteditor';

export enum WidgetDashboardFilterMode {
  FILTER = 'filter',
  SELECT = 'select',
}

/**
 * The data transfer object (DTO) containing info of a widget on a dashboard.
 *
 * This is the (not-comprehensive) structure of the response from the
 * `/api/v1/dashboards/${dashboardOid}/widgets/${widgetOid}` endpoint.
 *
 * @internal
 */
export interface WidgetDto {
  oid: string;
  type: WidgetType | string;
  subtype: WidgetSubtype | string;
  datasource: JaqlDataSource;
  metadata: {
    ignore?: FiltersIgnoringRules;
    panels: Panel[];
    drillHistory?: PanelItem[];
    usedFormulasMapping?: any;
  };
  style: WidgetStyle;
  title: string;
  desc: string | null;
  options?: {
    dashboardFiltersMode: `${WidgetDashboardFilterMode}`;
    selector: boolean;
    drillToAnywhere?: boolean;
    previousScrollerLocation?:
      | AutoZoomNavigatorScrollerLocation
      | EmptyAutoZoomNavigatorScrollerLocation;
    triggersDomready?: boolean;
    autoUpdateOnEveryChange?: boolean;
    hideFromWidgetList?: boolean;
    disableExportToCSV?: boolean;
    disableExportToImage?: boolean;
    toolbarButton?: any;
    disallowSelector?: boolean;
    disallowWidgetTitle?: boolean;
    supportsHierarchies?: boolean;
  };
  source?: any;
  owner?: string;
  userId?: string;
  created?: string;
  lastUpdated?: string;
  instanceType?: string;
  selection?: any;
  tags?: any;
  instanceid?: string;
  realTimeRefreshing?: boolean;
  dashboardid?: string;
  _dataSourcePermission?: string;
  userAuth?: any;
  _toDisableOptionsList?: any;
  _id?: string;
}

/**
 * The data transfer object (DTO) containing info of a hierarchy.
 *
 * This is the (not-comprehensive) structure of the response from the
 * `/api/elasticubes/hierarchies` endpoint.
 *
 * @internal
 */
export interface HierarchyDto {
  _id: string;
  cubeId: string;
  title: string;
  // Note: using jaql type as it has the same structure as datasource column model
  levels: BaseJaql[];
}

/**
 * The scroll location of the navigator scroller / auto zoom feature
 */
export type AutoZoomNavigatorScrollerLocation = {
  min: number;
  max: number;
};

/**
 * @internal
 */
type EmptyAutoZoomNavigatorScrollerLocation = {
  min: null;
  max: null;
};

export function isValidScrollerLocation(
  scrollerLocation?: AutoZoomNavigatorScrollerLocation | EmptyAutoZoomNavigatorScrollerLocation,
): scrollerLocation is AutoZoomNavigatorScrollerLocation {
  return !!scrollerLocation && scrollerLocation.min !== null && scrollerLocation.max !== null;
}

export type WidgetDesign = {
  widgetBackgroundColor: string;
  widgetSpacing: keyof typeof LEGACY_DESIGN_TYPES;
  widgetCornerRadius: keyof typeof LEGACY_DESIGN_TYPES;
  widgetShadow: keyof typeof LEGACY_DESIGN_TYPES;
  widgetBorderEnabled: boolean;
  widgetBorderColor: string;
  widgetTitleColor: string;
  widgetTitleAlignment: keyof typeof LEGACY_DESIGN_TYPES;
  widgetTitleDividerEnabled: boolean;
  widgetTitleDividerColor: string;
  widgetTitleBackgroundColor: string;
};

export type FiltersIgnoringRules = {
  dimensions?: string[];
  ids: string[];
  all: boolean;
};

export type Panel = {
  name: string;
  items: PanelItem[];
};

type SeriesType = 'auto' | 'line' | 'spline' | 'areaspline' | 'bar' | 'area' | 'column';

interface DecimalAbbreviations {
  k: boolean;
  m: boolean;
  b: boolean;
  t: boolean;
}

export enum CurrencyPosition {
  PRE = 'pre',
  POST = 'post',
}

export type NumericMask = {
  isdefault?: boolean;
  abbreviations?: DecimalAbbreviations;
  decimals?: 'auto' | number | string;
  currency?: { symbol: string; position: CurrencyPosition };
  percent?: boolean;
  number?: { separated: boolean };
  separated?: boolean;
  type?: string;
  abbreviateAll?: boolean;
};

export type DatetimeMask = {
  isdefault?: boolean;
  years: string;
  quarters: string;
  months: string;
  weeks: string;
  minutes: string;
  seconds: string;
  days: string;
  type: string;
  dateAndTime?: string;
};

export type StatisticalModels = {
  forecast?: {
    isEnabled: boolean;
    isViewerDisabled: boolean;
    explainVariable: null;
    evaluation: {
      type: string;
      numLastPointsForEvaluation: number;
      ignoreLast: number;
    };
    forecastPeriod: number;
    confidence: number;
    modelType: string;
    boundaries: {
      upper: {
        isEnabled: boolean;
        value: null;
      };
      lower: {
        isEnabled: boolean;
        value: null;
      };
      isInt: {
        isEnabled: boolean;
      };
    };
  };
  trend?: {
    isEnabled: boolean;
    isViewerDisabled: boolean;
    trendType: string;
    ignoreAnomalies: boolean;
    trendOnForecast: boolean;
    compare: {
      isEnabled: boolean;
      period: string;
    };
    isAccessible: boolean;
  };
};

export type PanelItem = {
  instanceid?: string;
  format?: {
    color?: PanelColorFormat;
    mask?: DatetimeMask | NumericMask;
    members?: PanelMembersFormat;
    subtotal?: boolean;
    databars?: boolean;
    width?: number;
    colorIndex?: number;
  };
  jaql: Jaql;
  disabled?: boolean;
  y2?: boolean;
  parent?: PanelItem;
  through?: PanelItem;
  singleSeriesType?: SeriesType;
  categoriesSorting?: JaqlSortDirection;
  isColored?: boolean;
  geoLevel?: 'country' | 'state' | 'city';
  statisticalModels?: StatisticalModels;
  field?: {
    id: string;
    index: number;
  };
  panel?: string;
  hierarchies?: HierarchyId[];
};

export type PanelColorFormat =
  | PanelColorFormatSingle
  | PanelColorFormatRange
  | PanelColorFormatConditional;

export type PanelMembersFormat = Record<
  string,
  {
    color: string;
  }
>;

export type PanelColorFormatSingle = {
  type: 'color';
  color?: string;
  colorIndex?: number;
};

export type PanelColorFormatRange = {
  type: 'range';
  steps: number;
  rangeMode: 'min' | 'max' | 'both' | 'auto';
  min?: string;
  max?: string;
  minvalue?: string | null;
  midvalue?: string | null;
  maxvalue?: string | null;
};

export type PanelColorFormatConditional = {
  type: 'condition';
  conditions: PanelColorFormatCondition[];
};

export type PanelColorFormatCondition =
  | PanelColorFormatConditionSimple
  | PanelColorFormatConditionJaql;

export type PanelColorFormatConditionSimple = {
  color: string;
  expression: string;
  operator: PanelColorFormatConditionOperator;
};

export type PanelColorFormatConditionJaql = {
  color: string;
  expression: { jaql: unknown };
  operator: PanelColorFormatConditionOperator;
};

export type PanelColorFormatConditionOperator =
  | '<'
  | '>'
  | '≤'
  | '<='
  | '≥'
  | '>='
  | '='
  | '≠'
  | '!=';

type LabelsStyle = {
  enabled: boolean;
  rotation: number;
};

type AxisTitleStyle = {
  enabled: boolean;
  text?: string;
};

export type AxisStyle = {
  inactive?: boolean;
  enabled: boolean;
  ticks: boolean;
  labels: LabelsStyle;
  title?: AxisTitleStyle;
  gridLines: boolean;
  isIntervalEnabled: boolean;
  logarithmic?: boolean;
  min?: number | null;
  max?: number | null;
};

type BaseWidgetStyle = {
  legend: {
    position: string;
    enabled: boolean;
  };
  navigator: {
    enabled: boolean;
  };
};

export type CartesianWidgetStyle = BaseWidgetStyle &
  WidgetContainerStyleOptions & {
    seriesLabels: LabelsStyle;
    xAxis: AxisStyle & {
      x2Title?: AxisTitleStyle;
    };
    yAxis: AxisStyle;
    y2Axis?: AxisStyle;
    lineWidth?: {
      width: string;
    };
    markers?: {
      enabled: boolean;
      size: number | string;
      fill: string;
    };
    dataLimits?: any;
  };

export type PolarWidgetStyle = BaseWidgetStyle &
  WidgetContainerStyleOptions & {
    categories?: AxisStyle;
    axis?: AxisStyle;
  };

type ScatterMarkerSize = {
  defaultSize: number;
  min: number;
  max: number;
};

export type ScatterWidgetStyle = BaseWidgetStyle &
  WidgetContainerStyleOptions & {
    xAxis: AxisStyle;
    yAxis: AxisStyle;
    markerSize?: ScatterMarkerSize;
  };

export type FunnelWidgetStyle = BaseWidgetStyle &
  WidgetContainerStyleOptions & {
    size: string;
    type: string;
    direction: string;
    labels: {
      enabled: boolean;
      categories: boolean;
      percent: boolean;
      value: boolean;
      decimals: boolean;
    };
  };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PluginStyle = any;

export type TableWidgetStyle = {
  'colors/columns': boolean;
  'colors/headers': boolean;
  'colors/rows': boolean;
};

export type IndicatorWidgetStyle = WidgetContainerStyleOptions & {
  'indicator/gauge': {
    subtype: string;
    skin: string;
    components: {
      ticks: {
        inactive: boolean;
        enabled: boolean;
      };
      labels: {
        inactive: boolean;
        enabled: boolean;
      };
      title: {
        inactive: boolean;
        enabled: boolean;
      };
      secondaryTitle: {
        inactive: boolean;
        enabled: boolean;
      };
    };
  };
  'indicator/numeric': {
    subtype: string;
    skin: '1' | '2';
    components: {
      title: {
        inactive: boolean;
        enabled: boolean;
      };
      icon: {
        inactive: boolean;
        enabled: boolean;
      };
      secondaryTitle: {
        inactive: boolean;
        enabled: boolean;
      };
    };
  };
  skin: '1' | '2' | 'vertical' | 'horizontal';
  subtype: 'simple' | 'bar' | 'round';
  'indicator/pictogram': {};
  components: {
    ticks: {
      inactive: boolean;
      enabled: boolean;
    };
    labels: {
      inactive: boolean;
      enabled: boolean;
    };
    title: {
      inactive: boolean;
      enabled: boolean;
    };
    secondaryTitle: {
      inactive: boolean;
      enabled: boolean;
    };
  };
};

export type TreemapWidgetStyle = {
  'title/1': boolean;
  'title/2': boolean;
  'title/3': boolean;
  'tooltip/contribution': boolean;
  'tooltip/value': boolean;
};

export type SunburstWidgetStyle = {
  'legend/enabled': boolean;
  'legend/position': 'top' | 'bottom' | 'left' | 'right';
  'tooltip/contribution': boolean;
  'tooltip/value': boolean;
};

export type BoxplotWidgetStyle = WidgetContainerStyleOptions & {
  xAxis: AxisStyle;
  yAxis: AxisStyle;
  whisker: {
    'whisker/iqr': boolean;
    'whisker/extremums': boolean;
    'whisker/deviation': boolean;
  };
  outliers: {
    enabled: boolean;
  };
};

export type ScattermapWidgetStyle = WidgetContainerStyleOptions & {
  markers: {
    fill: 'filled' | 'filled-light' | 'hollow' | 'hollow-bold';
    size: {
      defaultSize: number;
      min: number;
      max: number;
    };
  };
};

/** Currently, WidgetStyle for areamap is an empty object */
export type AreamapWidgetStyle = {};

export type WidgetStyle = { widgetDesign?: WidgetDesign; narration?: any } & (
  | CartesianWidgetStyle
  | PolarWidgetStyle
  | FunnelWidgetStyle
  | ScatterWidgetStyle
  | TableWidgetStyle
  | IndicatorWidgetStyle
  | TreemapWidgetStyle
  | SunburstWidgetStyle
  | BoxplotWidgetStyle
  | ScattermapWidgetStyle
  | AreamapWidgetStyle
  | PivotWidgetStyle
  | TextWidgetDtoStyle
);

export enum FiltersMergeStrategyEnum {
  WIDGET_FIRST = 'widgetFirst',
  CODE_FIRST = 'codeFirst',
  CODE_ONLY = 'codeOnly',
}

export type FiltersMergeStrategy = `${FiltersMergeStrategyEnum}`;

export type PivotWidgetStyle = {
  rowsGrandTotal?: boolean;
  columnsGrandTotal?: boolean;
  colors?: {
    rows?: boolean;
    columns?: boolean;
    headers?: boolean;
    members?: boolean;
    totals?: boolean;
  };
  pageSize?: number | string;
  rowHeight?: number;
  automaticHeight?: boolean;
};

export type TextWidgetDtoStyle = {
  content: {
    html: string;
    vAlign: `valign-${'middle' | 'top' | 'bottom'}`;
    bgColor: string;
    textAlign: 'center';
  };
};
