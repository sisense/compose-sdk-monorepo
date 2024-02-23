/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable max-lines-per-function */
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
import { ChartDesignOptions } from '../chart-options-processor/translations/types';
import { ChartType, CompleteThemeSettings } from '../types';
import { useSisenseContext } from '../sisense-context/sisense-context';
import { applyDateFormat } from '../query/date-formats';
import AlertBox from '../alert-box/alert-box';
import { HighchartsReactMemoized } from '../highcharts-memorized';
import { SisenseChartDataPointEventHandler, SisenseChartDataPointsEventHandler } from './types';

interface Props {
  chartType: ChartType;
  chartData: ChartData;
  chartDataOptions: ChartDataOptionsInternal;
  chartDesignOptions: ChartDesignOptions;
  themeSettings?: CompleteThemeSettings;
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
  chartDataOptions,
  chartDesignOptions,
  themeSettings,
  onDataPointClick,
  onDataPointContextMenu,
  onDataPointsSelected,
  onBeforeRender = defaultOnBeforeRender,
}: Props) => {
  const { app } = useSisenseContext();
  const { t: translate } = useTranslation();

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
        chartDesignOptions,
        chartDataOptions,
        translate,
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
    chartType,
    chartData,
    chartDataOptions,
    chartDesignOptions,
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
