/* eslint-disable max-lines */
import { Attribute, MembersFilter } from '@sisense/sdk-data';
import { DeepRequired } from 'ts-essentials';
import {
  AreaSubtype,
  LineSubtype,
  PieSubtype,
  PolarSubtype,
  StackableSubtype,
} from './chart-options-processor/subtype-to-design-options';
import { IndicatorComponents } from './chart-options-processor/translations/design-options';
import {
  FunnelDirection,
  FunnelSize,
  FunnelType,
} from './chart-options-processor/translations/funnel-plot-options';
import { ScatterMarkerSize } from './chart-options-processor/translations/scatter-plot-options';
import {
  CartesianChartType,
  ScatterChartType,
  CategoricalChartType,
  IndicatorChartType,
  TableType,
} from './chart-options-processor/translations/types';
import { DataPointsEventHandler } from './props';

export type { AppConfig } from './app/client-application';
export type { DateConfig } from './query/date-formats';

export type {
  CartesianChartDataOptions,
  CategoricalChartDataOptions,
  ChartDataOptions,
  ScatterChartDataOptions,
  IndicatorDataOptions,
  StyledColumn,
  StyledMeasureColumn,
} from './chart-data-options/types';
export type {
  DataColorCondition,
  ConditionalDataColorOptions,
  DataColorOptions,
  RangeDataColorOptions,
  UniformDataColorOptions,
} from './chart-data/series-data-color-service/types';
// export the following types for TSDoc
export type {
  CartesianChartType,
  CategoricalChartType,
  ScatterChartType,
  IndicatorChartType,
  TableType,
  AreaSubtype,
  LineSubtype,
  PieSubtype,
  PolarSubtype,
  StackableSubtype,
  IndicatorComponents,
  ScatterMarkerSize,
};

export type { MonthOfYear, DayOfWeek, DateLevel } from './query/date-formats/apply-date-format';

/**
 * @internal
 */
export type Components = {
  title: {
    enabled: boolean;
  };
};

/** Options that define navigator - zoom/pan tool for large datasets in a chart. */
export type Navigator = {
  /** Boolean flag that defines if navigator should be shown on the chart */
  enabled: boolean;
};

/** Configuration that defines line width */
export type LineWidth = {
  /** Line width type */
  width: 'thin' | 'bold' | 'thick';
};

/** Options that define  markers - symbols or data points that highlight specific values. */
export type Markers = {
  /** Boolean flag that defines if markers should be shown on the chart */
  enabled: boolean;
  /**
   * Marker fill style
   */
  fill?: 'filled' | 'hollow';
  /**
   * Size of markers
   */
  size?: 'small' | 'large';
};

export type X2Title = {
  enabled: boolean;
  text?: string;
};

/** Options that define series labels - titles/names identifying data series in a chart. */
export type SeriesLabels = {
  /** Boolean flag that defines if series labels should be shown on the chart */
  enabled: boolean;
  /** Rotation of series labels (in degrees) */
  rotation?: number;
};

/** Options that define legend - a key that provides information about the data series or colors used in chart. */
export type Legend = {
  /** Boolean flag that defines if legend should be shown on the chart */
  enabled: boolean;
  /** Position of the legend */
  position?: string;
};

/** Configuration that defines behavior of data labels on chart */
export type Labels = {
  /** Boolean flag that defines if categories names should be shown */
  categories?: boolean;
  /** Boolean flag that defines if any labels should be shown */
  enabled?: boolean;
  /** Boolean flag that defines if percents of Pie should be shown on slices */
  percent?: boolean;
  /** Boolean flag that defines if decimals should be shown for percent labels */
  decimals?: boolean;
  /** Boolean flag that defines if original values per category should be shown */
  value?: boolean;
};
/** Options that define configuration for certain chart axis. */
export type AxisLabel = {
  /** Boolean flag that defines if this axis should be shown on the chart */
  enabled?: boolean;
  /** Boolean flag that defines if grid lines should be shown on the chart */
  gridLines?: boolean;
  /** Interval of the tick marks (jumps) in axis units. */
  intervalJumps?: number;
  /** Boolean flag that defines if tick marks should be shown on the axis */
  isIntervalEnabled?: boolean;
  /** Configuration for labels on the axis */
  labels?: {
    /** Boolean flag that defines if labels should be shown on the axis */
    enabled: boolean;
  };
  /** Boolean flag that defines if the axis should have logarithmic scale */
  logarithmic?: boolean;
  /** The minimum value of the axis. If 'undefined' the min value is automatically calculated */
  min?: number;
  /** The maximum value of the axis. If 'undefined' the max value is automatically calculated */
  max?: number;
  /**
   * Boolean flag that defines if the Y axis should have grid lines extending the ticks across the plot area
   */
  /* @privateRemarks
   This property is specific to Y axis and not relevant to all other possible axes.
   It should be moved to separate specific type.
  */
  templateMainYHasGridLines?: boolean;
  /** Configuration for title of the axis */
  title?: {
    /** Boolean flag that defines if title should be shown */
    enabled: boolean;
    /** Textual content of the title */
    text?: string;
  };
  /** Configuration for title of the second X axis */
  /* @privateRemarks
   This property is specific to the second X axis and not relevant to all other possible axes.
   It should be moved to separate specific type.
  */
  x2Title?: X2Title;
};

/**
 * Configuration that defines the ability of the Pie chart to collapse (convolve) and
 * hide part of the data under the single category "Others".
 */
export type Convolution = {
  /** Boolean flag that defines if convolution ability should be enabled on chart */
  enabled: boolean;
  /** Selected type of convolution behavior */
  selectedConvolutionType?: 'byPercentage' | 'bySlicesCount';
  /** Value that defines what minimal size in percent should a slice take to fall under the convolution */
  minimalIndependentSlicePercentage?: number;
  /** Number that defines of how many independent slices should be present in chart (other will be convolved) */
  independentSlicesCount?: number;
};

/**
 * These were added so that we would be consistent with the style options on a
 * widget. However, these are not used anywhere (yet).
 *
 * @internal
 */
interface ReservedStyleOptions {
  /** @internal */
  'colors/columns'?: boolean;
  /** @internal */
  'colors/headers'?: boolean;
  /** @internal */
  'colors/rows'?: boolean;
  /** @internal */
  components?: Components;
  /** @internal */
  skin?: string;
}

/**
 * Configuration that limits the series or categories that are charted.
 */
export interface DataLimits {
  /** Maximum number of series to chart */
  seriesCapacity?: number;
  /** Maximum number of categories to chart */
  categoriesCapacity?: number;
}

/**
 * Basic configuration options that define functional style of the various elements of chart
 *
 * @internal
 */
export interface BaseStyleOptions extends ReservedStyleOptions {
  /** Configuration for legend - a key that provides information about the data series or colors used in chart */
  legend?: Legend;
  /**
   * Configuration for series labels - titles/names identifying data series in a chart
   *
   * @internal
   */
  seriesLabels?: SeriesLabels;
  /** Data limit for series or categories that will be plotted */
  dataLimits?: DataLimits;
  /**
   * Total width of the component, which is considered in the following order of priority:
   *
   * 1. Value passed to this property (in pixels)
   * 2. Width of the container wrapping this component
   * 3. Default value of 400px
   *
   */
  width?: number;
  /**
   * Total height of the component, which is considered in the following order of priority:
   *
   * 1. Value passed to this property (in pixels).
   * 2. Height of the container wrapping this component
   * 3. Default value of 400px (for component without header) or 425px (for component with header).
   */
  height?: number;
}

/**
 * Configuration options that define functional style of axes and related elements
 *
 * @internal
 */
export interface BaseAxisStyleOptions {
  /** Configuration for markers - symbols or data points that highlight specific values */
  markers?: Markers;
  /** Configuration for navigator - zoom/pan tool for large datasets in a chart */
  navigator?: Navigator;
  /** Configuration for X axis */
  xAxis?: AxisLabel;
  /** Configuration for Y axis */
  yAxis?: AxisLabel;
  /** Configuration for second Y axis */
  y2Axis?: AxisLabel;
}

/** Configuration options that define functional style of the various elements of {@link LineChart} */
export interface LineStyleOptions extends BaseStyleOptions, BaseAxisStyleOptions {
  /** Configuration that defines line width */
  lineWidth?: LineWidth;
  /** Subtype of {@link LineChart}*/
  subtype?: LineSubtype;
}

/** Configuration options that define functional style of the various elements of {@link AreaChart} */
export interface AreaStyleOptions extends BaseStyleOptions, BaseAxisStyleOptions {
  /** Configuration that defines line width */
  lineWidth?: LineWidth;
  /** Subtype of {@link AreaChart}*/
  subtype?: AreaSubtype;
}

/** Configuration options that define functional style of the various elements of stackable charts, like Column or Bar */
export interface StackableStyleOptions extends BaseStyleOptions, BaseAxisStyleOptions {
  /** Subtype of stackable chart */
  /* @privateRemarks
   Subtypes for columns and bars should be separate - currently it is possible to have
   Bar chart with 'column/classic' subtype and Column chart with 'bar/classic' subtype
  */
  subtype?: StackableSubtype;
}

/** Configuration options that define functional style of the various elements of Pie chart */
export interface PieStyleOptions extends BaseStyleOptions {
  /**
   * Configuration that defines the ability of the Pie chart to collapse (convolve) and
   * hide part of the data under the single category "Others".
   */
  convolution?: Convolution;
  /** Configuration that defines behavior of data labels on Pie chart */
  labels?: Labels;
  /** Subtype of Pie chart*/
  subtype?: PieSubtype;
}

/** Configuration options that define functional style of the various elements of {@link FunnelChart} */
export interface FunnelStyleOptions extends BaseStyleOptions {
  /** Visual size of the lowest slice (degree of funnel narrowing from highest to lowest slices)*/
  funnelSize?: FunnelSize;
  /** Visual type of the lowest slice of {@link FunnelChart} */
  funnelType?: FunnelType;
  /** Direction of {@link FunnelChart} narrowing */
  funnelDirection?: FunnelDirection;
  /** Configuration that defines behavior of data labels on {@link FunnelChart} */
  labels?: Labels;
  /** Subtype of {@link FunnelChart}*/
  subtype?: never;
}

/** Configuration options that define functional style of the various elements of {@link PolarChart} */
export interface PolarStyleOptions extends BaseStyleOptions, BaseAxisStyleOptions {
  /** Subtype of {@link PolarChart}*/
  subtype?: PolarSubtype;
}

/** Configuration options that define functional style of the various elements of {@link IndicatorChart} */
export type IndicatorStyleOptions = (
  | NumericSimpleIndicatorStyleOptions
  | NumericBarIndicatorStyleOptions
  | GaugeIndicatorStyleOptions
) & {
  /**
   * Total width of the component, which is considered in the following order of priority:
   *
   * 1. Value passed to this property (in pixels)
   * 2. Width of the container wrapping this component
   * 3. Default value of 200px
   *
   */
  width?: number;
  /**
   * Total height of the component, which is considered in the following order of priority:
   *
   * 1. Value passed to this property (in pixels).
   * 2. Height of the container wrapping this component
   * 3. Default value of 200px (for component without header) or 225px (for component with header).
   */
  height?: number;
};

/** Configuration options that define functional style of the various elements of {@link Table} */
export interface TableStyleOptions {
  /**
   * Boolean flag whether to fill header cells with background color
   */
  headersColor?: boolean;
  /**
   * Boolean flag whether to apply background color to alternate rows.
   */
  alternatingRowsColor?: boolean;
  /**
   * Boolean flag whether to apply background color to alternate columns
   */
  alternatingColumnsColor?: boolean;
  /**
   * Number of rows per page
   *
   * Default value is 25
   *
   */
  rowsPerPage?: number;
  /**
   * Total width of the component, which is considered in the following order of priority:
   *
   * 1. Value passed to this property (in pixels)
   * 2. Width of the container wrapping this component
   * 3. Default value of 400px
   *
   */
  width?: number;
  /**
   * Total height of the component, which is considered in the following order of priority:
   *
   * 1. Value passed to this property (in pixels).
   * 2. Height of the container wrapping this component
   * 3. Default value of 500px (for component without header) or 525px (for component with header).
   */
  height?: number;
}

/**
 * Common part of IndicatorStyleOptions for all types of indicator
 *
 * @internal
 */
export interface BaseIndicatorStyleOptions {
  indicatorComponents?: IndicatorComponents;
}

/** Configuration options that define functional style of the various elements of Numeric Simple {@link IndicatorChart} */
export interface NumericSimpleIndicatorStyleOptions extends BaseIndicatorStyleOptions {
  subtype: 'indicator/numeric';
  numericSubtype: 'numericSimple';
  skin: 'vertical' | 'horizontal';
}

/** Configuration options that define functional style of the various elements of Numeric Bar {@link IndicatorChart} */
export interface NumericBarIndicatorStyleOptions extends BaseIndicatorStyleOptions {
  subtype: 'indicator/numeric';
  numericSubtype: 'numericBar';
}

/** Configuration options that define functional style of the various elements of Gauge {@link IndicatorChart} */
export interface GaugeIndicatorStyleOptions extends BaseIndicatorStyleOptions {
  subtype: 'indicator/gauge';
  skin: 1 | 2;
}

/** Configuration options that define functional style of the various elements of {@link ScatterChart} */
export interface ScatterStyleOptions extends BaseStyleOptions, BaseAxisStyleOptions {
  /** Subtype of {@link ScatterChart}*/
  subtype?: never;
  markerSize?: ScatterMarkerSize;
}

/** Configuration options that define functional style of the various elements of {@link TreemapChart} */
export interface TreemapStyleOptions extends BaseStyleOptions {
  /** Labels options object */
  labels?: {
    /** Array with single label options objects (order of items relative to dataOptions.category) */
    category?: {
      /** Define visibility of label */
      enabled?: boolean;
    }[];
  };
  /** Tooltip options object */
  tooltip?: {
    /** Define mode of data showing */
    mode?: 'value' | 'contribution';
  };
}

/**
 * Configuration options that define functional style of the various elements of chart.
 */
export type StyleOptions =
  | LineStyleOptions
  | AreaStyleOptions
  | StackableStyleOptions
  | PieStyleOptions
  | FunnelStyleOptions
  | PolarStyleOptions
  | IndicatorStyleOptions
  | ScatterStyleOptions
  | TreemapStyleOptions;

/** Mapping of each of the chart value series to colors. */
export type ValueToColorMap = Record<string, string>;

/**
 * Chart type of one of the supported chart families
 */
export type ChartType =
  | CartesianChartType
  | CategoricalChartType
  | ScatterChartType
  | IndicatorChartType;

/**
 * Series chart type, which is used with {@link StyledMeasureColumn} to customize
 * series in a mixed chart.
 */
export type SeriesChartType =
  | 'auto'
  | 'line'
  | 'spline'
  | 'areaspline'
  | 'bar'
  | 'area'
  | 'column'
  | 'scatter';

/** The number of decimal places */
export type DecimalScale = number | 'auto';

/** Sorting direction, either by Ascending order, Descending order, or None */
export type SortDirection = 'sortAsc' | 'sortDesc' | 'sortNone';

/**
 * Configuration for number formatting.
 */
export type NumberFormatConfig = {
  /**
   * Supported formats
   */
  name: 'Numbers' | 'Currency' | 'Percent';
  /**
   * The number of decimal places
   */
  decimalScale: DecimalScale;
  /**
   * Boolean flag whether to show an abbreviation
   * for a number greater than or equal one trillion - e.g. 1T
   */
  trillion: boolean;
  /**
   * Boolean flag whether to show an abbreviation
   * for a number greater than or equal one billion - e.g. 1B
   */
  billion: boolean;
  /**
   * Boolean flag whether to show an abbreviation
   * for a number greater than or equal one million - e.g. 1M
   */
  million: boolean;
  /**
   * Boolean flag whether to show an abbreviation
   * for a number greater than or equal one thousand - e.g. 1K
   */
  kilo: boolean;
  /**
   * Boolean flag whether the thousand separator is shown
   *
   * If true, show the thousand separator, e.g. `1,000`. Otherwise, show `1000`
   */
  thousandSeparator: boolean;
  /**
   * Boolean flag whether `symbol` is shown in front of or after the number
   *
   * If true, append `symbol` in front of the number, e.g. show `$1000` when `symbol` is `$`.
   *
   * If false, append `symbol` after the number, e.g. show `1000¥` when `symbol` is `¥`.
   */
  prefix: boolean;
  /**
   * Symbol to show in front of or after the number depending on the value of `prefix`.
   */
  symbol: string;
};

/** Identifier of a theme as defined in the Sisense instance. */
export type ThemeOid = string;

/** Theme settings defining the look and feel of components. */
export interface ThemeSettings {
  /** Chart theme settings */
  chart?: {
    /** Text color */
    textColor?: string;
    /** Secondary text color - e.g., for the indicator chart's secondary value title */
    secondaryTextColor?: string;
    /** Background color */
    backgroundColor?: string;
    /** Toolbar Background color, can be used as a secondary background color */
    panelBackgroundColor?: string;
  };
  /** Collection of colors used to color various elements */
  palette?: ColorPaletteTheme;
  /** Text theme settings */
  typography?: {
    /** Font family name to style component text */
    fontFamily?: string;
    primaryTextColor?: string;
    secondaryTextColor?: string;
  };
  /** General theme settings */
  general?: {
    /** Main color used for various elements like primary buttons, switches, etc. */
    brandColor?: string;
    /** Background color used for elements like tiles, etc. */
    backgroundColor?: string;
    /** Text color for primary buttons */
    primaryButtonTextColor?: string;
    /** Hover color for primary buttons */
    primaryButtonHoverColor?: string;
  };
}

/**
 * Complete set of theme settings defining the look and feel of components.
 *
 * @internal
 */
export type CompleteThemeSettings = DeepRequired<ThemeSettings>;

/** Style settings defining the look and feel of widget itself and widget header */
export interface WidgetStyleOptions {
  /** Space between widget container edge and the chart */
  spaceAround?: 'Large' | 'Medium' | 'Small';
  /** Corner radius of the widget container */
  cornerRadius?: 'Large' | 'Medium' | 'Small';
  /**
   * Shadow level of the widget container
   *
   * Effective only when spaceAround is defined
   */
  shadow?: 'Light' | 'Medium' | 'Dark';
  /** Widget container border toggle */
  border?: boolean;
  /** Widget container border color */
  borderColor?: string;
  /**
   * Widget background color
   *
   * Affects chart background color as well
   */
  backgroundColor?: string;
  /** Widget header styles */
  header?: {
    /** Header visibility toggle */
    hidden?: boolean;
    /** Header title text color */
    titleTextColor?: string;
    /** Header title alignment */
    titleAlignment?: 'Left' | 'Center' | undefined;
    /** Toggle of the divider line between widget header and chart */
    dividerLine?: boolean;
    /** Divider line color */
    dividerLineColor?: string;
    /** Header background color */
    backgroundColor?: string;
  };
}

/**
 * Runs type guard check for ThemeOid.
 *
 * @internal
 */
export function isThemeOid(arg: ThemeOid | ThemeSettings): arg is ThemeOid {
  return typeof arg === 'string';
}

/** HEX color value or CSS color name. */
export declare type Color = string | null;

/** Collection of colors used to color various elements. */
export declare type ColorPaletteTheme = {
  /** Set of colors used to color chart elements */
  variantColors: Color[];
};

/** Configuration for the drilldown */
export type DrilldownOptions = {
  /** Dimensions that can be used for drilldown */
  drilldownDimensions?: Attribute[];
  /** Current selections for multiple drilldowns */
  drilldownSelections?: DrilldownSelection[];
};

/** Selection for the drilldown */
export type DrilldownSelection = {
  /** Points selected for drilldown */
  points: DataPoint[];
  /** Dimension to drilldown to */
  nextDimension: Attribute;
};

// only arrays of same elements
export type DataPoints = DataPoint[] | ScatterDataPoint[];

/** Data point in a chart. */
export type DataPoint = {
  /** Value of the data point */
  value?: string | number;
  /** Categorical value of the data point */
  categoryValue?: string | number;
  /** Display value of categorical value of the data point */
  categoryDisplayValue?: string;
  /** Series associated with the data point */
  seriesValue?: string | number;
};

/** Data point in a chart. */
export type ScatterDataPoint = {
  x?: string | number;
  y?: string | number;
  size?: number;
  breakByPoint?: string;
  breakByColor?: string;
};

/**
 * This is the minimum definition of Highcharts
 * events, Series, and Point that we require. As
 * we add more capabilities we may add more to
 * these type definitions
 *
 * @internal
 */
export type HighchartsPointerEvent = PointerEvent & {
  point: HighchartsPoint;
};

/**
 * @internal
 */
export type HighchartsSelectEvent = {
  originalEvent: MouseEvent;
  preventDefault: () => void;
  xAxis: HighchartsSelectEventAxis[];
  yAxis: HighchartsSelectEventAxis[];
};
/**
 * @internal
 */
export type HighchartsSelectEventAxis = {
  axis: { series: Series[]; coll: 'xAxis' | 'yAxis' };
  min: number;
  max: number;
};
/**
 * @internal
 */
export type Series = {
  points: HighchartsPoint[];
};
/**
 * @internal
 */
export type HighchartsPoint = {
  category: string;
  name?: string;
  options: {
    name: string;
    custom: {
      number1?: number;
    };
  };
  custom: {
    maskedBreakByPoint?: string;
    maskedBreakByColor?: string;
    rawValue?: string | number;
    xValue?: (string | number)[];
  };
  series: {
    initialType: string;
    options: {
      custom?: { rawValue?: string | number[] };
    };
  };
  graphic?: {
    on: (eventType: string, callback: (event: PointerEvent) => void) => HighchartsPoint['graphic'];
  };
  x: number;
  y: number;
  z: number;
};

/**
 * @internal
 */
export type OptionsWithAlerts<T> = {
  options: T;
  alerts: string[];
};

/**
 * @internal
 */
export type SeriesWithAlerts<T> = {
  series: T;
  alerts: string[];
};

/**
 * Context menu position coordinates
 * Used in {@link ContextMenu} component
 */
export type MenuPosition = {
  /** Horizontal position */
  left: number;
  /** Vertical position */
  top: number;
};

/**
 * Context menu section
 * Used in {@link ContextMenu} component
 */
export type MenuItemSection = {
  /** Optional section title */
  sectionTitle?: string;
  /** Optional list of menu items */
  items?: { key?: string; onClick?: () => void; caption: string }[];
};

/**
 * Result of custom drilldown execution
 *
 * User provides selected points and desired category to drilldown to
 * and receives set of filters to apply and new category to display
 *
 */
export type CustomDrilldownResult = {
  /**
   * The drilldown filters that should be applied to the next drilldown
   */
  drilldownFilters: MembersFilter[];
  /**
   * New dimension that should replace the current dimension
   */
  drilldownDimension: Attribute;
  /**
   * Callback to provide next points to drilldown to
   */
  onDataPointsSelected: DataPointsEventHandler;
  /**
   * Callback to open context menu
   */
  onContextMenu: (menuPosition: MenuPosition) => void;
  /**
   * Breadcrumbs that only allow for selection slicing, clearing, & navigation
   */
  breadcrumbsComponent?: JSX.Element;
};
