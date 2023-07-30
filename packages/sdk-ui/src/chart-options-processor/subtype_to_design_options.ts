import {
  LineType,
  StackType,
} from '../chart-options-processor/translations/translations_to_highcharts';
import {
  IndicatorStyleType,
  PolarType,
} from '../chart-options-processor/translations/design_options';
import { PieType } from '../chart-options-processor/translations/pie_plot_options';

export type LineSubtype = 'line/spline' | 'line/basic';
export type AreaSubtype =
  | 'area/basic'
  | 'area/stacked'
  | 'area/stacked100'
  | 'area/spline'
  | 'area/stackedspline'
  | 'area/stackedspline100';
export type StackableSubtype =
  | 'bar/classic'
  | 'bar/stacked'
  | 'bar/stacked100'
  | 'column/classic'
  | 'column/stackedcolumn'
  | 'column/stackedcolumn100';
export type PieSubtype = 'pie/classic' | 'pie/donut' | 'pie/ring';
export type PolarSubtype = 'polar/column' | 'polar/area' | 'polar/line';
export type IndicatorSubtype = 'indicator/numeric' | 'indicator/gauge';

export type ChartSubtype =
  | LineSubtype
  | AreaSubtype
  | StackableSubtype
  | PieSubtype
  | PolarSubtype
  | IndicatorSubtype;

export const chartSubtypeToDesignOptions = Object.freeze<
  Record<
    ChartSubtype,
    {
      lineType?: LineType;
      stackType?: StackType;
      pieType?: PieType;
      polarType?: PolarType;
      indicatorType?: IndicatorStyleType;
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
});
