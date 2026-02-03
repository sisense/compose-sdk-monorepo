/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { formatDateValue } from '@/domains/query-execution/core/date-formats/index.js';
import { ChartRendererProps } from '@/domains/visualizations/components/chart/types';
import { applyEventHandlersToChart } from '@/domains/visualizations/core/chart-options-processor/apply-event-handlers.js';
import {
  HighchartsOptions,
  HighchartsOptionsInternal,
  highchartsOptionsService,
} from '@/domains/visualizations/core/chart-options-processor/chart-options-service.js';
import { applyCommonHighchartsOptions } from '@/domains/visualizations/core/chart-options-processor/common-highcharts-option-service.js';
import { applyThemeToChart } from '@/domains/visualizations/core/chart-options-processor/theme-option-service.js';
import {
  BOXPLOT_CHART_TYPES,
  CARTESIAN_CHART_TYPES,
  CATEGORICAL_CHART_TYPES,
  RANGE_CHART_TYPES,
  SCATTER_CHART_TYPES,
} from '@/domains/visualizations/core/chart-options-processor/translations/types.js';
import { HighchartsRenderer } from '@/domains/visualizations/core/highcharts-renderer';
import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import AlertBox from '@/shared/components/alert-box/alert-box.js';
import { ChartType } from '@/types';

import { SisenseChartProps, SisenseChartType } from './types.js';

const defaultOnBeforeRender = (options: HighchartsOptions) => options;

/**
 * @internal
 */
export const SisenseChart = ({
  chartType,
  chartData,
  dataOptions,
  designOptions,
  onDataPointClick,
  onDataPointContextMenu,
  onDataPointsSelected,
  onBeforeRender = defaultOnBeforeRender,
  size,
}: SisenseChartProps) => {
  const { app } = useSisenseContext();
  const { t: translate } = useTranslation();

  const alerts: string[] = [];

  const dateFormatter = useCallback(
    (date: Date, format: string) =>
      formatDateValue(date, format, app?.settings.locale, app?.settings.dateConfig),
    [app?.settings.locale, app?.settings.dateConfig],
  );

  const { themeSettings } = useThemeContext();

  const options = useMemo((): HighchartsOptionsInternal | null => {
    const { options: highchartsOptions, alerts: highchartsOptionsAlerts } =
      highchartsOptionsService(
        chartData,
        chartType,
        designOptions,
        dataOptions,
        translate,
        themeSettings,
        dateFormatter,
      );

    alerts.push(...highchartsOptionsAlerts);

    const accessibilityEnabled = app?.settings.accessibilityConfig?.enabled || false;
    const highchartsOptionsWithCommonOptions = applyCommonHighchartsOptions(
      highchartsOptions,
      themeSettings,
      accessibilityEnabled,
    );

    const highchartsOptionsWithEventHandlers = applyEventHandlersToChart(
      highchartsOptionsWithCommonOptions,
      dataOptions,
      {
        onDataPointClick,
        onDataPointContextMenu,
        onDataPointsSelected,
      },
    );

    const highchartsThemedOptions = applyThemeToChart(
      highchartsOptionsWithEventHandlers,
      themeSettings,
    );

    return onBeforeRender(
      highchartsThemedOptions as HighchartsOptions,
    ) as HighchartsOptionsInternal;
  }, [
    chartType,
    chartData,
    dataOptions,
    designOptions,
    themeSettings,
    onDataPointClick,
    onDataPointContextMenu,
    onBeforeRender,
    translate,
  ]);

  const optionsWithSize = useMemo(() => {
    if (!options) return null;

    return {
      ...options,
      chart: {
        ...options.chart,
        ...(size?.width && { width: size.width }),
        ...(size?.height && { height: size.height }),
      },
    };
  }, [options, size]);

  return (
    optionsWithSize && (
      <div
        aria-label="chart-root"
        style={{
          display: 'flex',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
        }}
      >
        {!!alerts.length && <AlertBox alerts={alerts} />}
        <HighchartsRenderer options={optionsWithSize} />
      </div>
    )
  );
};

const ALL_CHARTS_RENDERED_BY_SISENSE_CHART: ChartType[] = [
  ...CARTESIAN_CHART_TYPES,
  ...CATEGORICAL_CHART_TYPES,
  ...SCATTER_CHART_TYPES,
  ...BOXPLOT_CHART_TYPES,
  ...RANGE_CHART_TYPES,
];

export const isSisenseChartType = (chartType: ChartType): chartType is SisenseChartType => {
  return ALL_CHARTS_RENDERED_BY_SISENSE_CHART.includes(chartType);
};

export const isSisenseChartProps = (props: ChartRendererProps): props is SisenseChartProps => {
  return !!props.chartType && isSisenseChartType(props.chartType) && !!props.chartData;
};
