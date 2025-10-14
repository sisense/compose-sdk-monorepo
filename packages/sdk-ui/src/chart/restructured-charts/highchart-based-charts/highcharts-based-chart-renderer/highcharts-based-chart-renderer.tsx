import { useMemo } from 'react';

import AlertBox from '@/alert-box/alert-box';
import { HighchartsOptionsInternal } from '@/chart-options-processor/chart-options-service';
import { ChartRendererProps } from '@/chart/types';
import { ContainerSize } from '@/dynamic-size-container/dynamic-size-container.js';
import { HighchartsReactMemoized } from '@/highcharts-memorized';
import { BeforeRenderHandler } from '@/props';
import {
  SisenseChartDataPointEventHandler,
  SisenseChartDataPointsEventHandler,
} from '@/sisense-chart/types';

import { TypedChartData, TypedDataOptionsInternal, TypedDesignOptions } from '../../types.js';
import { BuildContext, HighchartBasedChartTypes, HighchartsOptionsBuilder } from '../types.js';
import { buildHighchartsOptions } from './build-highchart-options.js';
import { useExtraConfig } from './use-extra-config.js';
import { isHighchartsBasedChart } from './utils';

export type HighchartsBasedChartRendererProps<CT extends HighchartBasedChartTypes> = {
  chartData: TypedChartData<CT>;
  dataOptions: TypedDataOptionsInternal<CT>;
  designOptions: TypedDesignOptions<CT>;
  size: ContainerSize;
  onDataPointClick?: SisenseChartDataPointEventHandler;
  onDataPointContextMenu?: SisenseChartDataPointEventHandler;
  onDataPointsSelected?: SisenseChartDataPointsEventHandler;
  onBeforeRender?: BeforeRenderHandler;
};

/**
 * Creates a specific highcharts based chart renderer component
 * with memoized highcharts options builder and alerts builder.
 *
 * @param highchartsOptionsBuilder - The highcharts options builder.
 * @param getAlerts - The function to get the alerts.
 * @returns The highcharts based chart renderer component.
 */
export function createHighchartsBasedChartRenderer<CT extends HighchartBasedChartTypes>({
  highchartsOptionsBuilder,
  getAlerts,
}: {
  /**
   * The builder of highcharts options for specific chart type.
   */
  highchartsOptionsBuilder: HighchartsOptionsBuilder<CT>;
  /**
   * The function to get the alerts for specific chart type.
   */
  getAlerts: (ctx: BuildContext<CT>) => string[];
}): React.FC<HighchartsBasedChartRendererProps<CT>> {
  return function HighchartsBasedChartRenderer({
    chartData,
    dataOptions,
    designOptions,
    onDataPointClick,
    onDataPointContextMenu,
    onDataPointsSelected,
    onBeforeRender,
    size,
  }: HighchartsBasedChartRendererProps<CT>) {
    const extraConfig = useExtraConfig();

    const highchartsOptions: HighchartsOptionsInternal = useMemo(
      () =>
        buildHighchartsOptions({
          highchartsOptionsBuilder,
          chartData,
          dataOptions,
          designOptions,
          dataPointsEventHandlers: {
            onDataPointClick,
            onDataPointContextMenu,
            onDataPointsSelected,
          },
          extraConfig,
          onBeforeRender,
        }),
      [
        chartData,
        dataOptions,
        designOptions,
        onDataPointClick,
        onDataPointContextMenu,
        onDataPointsSelected,
        extraConfig,
        onBeforeRender,
      ],
    );

    const highchartsOptionsWithSize = useMemo(() => {
      if (!highchartsOptions) return null;

      return {
        ...highchartsOptions,
        chart: {
          ...highchartsOptions.chart,
          ...(size?.width && { width: size.width }),
          ...(size?.height && { height: size.height }),
        },
      };
    }, [highchartsOptions, size]);

    const alerts: string[] = getAlerts({
      chartData,
      dataOptions,
      designOptions,
      extraConfig,
    });

    return (
      highchartsOptionsWithSize && (
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
          <HighchartsReactMemoized options={highchartsOptionsWithSize} />
        </div>
      )
    );
  };
}

/**
 * Type guard to check if a value is a valid props object for the HighchartsBasedChartRenderer component
 * @param value - The value to check
 * @returns True if the value is a valid HighchartsBasedChartRendererProps, false otherwise
 */
export function isHighchartsBasedChartRendererProps<CT extends HighchartBasedChartTypes>(
  props: ChartRendererProps,
): props is HighchartsBasedChartRendererProps<CT> {
  return !!props.chartData && !!props.chartType && isHighchartsBasedChart(props.chartType);
}
