/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable max-lines-per-function */
import { useCallback, useMemo } from 'react';
import Highcharts from '@sisense/sisense-charts';
import HighchartsReact from 'highcharts-react-official';
import { ChartDataOptionsInternal } from './chart-data-options/types';
import { ChartData } from './chart-data/types';
import {
  applyEventHandlersToChart,
  DataPointEventHandler,
  DataPointsEventHandler,
  ScatterDataPointEventHandler,
  ScatterDataPointsEventHandler,
  HighchartsEventOptions,
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

// TODO: move this import once we decide where to do all our highcharts customizations
import './highcharts-overrides';

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
  onBeforeRender = (options) => options,
}: Props) => {
  const { app } = useSisenseContext();

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
    return onBeforeRender(
      highchartsThemedOptions as HighchartsOptions,
    ) as HighchartsOptionsInternal;
  }, [
    chartData,
    chartDataOptions,
    designOptions,
    themeSettings,
    onDataPointClick,
    onDataPointContextMenu,
    onBeforeRender,
  ]);

  const onChartCreated = useCallback(
    (chart: Highcharts.Chart) => {
      const chartOptions = options as HighchartsOptions & HighchartsEventOptions;
      // if there are no on click handlers, allow parent to capture events
      if (
        !chartOptions?.plotOptions?.series?.point?.events?.click &&
        !chartOptions?.plotOptions?.series?.point?.events?.contextmenu
      ) {
        chart.container.onclick = null;
      }
    },
    [options],
  );

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
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
          containerProps={{
            style: {
              // Container should inherit parent size for correct chart size calculation by Highcharts
              height: '100%',
              width: '100%',
            },
          }}
          callback={onChartCreated}
        ></HighchartsReact>
      </div>
    )
  );
};
