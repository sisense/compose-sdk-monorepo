import { ChartData } from '@/domains/visualizations/core/chart-data/types';
import { NumberFormatConfig } from '@/types';

/**
 * Computed comparison data for a KPI chart, as resolved by the data layer.
 * Mirrors the public {@link KpiComparison} union, with all math and coloring resolved.
 *
 * @internal
 */
export type KpiComparisonData =
  | {
      type: 'previous-period';
      baseline: number;
      deltaValue: number;
      deltaPercent?: number;
      labelKey: string;
    }
  | {
      type: 'delta';
      baseline: number;
      deltaValue: number;
      deltaPercent?: number;
      label: string;
      color?: string;
    }
  | {
      type: 'target';
      target: number;
      percentOfTarget?: number;
      toGo: number;
      label: string;
      color?: string;
    }
  | {
      type: 'value';
      value: number;
      label: string;
      color?: string;
      numberFormatConfig?: NumberFormatConfig;
    };

/**
 * Processed chart data ready for the KPI renderer.
 *
 * @internal
 */
export type KpiChartData = {
  type: 'kpi';
  /** Whether the query returned any rows; false triggers the no-results overlay. */
  hasRows: boolean;
  value?: number;
  valueTitle: string;
  valueColor?: string;
  /** Last date bucket as epoch milliseconds — shown in the header when the headline is the last bucket. */
  valuePeriodMs?: number;
  /**
   * Raw value of the category cell the headline was read from (e.g. `'2013-01-01T00:00:00'`),
   * as opposed to {@link valuePeriodMs}'s parsed epoch. This is the form every other chart's
   * `entries.category` carries, so it's what downstream filter builders (cross-filtering, JTD)
   * can parse. Set only when the headline is a single bucket — so not for a `valueMode: 'total'`
   * aggregate, barring the marker-less fallback below, which reads the last bucket after all.
   */
  categoryValue?: string | number;
  /**
   * Display text of the category cell the headline was read from — the caption's stand-in for
   * {@link valuePeriodMs} when the category isn't a date, and therefore set only in that case.
   * Follows {@link categoryValue}'s single-bucket rule otherwise.
   */
  categoryDisplayValue?: string;
  numberFormatConfig?: NumberFormatConfig;
  comparison?: KpiComparisonData;
  /**
   * `null` points are gaps in the sparkline, never rendered as zero. `x` is the bucket's epoch
   * for a date category and its plain ordinal otherwise, in which case `categoryDisplayValue`
   * carries the bucket's own label — see `getKpiChartData`.
   */
  sparklinePoints?: { x: number; y: number | null; categoryDisplayValue?: string }[];
};

/**
 * Checks whether the given generic chart data is shaped as {@link KpiChartData}.
 * @internal
 */
export const isKpiChartData = (chartData: ChartData): chartData is KpiChartData =>
  chartData.type === 'kpi';
