import { Jaql, SortDirection } from '@sisense/sdk-data';

/* eslint-disable max-lines */

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
export type TabularWidgetType = 'tablewidget' | 'tablewidgetagg';

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
  | 'map/area';

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
  | 'areamap/usa';

export enum WidgetDashboardFilterMode {
  FILTER = 'filter',
  SELECT = 'select',
}

export type Datasource = {
  title: string;
  id: string;
  fullname?: string;
  live?: boolean;
  address?: string;
  database?: string;
};

/**
 * The data transfer object (DTO) containing info of a widget on a dashboard.
 *
 * This is the (not-comprehensive) structure of the response from the
 * `/api/v1/dashboards/${dashboardOid}/widgets/${widgetOid}` endpoint.
 */
export interface WidgetDto {
  oid: string;
  type: WidgetType | string;
  subtype: WidgetSubtype | string;
  datasource: Datasource;
  metadata: {
    ignore?: FiltersIgnoringRules;
    panels: Panel[];
  };
  style: WidgetStyle;
  title: string;
  desc: string | null;
  options?: {
    dashboardFiltersMode: `${WidgetDashboardFilterMode}`;
  };
}

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
};

export type DatetimeMask = {
  isdefault?: boolean;
  years: string;
  quarters: string;
  months: string;
  weeks: string;
  minutes: string;
  days: string;
  type: string;
  dateAndTime?: string;
};

export type PanelItem = {
  instanceid?: string;
  format?: {
    color?: PanelColorFormat;
    mask?: DatetimeMask | NumericMask;
    members?: PanelMembersFormat;
  };
  jaql: Jaql;
  disabled?: boolean;
  y2?: boolean;
  parent?: PanelItem;
  through?: PanelItem;
  singleSeriesType?: SeriesType;
  categoriesSorting?: SortDirection;
  isColored?: boolean;
  geoLevel?: 'country' | 'state' | 'city';
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

export type CartesianWidgetStyle = BaseWidgetStyle & {
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
    size: number;
    fill: string;
  };
};

export type PolarWidgetStyle = BaseWidgetStyle & {
  categories?: AxisStyle;
  axis?: AxisStyle;
};

type ScatterMarkerSize = {
  defaultSize: number;
  min: number;
  max: number;
};

export type ScatterWidgetStyle = BaseWidgetStyle & {
  xAxis: AxisStyle;
  yAxis: AxisStyle;
  markerSize?: ScatterMarkerSize;
};

export type FunnelWidgetStyle = BaseWidgetStyle & {
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

export type TableWidgetStyle = {
  'colors/columns': boolean;
  'colors/headers': boolean;
  'colors/rows': boolean;
};

export type IndicatorWidgetStyle = {
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

export type BoxplotWidgetStyle = {
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

export type ScattermapWidgetStyle = {
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

export type WidgetStyle =
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
  | AreamapWidgetStyle;

export enum FiltersMergeStrategyEnum {
  WIDGET_FIRST = 'widgetFirst',
  CODE_FIRST = 'codeFirst',
  CODE_ONLY = 'codeOnly',
}

export type FiltersMergeStrategy = `${FiltersMergeStrategyEnum}`;
