/* eslint-disable max-lines */
import type {
  Attribute,
  CalculatedMeasureColumn,
  Column,
  Measure,
  MeasureColumn,
  MembersFilter,
} from '@sisense/sdk-data';
import { DeepRequired } from 'ts-essentials';
import {
  AreaSubtype,
  BoxplotSubtype,
  LineSubtype,
  PieSubtype,
  PolarSubtype,
  StackableSubtype,
  AreaRangeSubtype,
} from './chart-options-processor/subtype-to-design-options';
import {
  IndicatorComponents,
  TableColorOptions,
} from './chart-options-processor/translations/design-options';
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
  AreamapChartType,
  BoxplotChartType,
  ScattermapChartType,
  RangeChartType,
  TableChartType,
} from './chart-options-processor/translations/types';
import { DataPointsEventHandler } from './props';
import { LegendPosition } from './chart-options-processor/translations/legend-section';
import { GeoDataElement, RawGeoDataElement } from './chart-data/types';
import { Coordinates } from '@/charts/map-charts/scattermap/types';
import { StyledColumn, StyledMeasureColumn } from '.';
import { HighchartsOptionsInternal } from './chart-options-processor/chart-options-service';

export type { SortDirection, PivotRowsSort } from '@sisense/sdk-data';
export type { AppConfig } from './app/client-application';
export type { DateConfig } from './query/date-formats';

export type {
  CartesianChartDataOptions,
  CategoricalChartDataOptions,
  ChartDataOptions,
  ScatterChartDataOptions,
  IndicatorChartDataOptions,
  StyledColumn,
  StyledMeasureColumn,
} from './chart-data-options/types';
export type {
  DataColorCondition,
  ConditionalDataColorOptions,
  DataColorOptions,
  RangeDataColorOptions,
  UniformDataColorOptions,
} from './chart-data/data-coloring/types';
// export the following types for TSDoc
export type {
  CartesianChartType,
  CategoricalChartType,
  ScatterChartType,
  IndicatorChartType,
  BoxplotChartType,
  ScattermapChartType,
  AreamapChartType,
  TableType,
  TableChartType,
  AreaSubtype,
  AreaRangeSubtype,
  LineSubtype,
  PieSubtype,
  PolarSubtype,
  StackableSubtype,
  BoxplotSubtype,
  IndicatorComponents,
  ScatterMarkerSize,
  LegendPosition,
  GeoDataElement,
  RawGeoDataElement,
  Coordinates,
  RangeChartType,
  TableColorOptions,
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
  /** The scroll location of the navigator scroller / auto zoom feature */
  scrollerLocation?: { min: number; max: number };
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
  position?: LegendPosition;
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

/** Configuration options that define functional style of the various elements of LineChart */
export interface LineStyleOptions extends BaseStyleOptions, BaseAxisStyleOptions {
  /** Configuration that defines line width */
  lineWidth?: LineWidth;
  /** Subtype of LineChart */
  subtype?: LineSubtype;
}

/** Configuration options that define functional style of the various elements of AreaRangeChart */
export interface AreaRangeStyleOptions extends BaseStyleOptions, BaseAxisStyleOptions {
  /** Configuration that defines line width */
  lineWidth?: LineWidth;
  /** Subtype of AreaRangeChart */
  subtype?: AreaRangeSubtype;
}

/** Configuration options that define functional style of the various elements of AreaChart */
export interface AreaStyleOptions extends BaseStyleOptions, BaseAxisStyleOptions {
  /** Configuration that defines line width */
  lineWidth?: LineWidth;
  /** Subtype of AreaChart*/
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

/** Configuration options that define functional style of the various elements of FunnelChart */
export interface FunnelStyleOptions extends BaseStyleOptions {
  /** Visual size of the lowest slice (degree of funnel narrowing from highest to lowest slices)*/
  funnelSize?: FunnelSize;
  /** Visual type of the lowest slice of FunnelChart */
  funnelType?: FunnelType;
  /** Direction of FunnelChart narrowing */
  funnelDirection?: FunnelDirection;
  /** Configuration that defines behavior of data labels on FunnelChart */
  labels?: Labels;
  /** Subtype of FunnelChart*/
  subtype?: never;
}

/** Configuration options that define functional style of the various elements of PolarChart */
export interface PolarStyleOptions extends BaseStyleOptions, BaseAxisStyleOptions {
  /** Subtype of PolarChart*/
  subtype?: PolarSubtype;
}

/** Configuration options that define functional style of the various elements of IndicatorChart */
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

/** Configuration options that define functional style of the various elements of the Table Component */
export interface TableStyleOptions {
  /**
   * Boolean flag whether to fill header cells with background color
   *
   * @deprecated Use {@link TableStyleOptions#header | TableStyleOptions.header.color} instead.
   */
  headersColor?: boolean;
  /**
   * Boolean flag whether to apply background color to alternate rows.
   *
   * @deprecated Use {@link TableStyleOptions#rows | TableStyleOptions.rows.alternatingColor} instead.
   */
  alternatingRowsColor?: boolean;
  /**
   * Boolean flag whether to apply background color to alternate columns
   *
   * @deprecated Use {@link TableStyleOptions#columns | TableStyleOptions.columns.alternatingColor} instead.
   */
  alternatingColumnsColor?: boolean;
  /**
   * Vertical padding around whole table
   * Default value is 20px
   *
   */
  paddingVertical?: number;
  /**
   * Horizontal padding around whole table
   * Default value is 20px
   *
   */
  paddingHorizontal?: number;
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
  /**
   * Header options
   */
  header?: {
    /**
     * Color of header
     */
    color?: TableColorOptions;
  };
  /**
   * Columns options
   */
  columns?: {
    /**
     * Alternating color for columns
     */
    alternatingColor?: TableColorOptions;
    /**
     * Modes of columns width
     * 'auto' - all columns will have the same width and fit the table width (no horizontal scroll)
     * 'content' - columns width will be based on content (default option)
     */
    width?: 'auto' | 'content';
  };
  /**
   * Rows options
   */
  rows?: {
    /**
     * Alternating color for rows
     */
    alternatingColor?: TableColorOptions;
  };
}

/** Configuration options that define functional style of the various elements of the tabular charts. */
export type TabularChartStyleOptions = TableStyleOptions;

/** Configuration options that define functional style of the various elements of the PivotTable component. */
export interface PivotTableStyleOptions {
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
   * Boolean flag whether to fill row members cells with background color
   */
  membersColor?: boolean;
  /**
   * Boolean flag whether to fill totals and subtotals cells with background color
   */
  totalsColor?: boolean;
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

  /**
   * Boolean flag whether the height of the component should be automatically adjusted to fit the content
   */
  isAutoHeight?: boolean;
  /**
   * Manual height of each row (default is 25px)
   */
  rowHeight?: number;
  /**
   * Color of highlighted cells. If not specified, default value is light yellow (`#ffff9c`).
   */
  highlightColor?: string;
}

/**
 * Common part of IndicatorStyleOptions for all types of indicator
 *
 * @internal
 */
export interface BaseIndicatorStyleOptions {
  indicatorComponents?: IndicatorComponents;
  /** Boolean flag to force render indicator in ticker mode regardless of display size */
  forceTickerView?: boolean;
}

/** Configuration options that define functional style of the various elements of Numeric Simple IndicatorChart */
export interface NumericSimpleIndicatorStyleOptions extends BaseIndicatorStyleOptions {
  subtype: 'indicator/numeric';
  numericSubtype: 'numericSimple';
  skin: 'vertical' | 'horizontal';
}

/** Configuration options that define functional style of the various elements of Numeric Bar IndicatorChart */
export interface NumericBarIndicatorStyleOptions extends BaseIndicatorStyleOptions {
  subtype: 'indicator/numeric';
  numericSubtype: 'numericBar';
}

/** Configuration options that define functional style of the various elements of Gauge IndicatorChart */
export interface GaugeIndicatorStyleOptions extends BaseIndicatorStyleOptions {
  subtype: 'indicator/gauge';
  skin: 1 | 2;
  /** Bar height for gauge indicator in ticker mode */
  tickerBarHeight?: number;
}

/** Configuration options that define functional style of the various elements of ScatterChart */
export interface ScatterStyleOptions extends BaseStyleOptions, BaseAxisStyleOptions {
  /** Subtype of ScatterChart*/
  subtype?: never;
  markerSize?: ScatterMarkerSize;
}

/** Configuration options that define functional style of the various elements of TreemapChart */
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

/** Configuration options that define functional style of the various elements of the SunburstChart component */
export interface SunburstStyleOptions extends BaseStyleOptions {
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

/** Configuration options that define functional style of the various elements of the BoxplotChart component */
export interface BoxplotStyleOptions extends BaseStyleOptions, BaseAxisStyleOptions {
  /** Subtype of the BoxplotChart component*/
  subtype?: BoxplotSubtype;
}

/**
 * Type of map to display on the AreamapChart component
 */
export type AreamapType = 'world' | 'usa';

/**
 * Configuration options that define functional style of the various elements of the AreamapChart component
 */
export interface AreamapStyleOptions extends Pick<BaseStyleOptions, 'width' | 'height'> {
  /** Type of map to display on the AreamapChart component */
  mapType?: AreamapType;
}

/**
 * Markers style configuration of Scattermap chart
 */
export type ScattermapMarkers = {
  /** Specifies the fill style of the markers */
  fill?: 'filled' | 'filled-light' | 'hollow' | 'hollow-bold';
  /** Specifies the size configuration for the markers */
  size?: {
    /** The default size of the markers */
    defaultSize?: number;
    /** The minimum size of the markers when using a "size" data field */
    minSize?: number;
    /** The maximum size of the markers when using a "size" data field */
    maxSize?: number;
  };
};

/** Configuration options that define functional style of the various elements of ScattermapChart */
export interface ScattermapStyleOptions extends Pick<BaseStyleOptions, 'width' | 'height'> {
  subtype?: never;
  markers?: ScattermapMarkers;
}

/**
 * Configuration options that define functional style of the various elements of chart.
 */
export type ChartStyleOptions = RegularChartStyleOptions | TabularChartStyleOptions;

/** Style options for regular chart types */
export type RegularChartStyleOptions =
  | LineStyleOptions
  | AreaStyleOptions
  | StackableStyleOptions
  | PieStyleOptions
  | FunnelStyleOptions
  | PolarStyleOptions
  | IndicatorStyleOptions
  | ScatterStyleOptions
  | TreemapStyleOptions
  | SunburstStyleOptions
  | BoxplotStyleOptions
  | AreamapStyleOptions
  | ScattermapStyleOptions
  | AreaRangeStyleOptions;

/** Mapping of each of the chart value series to colors. */
export type ValueToColorMap = {
  [value: string]: string;
};

/** Mapping of each of the chart columns with mapping of each value series to colors. */
export type MultiColumnValueToColorMap = {
  [columnName: string]: ValueToColorMap;
};

/**
 * Chart type of one of the supported chart families
 */
export type ChartType =
  | CartesianChartType
  | CategoricalChartType
  | ScatterChartType
  | IndicatorChartType
  | AreamapChartType
  | BoxplotChartType
  | ScattermapChartType
  | RangeChartType
  | TableChartType;

/** Chart type of the regular charts */
export type RegularChartType = Exclude<ChartType, TableChartType>;

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
  | 'scatter'
  | 'arearange';

/** The number of decimal places */
export type DecimalScale = number | 'auto';

/**
 * Configuration for number formatting.
 */
export type NumberFormatConfig = {
  /**
   * Supported formats
   */
  name?: 'Numbers' | 'Currency' | 'Percent';
  /**
   * The number of decimal places
   */
  decimalScale?: DecimalScale;
  /**
   * Boolean flag whether to show an abbreviation
   * for a number greater than or equal one trillion - e.g. 1T
   */
  trillion?: boolean;
  /**
   * Boolean flag whether to show an abbreviation
   * for a number greater than or equal one billion - e.g. 1B
   */
  billion?: boolean;
  /**
   * Boolean flag whether to show an abbreviation
   * for a number greater than or equal one million - e.g. 1M
   */
  million?: boolean;
  /**
   * Boolean flag whether to show an abbreviation
   * for a number greater than or equal one thousand - e.g. 1K
   */
  kilo?: boolean;
  /**
   * Boolean flag whether the thousand separator is shown
   *
   * If true, show the thousand separator, e.g. `1,000`. Otherwise, show `1000`
   */
  thousandSeparator?: boolean;
  /**
   * Boolean flag whether `symbol` is shown in front of or after the number
   *
   * If true, append `symbol` in front of the number, e.g. show `$1000` when `symbol` is `$`.
   *
   * If false, append `symbol` after the number, e.g. show `1000¥` when `symbol` is `¥`.
   */
  prefix?: boolean;
  /**
   * Symbol to show in front of or after the number depending on the value of `prefix`.
   */
  symbol?: string;
};

/**
 * {@link NumberFormatConfig} with all props required
 *
 * @internal
 */
export type CompleteNumberFormatConfig = Required<NumberFormatConfig>;

/** Identifier of a theme as defined in the Sisense instance. */
export type ThemeOid = string;

/**
 * Chart theme settings
 */
export interface ChartThemeSettings {
  /** Text color */
  textColor?: string;
  /** Secondary text color - e.g., for the indicator chart's secondary value title */
  secondaryTextColor?: string;
  /** Background color */
  backgroundColor?: string;
  /**
   * Toolbar Background color, can be used as a secondary background color
   *
   * @deprecated
   * */
  panelBackgroundColor?: string;
  /** Animation options */
  animation?: {
    /** Chart initialization animation options */
    init?: {
      /**
       * Animation duration in milliseconds.
       * If not specified, the default value, `auto`, will be used with a different default value applied per chart type.
       */
      duration?: number | 'auto';
    };
    /** Chart redraw animation options */
    redraw?: {
      /**
       * Animation duration in milliseconds.
       * If not specified, the default value, `auto`, will be used with a different default value applied per chart type.
       */
      duration?: number | 'auto';
    };
  };
}

/**
 * Theme settings specific to the AI Chatbot component
 */
export interface AiChatThemeSettings {
  /** Background color of the chatbot */
  backgroundColor?: string;
  /** Text color of the chatbot */
  primaryTextColor?: string;
  /** Secondary text color of the chatbot */
  secondaryTextColor?: string;
  /** Primary font size for text in the chatbot */
  primaryFontSize?: [fontSize: string, lineHeight: string];
  /** Border of the chatbot */
  border?: false | string;
  /** Border radius of the chatbot */
  borderRadius?: false | string;

  /** Settings for the main chat body */
  body?: {
    /** Left padding of the chat body */
    paddingLeft?: string;
    /** Right padding of the chat body */
    paddingRight?: string;
    /** Top padding of the chat body */
    paddingTop?: string;
    /** Bottom padding of the chat body */
    paddingBottom?: string;
    /** Gap size between each message in the chat body */
    gapBetweenMessages?: string;
  };

  /** Settings for the chat footer */
  footer?: {
    /** Left padding of the chat footer */
    paddingLeft?: string;
    /** Right padding of the chat footer */
    paddingRight?: string;
    /** Top padding of the chat footer */
    paddingTop?: string;
    /** Bottom padding of the chat footer */
    paddingBottom?: string;
  };

  /** Settings for user chat messages */
  userMessages?: {
    /** Background color of user chat messages */
    backgroundColor?: string;
  };

  /** Settings for system chat messages */
  systemMessages?: {
    /** Background color of system chat messages */
    backgroundColor?: string;
  };

  /** Settings for the chatbot input */
  input?: {
    /** Background color of the input */
    backgroundColor?: string;
    /** Settings to be applied on input focus */
    focus?: {
      /** Outline color of the input */
      outlineColor?: string;
    };
  };

  /** Settings for the chatbot header */
  header?: {
    /** Background color of the chatbot header */
    backgroundColor?: string;
    /** Text color of the chatbot header */
    textColor?: string;
    /** Settings to be applied on hover of the header */
  };

  /** Settings for chatbot dropup */
  dropup?: {
    /** Background color of the dropup */
    backgroundColor?: string;
    /** Box shadow of the dropup */
    boxShadow?: string;
    /** Border radius of the dropup */
    borderRadius?: string;
    /** Settings for the section headers of the dropup */
    headers?: {
      /** Text color of headers */
      textColor?: string;
      /** Settings to be applied on hover of the headers */
      hover?: {
        /** Background color of headers on hover */
        backgroundColor?: string;
      };
    };
    /** Settings for the dropup items */
    items?: {
      /** Text color of the dropup items */
      textColor?: string;
      /** Settings to be applied on hover of dropup items */
      hover?: {
        /** Background color of dropup items on hover */
        backgroundColor?: string;
      };
    };
  };

  /** Settings for the chatbot suggestions */
  suggestions?: {
    /** Text color of the chatbot suggestions */
    textColor?: string;
    /** Background color of the chatbot suggestions */
    backgroundColor?: string;
    /** Border of the chatbot suggestions */
    border?: string;
    /** 2-color gradient to be applied on the border */
    borderGradient?: [string, string] | null;
    /** Border radius of the chatbot suggestions */
    borderRadius?: string;
    /** Setting to be applied on hover */
    hover?: {
      /** Text color of the chatbot suggestions on hover */
      textColor?: string;
      /** Background color of the chatbot suggestions on hover */
      backgroundColor?: string;
    };
    /** 2-color gradient to be applied on suggestions loading animation */
    loadingGradient?: [string, string];
    /** Gap size between each suggestion item */
    gap?: string;
  };

  /** Settings for the chatbot clickable messages */
  clickableMessages?: {
    /** Text color of the chatbot clickable messages */
    textColor?: string;
    /** Background color of the chatbot clickable messages */
    backgroundColor?: string;
    /** Border of the chatbot clickable messages */
    border?: false | string;
    /** 2-color gradient to be applied on the border */
    borderGradient?: [string, string] | null;
    /** Setting to be applied on hover */
    hover?: {
      /** Text color of the chatbot clickable messages on hover */
      textColor?: string;
      /** Background color of the chatbot clickable messages on hover */
      backgroundColor?: string;
    };
  };

  /** Settings for the data topics screen */
  dataTopics?: {
    /** Background color of the data topics screen */
    backgroundColor?: string;
    /** Settings for the individual data topic items */
    items?: {
      /** Text color of the data topic items */
      textColor?: string;
      /** Background color of the data topic items */
      backgroundColor?: string;
    };
  };

  /** Settings for the chatbot icons */
  icons?: {
    /** Color of the chatbot icons */
    color?: string;
    /** Settings for feedback icons */
    feedbackIcons?: {
      /** Background color of the feedback icons on hover */
      hoverColor?: string;
    };
  };

  /** Settings for the chatbot tooltips */
  tooltips?: {
    /** Background color of the tooltips */
    backgroundColor?: string;
    /** Text color of the tooltips */
    textColor?: string;
    /** Box shadow of the tooltips */
    boxShadow?: string;
  };
}

export type ThemeSettingsFontSource =
  | {
      local: string;
    }
  | {
      url: string;
    }
  | {
      format: string;
      url: string;
    };

/** Loading font details */
export interface ThemeSettingsFont {
  fontFamily: string;
  fontWeight: string | number;
  fontStyle: string;
  src: ThemeSettingsFontSource[];
}

/** Settings for fonts loading */
export interface FontsLoaderSettings {
  /** List of fonts */
  fonts: ThemeSettingsFont[];
}

/** Text theme settings */
export interface TypographyThemeSettings {
  /** Font family name to style component text */
  fontFamily?: string;
  /** Primary text color */
  primaryTextColor?: string;
  /** Secondary text color */
  secondaryTextColor?: string;
  /** Settings for font loading */
  fontsLoader?: FontsLoaderSettings;
}

/** General theme settings */
export interface GeneralThemeSettings {
  /** Main color used for various elements like primary buttons, switches, etc. */
  brandColor?: string;
  /** Background color used for elements like tiles, etc. */
  backgroundColor?: string;
  /** Text color for primary buttons */
  primaryButtonTextColor?: string;
  /** Hover color for primary buttons */
  primaryButtonHoverColor?: string;
}

/** Possible sizes for spacing. */
export type SpaceSizes = 'None' | 'Large' | 'Medium' | 'Small';
/** Possible sizes for border radius. */
export type RadiusSizes = 'None' | 'Large' | 'Medium' | 'Small';
/** Possible types of shadows. */
export type ShadowsTypes = 'None' | 'Light' | 'Medium' | 'Dark';
/** Possible types of text alignment. */
export type AlignmentTypes = 'Left' | 'Center' | 'Right';

/** Widget theme settings */
export type WidgetThemeSettings = {
  /** Space between widget container edge and the chart */
  spaceAround?: SpaceSizes;
  /** Corner radius of the widget container */
  cornerRadius?: RadiusSizes;
  /**
   * Shadow level of the widget container
   *
   * Effective only when spaceAround is defined
   */
  shadow?: ShadowsTypes;
  /** Widget container border toggle */
  border?: boolean;
  /** Widget container border color */
  borderColor?: string;
  /** Widget header styles */
  header?: {
    /** Header title text color */
    titleTextColor?: string;
    /** Header title alignment */
    titleAlignment?: AlignmentTypes;
    /** Toggle of the divider line between widget header and chart */
    dividerLine?: boolean;
    /** Divider line color */
    dividerLineColor?: string;
    /** Header background color */
    backgroundColor?: string;
  };
};

/**
 * Dashboard theme settings
 *
 * @internal
 */
export type DashboardThemeSettings = {
  /** Background color */
  backgroundColor?: string;
  /** Width of the divider line between widgets */
  dividerLineWidth?: number;
  /** Divider line color */
  dividerLineColor?: string;
};

/**
 * Filter theme settings
 */
export type FilterThemeSettings = {
  panel: {
    /** Title color */
    titleColor?: string;
    /** Background color */
    backgroundColor?: string;
  };
};

/** Theme settings defining the look and feel of components. */
export interface ThemeSettings {
  /** Chart theme settings */
  chart?: ChartThemeSettings;

  /** Collection of colors used to color various elements */
  palette?: ColorPaletteTheme;

  /** Text theme settings */
  typography?: TypographyThemeSettings;

  /** General theme settings */
  general?: GeneralThemeSettings;

  /** Widget theme settings */
  widget?: WidgetThemeSettings;

  /**
   * Dashboard theme settings
   *
   * @internal
   */
  dashboard?: DashboardThemeSettings;

  /** Filter theme settings */
  filter?: FilterThemeSettings;

  /**
   * Theme settings specific to the AI Chatbot component
   */
  aiChat?: AiChatThemeSettings;
}

/**
 * Complete set of theme settings defining the look and feel of components.
 *
 * @internal
 */
export type CompleteThemeSettings = DeepRequired<Omit<ThemeSettings, 'typography'>> & {
  typography: DeepRequired<Omit<TypographyThemeSettings, 'fontsLoader'>> & {
    fontsLoader?: FontsLoaderSettings;
  };
};

/** Complete set of configuration options that define functional style of the various elements of the charts as well as the look and feel of widget itself and widget header. */
export type WidgetStyleOptions =
  | (ChartStyleOptions | TableStyleOptions | TextWidgetStyleOptions) & WidgetContainerStyleOptions;

/** Style settings defining the look and feel of widget itself and widget header */
export interface WidgetContainerStyleOptions {
  /** Space between widget container edge and the chart */
  spaceAround?: SpaceSizes;
  /** Corner radius of the widget container */
  cornerRadius?: RadiusSizes;
  /**
   * Shadow level of the widget container
   *
   * Effective only when spaceAround is defined
   */
  shadow?: ShadowsTypes;
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
    titleAlignment?: AlignmentTypes;
    /** Toggle of the divider line between widget header and chart */
    dividerLine?: boolean;
    /** Divider line color */
    dividerLineColor?: string;
    /** Header background color */
    backgroundColor?: string;
    /**
     * Custom toolbar to render to the right of the title
     *
     * @internal
     */
    renderToolbar?: RenderToolbarHandler;
  };
}

/** @internal */
export type RenderToolbarHandler = (
  onRefresh: () => void,
  defaultToolbar: JSX.Element,
) => JSX.Element | null;

/** Style settings defining the look and feel of DashboardWidget */
export interface DashboardWidgetStyleOptions extends WidgetContainerStyleOptions {
  /**
   * Total width of the component, which is considered in the following order of priority:
   *
   * 1. Value passed to this property (in pixels)
   * 2. Width of the container wrapping this component
   * 3. Default value as specified per chart type
   *
   */
  width?: number;
  /**
   * Total height of the component, which is considered in the following order of priority:
   *
   * 1. Value passed to this property (in pixels).
   * 2. Height of the container wrapping this component
   * 3. Default value as specified per chart type
   */
  height?: number;
}

/** Style settings defining the look and feel of ChartWidget */
export type ChartWidgetStyleOptions = ChartStyleOptions & WidgetContainerStyleOptions;

/**
 * Style settings defining the look and feel of TableWidget
 *
 * @internal
 */
export type TableWidgetStyleOptions = TableStyleOptions & WidgetContainerStyleOptions;

/**
 * Style settings defining the look and feel of TableWidget
 *
 * @internal
 */
export type PivotTableWidgetStyleOptions = PivotTableStyleOptions & WidgetContainerStyleOptions;

/**
 * Style settings defining the look and feel of TextWidget
 */
export type TextWidgetStyleOptions = {
  html: string;
  vAlign: `valign-${'middle' | 'top' | 'bottom'}`;
  bgColor: string;
};

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
  points: ChartDataPoint[];
  /** Dimension to drilldown to */
  nextDimension: Attribute;
};

/**
 * Data points in a chart. Array of data points of the same data point type.
 */
export type ChartDataPoints =
  | DataPoint[]
  | ScatterDataPoint[]
  | BoxplotDataPoint[]
  | AreamapDataPoint[]
  | ScattermapDataPoint[];

/**
 * Abstract data point in a chart - union of all types of data points.
 */
export type ChartDataPoint =
  | DataPoint
  | ScatterDataPoint
  | BoxplotDataPoint
  | AreamapDataPoint
  | ScattermapDataPoint;

/**
 * Abstract data point in a chart that based on Highcharts.
 *
 * @internal
 */
export type HighchartsBasedChartDataPoint = DataPoint | ScatterDataPoint | BoxplotDataPoint;

/**
 * Abstract event handler for data point click event
 *
 * @internal
 */
export type ChartDataPointEventHandler = (
  point: ChartDataPoint,
  nativeEvent: PointerEvent | MouseEvent,
) => void;

/** Data point in a regular chart. */
export type DataPoint = {
  /** Value of the data point */
  value?: string | number;
  /** Categorical value of the data point */
  categoryValue?: string | number;
  /** Display value of categorical value of the data point */
  categoryDisplayValue?: string;
  /** Series associated with the data point */
  seriesValue?: string | number;
  /**
   * A collection of data point entries that represents values for all related `dataOptions`.
   *
   * @internal
   */
  entries?: {
    category: DataPointEntry[];
    value: DataPointEntry[];
    breakBy?: DataPointEntry[];
  };
};

/**
 * A data point entry that represents a single dimension within a multi-dimensional data point.
 *
 * @internal
 */
export type DataPointEntry = {
  /**
   * The unique identifier of the data point entry.
   * It represents the path within the `dataOptions` object that identifies the related option.
   */
  readonly id: string;
  /** The data option associated with this entry */
  dataOption: Column | StyledColumn | MeasureColumn | CalculatedMeasureColumn | StyledMeasureColumn;
  /** The attribute associated with this data point entry */
  attribute?: Attribute;
  /** The measure associated with this data point entry */
  measure?: Measure;
  /** The raw value of the data point */
  value: string | number;
  /** The formated value of the data point */
  displayValue?: string;
};

/** Data point in a Scatter chart. */
export type ScatterDataPoint = {
  x?: string | number;
  y?: string | number;
  size?: number;
  breakByPoint?: string;
  breakByColor?: string;
  /**
   * A collection of data point entries that represents values for all related `dataOptions`.
   *
   * @internal
   */
  entries?: {
    x?: DataPointEntry;
    y?: DataPointEntry;
    size?: DataPointEntry;
    breakByPoint?: DataPointEntry;
    breakByColor?: DataPointEntry;
  };
};

/** Data point in a Boxplot chart. */
export type BoxplotDataPoint = {
  /** Value of the box minimum */
  boxMin?: number;
  /** Value of the box median */
  boxMedian?: number;
  /** Value of the box maximum */
  boxMax?: number;
  /** Value of the box minimal whisker */
  whiskerMin?: number;
  /** Value of the box maximal whisker */
  whiskerMax?: number;
  /** Value of the category for the data point */
  categoryValue?: string | number;
  /** Display value of category of the data point */
  categoryDisplayValue?: string;
  /** Value of the outlier */
  outlier?: number;
  /**
   * A collection of data point entries that represents values for all related `dataOptions`.
   *
   * @internal
   */
  entries?: {
    category: DataPointEntry[];
    value: DataPointEntry[];
    outliers: DataPointEntry[];
  };
};

/**
 * Data point in an Areamap chart.
 */
export type AreamapDataPoint = GeoDataElement & {
  /**
   * A collection of data point entries that represents values for all related `dataOptions`.
   *
   * @internal
   */
  entries?: {
    geo: DataPointEntry[];
    color: DataPointEntry[];
  };
};

/**
 * Data point in an Scattermap chart.
 */
export type ScattermapDataPoint = {
  /** Location name displayed on marker */
  displayName: string;
  /** Array with categories strings used for location definition */
  categories: string[];
  /** Numeric measure value */
  value: number;
  /** Location coordinates */
  coordinates: Coordinates;
  /**
   * A collection of data point entries that represents values for all related `dataOptions`.
   *
   * @internal
   */
  entries?: {
    geo: DataPointEntry[];
    size?: DataPointEntry;
    colorBy?: DataPointEntry;
    details?: DataPointEntry;
  };
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
  state?: string;
  options: {
    name: string;
    custom: {
      number1?: number;
      level?: number;
      levelsCount?: number;
    };
    q1?: number;
    median?: number;
    q3?: number;
    low?: number;
    high?: number;
    y?: number;
  };
  custom: {
    maskedX?: string;
    maskedY?: string;
    maskedBreakByPoint?: string;
    maskedBreakByColor?: string;
    maskedSize?: string;
    rawValue?: string | number;
    xValue?: (string | number)[];
    xDisplayValue?: string[];
    rawValues?: (string | number)[];
    xValues?: string[];
  };
  series: {
    initialType: string;
    type: string;
    options: {
      custom?: { rawValue?: string | number[] };
    };
    index: number;
    chart: {
      options: HighchartsOptionsInternal;
    };
    name: string;
  };
  graphic?: {
    on: (eventType: string, callback: (event: PointerEvent) => void) => HighchartsPoint['graphic'];
  };
  x: number;
  y: number;
  z: number;
  index: number;
  value?: number;
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
 * Used in {@link ContextMenuProps}
 */
export type MenuPosition = {
  /** Horizontal position */
  left: number;
  /** Vertical position */
  top: number;
};

/**
 * Context menu section
 * Used in {@link ContextMenuProps}
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

/**
 * A config that defines the behavior of the loading indicator
 */
export type LoadingIndicatorConfig = {
  /**
   * Delay in milliseconds before the loading indicator is shown
   */
  delay?: number;
  /**
   * Boolean flag that defines if the loading indicator should be shown
   */
  enabled?: boolean;
};
