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
  numberFormatConfig?: NumberFormatConfig;
  comparison?: KpiComparisonData;
  /** `null` points are gaps in the sparkline, never rendered as zero. */
  sparklinePoints?: { x: number; y: number | null }[];
};

/**
 * Checks whether the given generic chart data is shaped as {@link KpiChartData}.
 * @internal
 */
export const isKpiChartData = (chartData: ChartData): chartData is KpiChartData =>
  chartData.type === 'kpi';
