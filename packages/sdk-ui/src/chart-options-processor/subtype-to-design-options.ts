import { LineType, StackType } from './translations/translations-to-highcharts';
import { IndicatorStyleType, PolarType, BoxplotType } from './translations/design-options';
import { PieType } from './translations/pie-plot-options';

/**
 * Property of {@link LineStyleOptions}
 *
 * Subtype of {@link LineChart}
 *
 * **Values**
 *
 * - `line/spline` - curved line from point to point.
 * - `line/basic` - straight line from point to point.
 *
 */
export type LineSubtype = 'line/spline' | 'line/basic';

/**
 * Property of {@link AreaStyleOptions}
 *
 * Subtype of {@link AreaChart}
 *
 * **Values**
 *
 * - `area/basic` - straight lines showing areas that overlap so that smaller areas appear on top of larger areas and cover them.
 * - `area/stacked` - straight lines showing areas that are stacked on top of each other and do not overlap.
 * - `area/stacked100` - straight lines showing areas that are stacked on top of each other but do not overlap so that the combined area is stretched to the top representing 100%.
 * - `area/spline` - curved lines showing areas that overlap so that smaller areas appear on top of larger areas and cover them.
 * - `area/stackedspline` - curved lines showing areas that are stacked on top of each other and do not overlap.
 * - `area/stackedspline100` - curved lines showing areas that are stacked on top of each other but do not overlap so that the combined area is stretched to the top representing 100%.
 *
 */
export type AreaSubtype =
  | 'area/basic'
  | 'area/stacked'
  | 'area/stacked100'
  | 'area/spline'
  | 'area/stackedspline'
  | 'area/stackedspline100';

/**
 * Property of {@link StackableSubtype}
 *
 * Subtype of {@link BarChart}
 *
 *  **Values**
 * - `bar/classic` - y axis values displayed vertically.
 * - `bar/stacked` - y axis values are stacked next to each other and do not overlap.
 * - `bar/stacked100` - y axis values are stacked next to each other but do not overlap and combined and stretched to represent 100%.
 * - `column/classic` - columns are displayed side by side.
 * - `column/stackedcolumn` - columns are stacked on top of each other and do not overlap.
 * - `column/stackedcolumn100` - columns are stacked on top of each other but do not overlap and combined and stretched to represent 100%.
 *
 */
export type StackableSubtype =
  | 'bar/classic'
  | 'bar/stacked'
  | 'bar/stacked100'
  | 'column/classic'
  | 'column/stackedcolumn'
  | 'column/stackedcolumn100';

/**
 * Property of {@link PieStyleOptions}
 *
 * Subtype of {@link PieChart}
 *
 * **Values**
 *
 * - `pie/classic` - a circle divided into a series of segments where each segment represents a particular category.
 * - `pie/donut` - a circle divided into a series of segments where each segment represents a particular category with its center cut out to look like a donut.
 * - `pie/ring` - a circle divided into a series of segments where each segment represents a particular category with its center cut out to look like a ring.
 *
 */
export type PieSubtype = 'pie/classic' | 'pie/donut' | 'pie/ring';

/**
 * Property of {@link PolarStyleOptions}
 *
 * Subtype of {@link PolarChart}
 *
 * **Values**
 *
 * - `polar/column` - a chart where data points are displayed using the angle and distance from the center point.
 * - `polar/area` - a chart in which the data points are connected by a line with the area below the line filled.
 * - `polar/line` -  a chart in which the data points are connected by a line.
 */
export type PolarSubtype = 'polar/column' | 'polar/area' | 'polar/line';

/**
 *
 * Subtype of {@link IndicatorChart}
 *
 * **Values**
 *
 * - `indicator/numeric` - a numeric value representing a value.
 * - `indicator/gauge` - a gauge representing a value  between the min and the max.
 */
export type IndicatorSubtype = 'indicator/numeric' | 'indicator/gauge';

/**
 *
 * Subtype of {@link TreemapChart}
 *
 * **Values**
 *
 * - `treemap` - default treemap.
 */
export type TreemapSubtype = 'treemap';

export type SunburstSubtype = 'sunburst';

export type BoxplotSubtype = 'boxplot/full' | 'boxplot/hollow';

export type ScattermapSubtype = 'scattermap';

export type ChartSubtype =
  | LineSubtype
  | AreaSubtype
  | StackableSubtype
  | PieSubtype
  | PolarSubtype
  | IndicatorSubtype
  | TreemapSubtype
  | SunburstSubtype
  | BoxplotSubtype
  | ScattermapSubtype;

export const chartSubtypeToDesignOptions = Object.freeze<
  Record<
    ChartSubtype,
    {
      lineType?: LineType;
      stackType?: StackType;
      pieType?: PieType;
      polarType?: PolarType;
      indicatorType?: IndicatorStyleType;
      boxplotType?: BoxplotType;
    }
  >
>({
  'area/basic': { lineType: 'straight', stackType: 'classic' },
  'area/stacked': { lineType: 'straight', stackType: 'stacked' },
  'area/stacked100': { lineType: 'straight', stackType: 'stack100' },
  'area/spline': { lineType: 'smooth', stackType: 'classic' },
  'area/stackedspline': { lineType: 'smooth', stackType: 'stacked' },
  'area/stackedspline100': { lineType: 'smooth', stackType: 'stack100' },
  'bar/classic': { stackType: 'classic' },
  'bar/stacked': { stackType: 'stacked' },
  'bar/stacked100': { stackType: 'stack100' },
  'column/classic': { stackType: 'classic' },
  'column/stackedcolumn': { stackType: 'stacked' },
  'column/stackedcolumn100': { stackType: 'stack100' },
  'line/basic': { lineType: 'straight' },
  'line/spline': { lineType: 'smooth' },
  'pie/classic': { pieType: 'classic' },
  'pie/donut': { pieType: 'donut' },
  'pie/ring': { pieType: 'ring' },
  'polar/column': { polarType: 'column' },
  'polar/area': { polarType: 'area' },
  'polar/line': { polarType: 'line' },
  'indicator/numeric': { indicatorType: 'numeric' },
  'indicator/gauge': { indicatorType: 'gauge' },
  treemap: {},
  sunburst: {},
  'boxplot/full': { boxplotType: 'full' },
  'boxplot/hollow': { boxplotType: 'hollow' },
  scattermap: {},
});
