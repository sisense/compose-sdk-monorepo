/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable max-lines-per-function */
import { useCallback, useMemo, useRef } from 'react';
import { ChartDataOptionsInternal } from './chart-data-options/types';
import { ChartData } from './chart-data/types';
import {
  applyEventHandlersToChart,
  DataPointEventHandler,
  DataPointsEventHandler,
  ScatterDataPointEventHandler,
  ScatterDataPointsEventHandler,
} from './chart-options-processor/apply-event-handlers';
import { BeforeRenderHandler } from './props';
import {
  HighchartsOptionsInternal,
  highchartsOptionsService,
  HighchartsOptions,
} from './chart-options-processor/chart-options-service';
import { applyThemeToChart } from './chart-options-processor/theme-option-service';
import { applyCommonHighchartsOptions } from './chart-options-processor/common-highcharts-option-service';
import { ChartDesignOptions } from './chart-options-processor/translations/types';
import { ChartType, CompleteThemeSettings } from './types';
import { useSisenseContext } from './sisense-context/sisense-context';
import { applyDateFormat } from './query/date-formats';
import AlertBox from './alert-box/alert-box';
import isEqual from 'lodash/isEqual';
import { HighchartsReactMemoized } from './highcharts-memorized';

interface Props {
  chartType: ChartType;
  chartData: ChartData;
  chartDataOptions: ChartDataOptionsInternal;
  designOptions: ChartDesignOptions;
  themeSettings?: CompleteThemeSettings;
  onDataPointClick?: DataPointEventHandler | ScatterDataPointEventHandler;
  onDataPointContextMenu?: DataPointEventHandler | ScatterDataPointEventHandler;
  onDataPointsSelected?: DataPointsEventHandler | ScatterDataPointsEventHandler;
  onBeforeRender?: BeforeRenderHandler;
}

const defaultOnBeforeRender = (options: HighchartsOptions) => options;

/**
 * @internal
 */
export const SisenseChart = ({
  chartType,
  chartData,
  chartDataOptions,
  designOptions,
  themeSettings,
  onDataPointClick,
  onDataPointContextMenu,
  onDataPointsSelected,
  onBeforeRender = defaultOnBeforeRender,
}: Props) => {
  const { app } = useSisenseContext();
  const prevOptions = useRef<HighchartsOptionsInternal | null>(null);

  const alerts: string[] = [];

  const dateFormatter = useCallback(
    (date: Date, format: string) =>
      applyDateFormat(date, format, app?.settings.locale, app?.settings.dateConfig),
    [],
  );

  const options = useMemo((): HighchartsOptionsInternal | null => {
    const { options: highchartsOptions, alerts: highchartsOptionsAlerts } =
      highchartsOptionsService(
        chartData,
        chartType,
        designOptions,
        chartDataOptions,
        themeSettings,
        dateFormatter,
      );
    alerts.push(...highchartsOptionsAlerts);

    const highchartsOptionsWithCommonOptions = applyCommonHighchartsOptions(highchartsOptions);

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

    const newOptions = onBeforeRender(
      highchartsThemedOptions as HighchartsOptions,
    ) as HighchartsOptionsInternal;

    // return previous options if no changes to reduce re-rendering
    if (prevOptions.current && isEqual(prevOptions.current, newOptions)) {
      return prevOptions.current;
    } else {
      return newOptions;
    }
  }, [
    chartData,
    chartDataOptions,
    designOptions,
    themeSettings,
    onDataPointClick,
    onDataPointContextMenu,
    onBeforeRender,
  ]);

  // changing axis type requires a chart re-initialization
  const immutable =
    prevOptions.current?.xAxis &&
    options?.xAxis &&
    prevOptions.current?.xAxis[0]?.type !== options?.xAxis[0]?.type;

  // update previous options for comparisons
  prevOptions.current = options;

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
        <HighchartsReactMemoized options={options} immutable={immutable} />
      </div>
    )
  );
};
