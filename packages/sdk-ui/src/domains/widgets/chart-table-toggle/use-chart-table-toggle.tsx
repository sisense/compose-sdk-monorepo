import { useCallback, useMemo, useState } from 'react';

import type { ChartWidgetConfig } from '@/domains/widgets/components/widget/widget-config';
import { withHeaderItemsInConfig } from '@/domains/widgets/helpers/header-items-utils';

import {
  ChartTableToggleButton,
  type ChartTableToggleLabels,
  DEFAULT_CHART_TABLE_TOGGLE_LABELS,
} from './chart-table-toggle-button';
import { createChartTableToggleItem } from './chart-table-toggle-header-item';
import {
  applyChartTableOverride,
  hasTrendOrForecast,
  shouldShowChartTableToggle,
  toResetIdentity,
} from './chart-to-table-toggle';

/**
 * Options for {@link useChartTableToggle}.
 *
 * @sisenseInternal
 */
export type UseChartTableToggleOptions = {
  dataOptions?: unknown;
  labels?: ChartTableToggleLabels;
  /** Primitive identity. Non-primitives are ignored so an inline object cannot loop. */
  resetKey?: string | number | boolean | null;
  disabled?: boolean;
};

/**
 * In-memory chart↔table toggle for a single chart widget.
 *
 * @param chartType - Original chart type
 * @param options - Data options, labels, reset key, and disabled flag
 * @returns `showToggle`, `isTableView`, `applyOverride`, `toggleButton`, and `withChartTableToggle`
 * @example
 * ```tsx
 * const { applyOverride, withChartTableToggle } = useChartTableToggle(props.chartType, {
 *   dataOptions: props.dataOptions,
 * });
 * return <ChartWidget {...applyOverride(props)} config={withChartTableToggle(props.config)} />;
 * ```
 * @group Widgets
 * @sisenseInternal
 */
export function useChartTableToggle(
  chartType: string | undefined,
  options: UseChartTableToggleOptions = {},
) {
  const labels = useMemo(
    () => ({
      ...DEFAULT_CHART_TABLE_TOGGLE_LABELS,
      ...options.labels,
    }),
    [options.labels],
  );
  const unavailableForAdvancedAnalytics = hasTrendOrForecast(options.dataOptions);
  const disabled = Boolean(options.disabled) || unavailableForAdvancedAnalytics;
  const showToggle = shouldShowChartTableToggle(chartType, options.dataOptions);
  const resetKey = toResetIdentity(options.resetKey);
  const [resetSnapshot, setResetSnapshot] = useState({
    chartType,
    resetKey,
  });
  const [isTableView, setIsTableView] = useState(false);

  const resetChanged =
    !Object.is(resetSnapshot.chartType, chartType) || !Object.is(resetSnapshot.resetKey, resetKey);
  const effectiveTableView = resetChanged || unavailableForAdvancedAnalytics ? false : isTableView;

  if (resetChanged) {
    setResetSnapshot({ chartType, resetKey });
    setIsTableView(false);
  }

  const applyOverride = useCallback(
    <T extends { chartType?: string; dataOptions?: unknown }>(props: T): T =>
      showToggle ? applyChartTableOverride(props, effectiveTableView) : props,
    [showToggle, effectiveTableView],
  );

  // Shared by the bare button and the header item, so both stay in step.
  const buttonProps = useMemo(
    () => ({
      pressed: effectiveTableView,
      onPressedChange: setIsTableView,
      disabled,
      disabledTitle: unavailableForAdvancedAnalytics
        ? labels.unavailableWithTrendForecast
        : undefined,
      labels,
    }),
    [effectiveTableView, disabled, unavailableForAdvancedAnalytics, labels],
  );

  const toggleButton = useMemo(
    () => (showToggle ? <ChartTableToggleButton {...buttonProps} /> : null),
    [showToggle, buttonProps],
  );

  const toggleItem = useMemo(
    () => (showToggle ? createChartTableToggleItem(buttonProps) : undefined),
    [showToggle, buttonProps],
  );

  /** Adds the toggle to a chart widget's header items, leaving the rest of the config alone. */
  const withChartTableToggle = useCallback(
    (config?: ChartWidgetConfig): ChartWidgetConfig | undefined => {
      if (!toggleItem) {
        return config;
      }
      return {
        ...config,
        header: withHeaderItemsInConfig([toggleItem])(config?.header ?? {}),
      };
    },
    [toggleItem],
  );

  return {
    showToggle,
    isTableView: effectiveTableView,
    setIsTableView,
    applyOverride,
    toggleButton,
    withChartTableToggle,
  };
}
