import { useMemo, useRef } from 'react';

import Highcharts from '@sisense/sisense-charts';
import HighchartsReact from 'highcharts-react-official';

import { useDateFormatter } from '@/shared/hooks/useDateFormatter.js';
import type { NumberFormatConfig } from '@/types.js';

import { SparklineArea } from './kpi-card-styles.js';
import { buildSparklineOptions, SparklineChartType, SparklinePoint } from './sparkline-options.js';
import { useElementSize } from './use-element-size.js';

/**
 * Defines the props of {@link KpiSparkline}.
 * @internal
 */
export type KpiSparklineProps = {
  points: SparklinePoint[];
  chartType: SparklineChartType;
  color: string;
  numberFormatConfig?: NumberFormatConfig;
  /**
   * Date format for the tooltip's category value, taken from the category data option's
   * `dateFormat`. Falls back to {@link DEFAULT_TOOLTIP_DATE_FORMAT} when unset.
   */
  dateFormat?: string;
  /**
   * Headline measure's title, shown as the tooltip's leading label -- the KPI card's counterpart
   * of the series name other chart tooltips lead with.
   */
  valueTitle?: string;
  /**
   * Color of the tooltip's value, defaulting to `color`. The theme accent belongs here: `color` is
   * dimmed or flipped to white for contrast against the card, which the tooltip's own white body
   * doesn't share -- see {@link SparklineFormatting.valueColor}.
   */
  tooltipValueColor?: string;
};

/**
 * Tooltip date format used when the category data option carries no `dateFormat` of its own.
 * Day-precision, unlike the card's period caption: a tooltip labels one individual bucket, so it
 * has to stay unambiguous at every granularity the sparkline can plot.
 */
const DEFAULT_TOOLTIP_DATE_FORMAT = 'MMM d, yyyy';

/**
 * Renders the KPI card's inline sparkline. Hidden from assistive tech (`aria-hidden`) since it's
 * a decorative echo of data already conveyed by the headline value and comparison readout.
 *
 * The chart is given an explicit `chart.width`/`chart.height` measured from its own cell (via
 * {@link useElementSize}'s `ResizeObserver`), re-applied whenever the cell resizes -- see
 * {@link buildSparklineOptions}'s `size` param for why this is needed instead of relying on
 * Highcharts' own container auto-detection.
 * @internal
 */
export function KpiSparkline({
  points,
  chartType,
  color,
  numberFormatConfig,
  dateFormat,
  valueTitle,
  tooltipValueColor,
}: KpiSparklineProps) {
  const dateFormatter = useDateFormatter();
  const areaRef = useRef<HTMLDivElement>(null);
  const { width, height } = useElementSize(areaRef);

  const options = useMemo(
    () =>
      buildSparklineOptions(
        points,
        chartType,
        color,
        {
          numberFormatConfig,
          formatDate: (epochMs) =>
            dateFormatter(new Date(epochMs), dateFormat ?? DEFAULT_TOOLTIP_DATE_FORMAT),
          valueTitle,
          valueColor: tooltipValueColor,
        },
        // Not yet measured (0x0) -- omit the size and let Highcharts auto-detect for the very
        // first paint rather than explicitly sizing it to nothing.
        width > 0 && height > 0 ? { width, height } : undefined,
      ),
    [
      points,
      chartType,
      color,
      numberFormatConfig,
      dateFormat,
      valueTitle,
      tooltipValueColor,
      dateFormatter,
      width,
      height,
    ],
  );

  return (
    <SparklineArea ref={areaRef} data-kpi-area="sparkline" aria-hidden="true">
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        containerProps={{ style: { width: '100%', height: '100%' } }}
      />
    </SparklineArea>
  );
}
