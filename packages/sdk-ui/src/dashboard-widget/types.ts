/* eslint-disable max-lines */
export const enum WidgetType {
  PieChart = 'chart/pie',
  ColumnChart = 'chart/column',
  BarChart = 'chart/bar',
  LineChart = 'chart/line',
  AreaChart = 'chart/area',
  FunnelChart = 'chart/funnel',
  ScatterChart = 'chart/scatter',
  IndicatorChart = 'indicator',
  PolarChart = 'chart/polar',
  Table = 'tablewidget',
  TableWithAggregation = 'tablewidgetagg',
}

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
  | 'bubble/scatter';

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
  datasource: {
    title: string;
    id: string;
    fullname: string;
    live: boolean;
  };
  metadata: {
    panels: Panel[];
  };
  style: WidgetStyle;
  title: string;
  desc: string;
}

export const enum DataType {
  TEXT = 'text',
  NUMERIC = 'numeric',
  DATETIME = 'datetime',
}

export type Panel = {
  name: string;
  items: PanelItem[];
};

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export type BaseJaql = {
  agg?: string;
  datatype: DataType;
  dim: string;
  table: string;
  column: string;
  title: string;
  level?: string;
  sort?: SortDirection;
};

type FormulaID = string;
type FormulaContext = BaseJaql | FilterJaql;

export type FormulaJaql = {
  type?: 'measure';
  sort?: SortDirection;
  title: string;
  formula: string;
  context?: Record<FormulaID, FormulaContext>;
};

type IncludeAllFilter = {
  all: true;
};

export type IncludeMembersFilter = {
  members: string[];
};

type ExcludeMembersFilter = {
  exclude: {
    members: string[];
  };
};

export type MembersFilter = IncludeMembersFilter | ExcludeMembersFilter;

type BaseFilter = IncludeAllFilter | MembersFilter;

type BackgroundFilter = BaseFilter;

type TurnOffMembersFilter = ExcludeMembersFilter & {
  turnedOff: boolean;
};

type Filter = BaseFilter & {
  filter?: BackgroundFilter | TurnOffMembersFilter;
};

export type FilterJaql = BaseJaql & {
  filter: Filter;
};

export type Jaql = BaseJaql | FormulaJaql | FilterJaql;

type SeriesType = 'auto' | 'line' | 'spline' | 'areaspline' | 'bar' | 'area' | 'column';

export type PanelItem = {
  format?: {
    color?: PanelColorFormat;
    mask?: Record<string, string>;
    members?: PanelMembersFormat;
  };
  jaql: Jaql;
  disabled?: boolean;
  y2?: boolean;
  parent?: PanelItem;
  through?: PanelItem;
  singleSeriesType?: SeriesType;
  categoriesSorting?: SortDirection;
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

type AxisStyle = {
  enabled: boolean;
  ticks: boolean;
  labels: LabelsStyle;
  title?: AxisTitleStyle;
  gridLines: boolean;
  isIntervalEnabled: boolean;
  logarithmic?: boolean;
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

export type WidgetStyle =
  | CartesianWidgetStyle
  | PolarWidgetStyle
  | FunnelWidgetStyle
  | ScatterWidgetStyle
  | TableWidgetStyle
  | IndicatorWidgetStyle;
