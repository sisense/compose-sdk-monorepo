/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChartDataOptionsInternal } from '../chart-data-options/types';
import { ChartData } from '../chart-data/types';
import { applyEventHandlersToChart } from '../chart-options-processor/apply-event-handlers';
import { BeforeRenderHandler } from '../props';
import {
  HighchartsOptionsInternal,
  highchartsOptionsService,
  HighchartsOptions,
} from '../chart-options-processor/chart-options-service';
import { applyThemeToChart } from '../chart-options-processor/theme-option-service';
import { applyCommonHighchartsOptions } from '../chart-options-processor/common-highcharts-option-service';
import {
  BoxplotChartType,
  BOXPLOT_CHART_TYPES,
  CartesianChartType,
  CARTESIAN_CHART_TYPES,
  CategoricalChartType,
  CATEGORICAL_CHART_TYPES,
  ChartDesignOptions,
  ScatterChartType,
  SCATTER_CHART_TYPES,
  RANGE_CHART_TYPES,
} from '../chart-options-processor/translations/types';
import { ChartType } from '../types';
import { useSisenseContext } from '../sisense-context/sisense-context';
import { applyDateFormat } from '../query/date-formats';
import AlertBox from '../alert-box/alert-box';
import { HighchartsReactMemoized } from '../highcharts-memorized';
import { SisenseChartDataPointEventHandler, SisenseChartDataPointsEventHandler } from './types';
import { ChartRendererProps } from '@/chart/types';
import { useThemeContext } from '..';

export interface SisenseChartProps {
  chartType: SisenseChartType;
  chartData: ChartData;
  dataOptions: ChartDataOptionsInternal;
  designOptions: ChartDesignOptions;
  onDataPointClick?: SisenseChartDataPointEventHandler;
  onDataPointContextMenu?: SisenseChartDataPointEventHandler;
  onDataPointsSelected?: SisenseChartDataPointsEventHandler;
  onBeforeRender?: BeforeRenderHandler;
}

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
}: SisenseChartProps) => {
  const { app } = useSisenseContext();
  const { t: translate } = useTranslation();

  const alerts: string[] = [];

  const dateFormatter = useCallback(
    (date: Date, format: string) =>
      applyDateFormat(date, format, app?.settings.locale, app?.settings.dateConfig),
    [],
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

  return (
    options && (
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
        <HighchartsReactMemoized options={options} />
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

export type SisenseChartType =
  | CartesianChartType
  | CategoricalChartType
  | ScatterChartType
  | BoxplotChartType;

export const isSisenseChartProps = (props: ChartRendererProps): props is SisenseChartProps => {
  return !!props.chartType && isSisenseChartType(props.chartType) && !!props.chartData;
};
