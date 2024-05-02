/* eslint-disable @typescript-eslint/naming-convention */
import { useCallback, useMemo, useState, type FunctionComponent } from 'react';

import { Chart } from '../chart';
import {
  DataPoint,
  CartesianChartDataOptions,
  ScatterDataPoint,
  ChartDataPoints,
  ChartDataPoint,
} from '../types';
import { ChartProps, ChartWidgetProps } from '../props';
import { asSisenseComponent } from '../decorators/component-decorators/as-sisense-component';
import { DynamicSizeContainer, getWidgetDefaultSize } from '../dynamic-size-container';
import {
  HighchartsOptions,
  HighchartsOptionsInternal,
} from '../chart-options-processor/chart-options-service';
import { isCartesian } from '../chart-options-processor/translations/types';
import { ChartWidgetDeprecated } from './chart-widget-deprecated';
import { getDataSourceName } from '@sisense/sdk-data';
import { WidgetContainer } from './common/widget-container';
import { useSisenseContext } from '@/sisense-context/sisense-context';

/**
 * The Chart Widget component extending the {@link Chart} component to support widget style options.
 * It can be used along with the {@link DrilldownWidget} component to support advanced data drilldown.
 *
 * @example
 * Example of using the `ChartWidget` component to
 * plot a bar chart of the `Sample ECommerce` data source hosted in a Sisense instance.
 * ```tsx
 * <ChartWidget
 *   dataSource={DM.DataSource}
 *   chartType="bar"
 *   dataOptions={{
 *     category: [DM.Category.Category],
 *     value: [measureFactory.sum(DM.Commerce.Revenue)],
 *     breakBy: [],
 *   }}
 * />
 * ```
 *
 * <img src="media://chart-widget-with-drilldown-example-1.png" width="800px" />
 * @param props - ChartWidget properties
 * @returns ChartWidget component representing a chart type as specified in `ChartWidgetProps.`{@link ChartWidgetProps.chartType | chartType}
 * @group Chart Utilities
 */
export const ChartWidget: FunctionComponent<ChartWidgetProps> = asSisenseComponent({
  componentName: 'ChartWidget',
})((props) => {
  const { chartType, drilldownOptions, highlightSelectionDisabled = false } = props;

  // TODO: remove this once drilldownOptions are removed from ChartWidgetProps
  if (drilldownOptions) {
    return <ChartWidgetDeprecated {...props} />;
  }

  const [refreshCounter, setRefreshCounter] = useState(0);
  const [selectedDataPoints, setSelectedDataPoints] = useState<ChartDataPoints>([]);

  const { app } = useSisenseContext();

  const isCartesianChart = useMemo(() => isCartesian(chartType), [chartType]);
  const isScatterChart = useMemo(() => chartType === 'scatter', [chartType]);
  const isDrilldownEnabled = useMemo(() => !!drilldownOptions, [drilldownOptions]);

  const isSelectionAllowed = useMemo(
    () =>
      !highlightSelectionDisabled &&
      !isDrilldownEnabled &&
      ((isCartesianChart &&
        (props.dataOptions as CartesianChartDataOptions).category?.length === 1) ||
        isScatterChart),
    [
      isDrilldownEnabled,
      props.dataOptions,
      isCartesianChart,
      isScatterChart,
      highlightSelectionDisabled,
    ],
  );

  const {
    dataSource = app?.defaultDataSource,
    styleOptions,
    dataOptions,
    onDataPointsSelected: originalOnDataPointsSelected,
    onDataPointClick: originalOnDataPointClick,
    onBeforeRender: originalOnBeforeRender,
    ...restProps
  } = props;

  const applyPointSelections = useMemo(() => {
    if (selectedDataPoints.length === 0) {
      return (options: HighchartsOptionsInternal) =>
        ({
          ...options,
          series: options.series.map((s) => ({
            ...s,
            data: s.data.map((d) => ({ ...d, selected: false })),
          })),
        } as HighchartsOptions);
    }
    if (isScatterChart) {
      return (options: HighchartsOptionsInternal) =>
        ({
          ...options,
          series: options.series.map((s) => ({
            ...s,
            data: s.data.map((d) => {
              return {
                ...d,
                selected: !(selectedDataPoints as ScatterDataPoint[]).some(
                  (point) =>
                    point.x === d.x &&
                    point.y === d.y &&
                    point.size === d.z &&
                    point.breakByPoint === d.custom?.maskedBreakByPoint &&
                    point.breakByColor === d.custom?.maskedBreakByColor,
                ),
              };
            }),
          })),
        } as HighchartsOptions);
    } else {
      const categoryValueMap = (selectedDataPoints as DataPoint[]).reduce(
        (accu, { categoryValue }) => {
          if (categoryValue) {
            accu[`${categoryValue}`] = true;
          }
          return accu;
        },
        {},
      );

      return (options: HighchartsOptionsInternal) => ({
        ...options,
        series: options.series.map((s) => ({
          ...s,
          data: s.data.map((d) =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            categoryValueMap[d.custom?.xValue?.[0]] ? d : { ...d, selected: true },
          ),
        })),
      });
    }
  }, [selectedDataPoints, isScatterChart]);

  const setOnClickOutside = useMemo(
    () => (options: HighchartsOptions) =>
      ({
        ...options,
        chart: {
          ...options.chart,
          events: {
            ...options.chart?.events,
            click: () => {
              setSelectedDataPoints([]);
            },
          },
        },
      } as HighchartsOptions),
    [],
  );

  const onBeforeRender = useCallback(
    (options: HighchartsOptions) => {
      if (isSelectionAllowed) {
        options = applyPointSelections(options as HighchartsOptionsInternal) as HighchartsOptions;
        options = setOnClickOutside(options);
      }
      options = originalOnBeforeRender?.(options) ?? options;
      return options;
    },
    [originalOnBeforeRender, applyPointSelections, setOnClickOutside, isSelectionAllowed],
  );

  const onDataPointsSelected = useCallback(
    (dataPoints: ChartDataPoints, event: MouseEvent): void => {
      if (isSelectionAllowed) {
        setSelectedDataPoints(dataPoints);
      }
      originalOnDataPointsSelected?.(dataPoints, event);
    },
    [isSelectionAllowed, originalOnDataPointsSelected],
  );

  type OriginalEvent = Parameters<NonNullable<ChartProps['onDataPointClick']>>[1];
  const onDataPointClick = useCallback(
    (dataPoint: ChartDataPoint, event: OriginalEvent) => {
      if (isSelectionAllowed) {
        setSelectedDataPoints([dataPoint] as ChartDataPoints);
      }
      if (originalOnDataPointClick) {
        (originalOnDataPointClick as (dataPoint: ChartDataPoint, event: OriginalEvent) => void)(
          dataPoint,
          event,
        );
      }
    },
    [isSelectionAllowed, originalOnDataPointClick],
  );

  const defaultSize = getWidgetDefaultSize(chartType, {
    hasHeader: !styleOptions?.header?.hidden,
  });
  const { width, height, ...styleOptionsWithoutSizing } = styleOptions || {};

  const chartProps = {
    ...restProps,
    chartType,
    dataOptions,
    dataSet: dataSource,
    styleOptions: styleOptionsWithoutSizing,
    onBeforeRender,
    onDataPointClick,
    onDataPointsSelected,
  };

  if (!chartType || !dataOptions) {
    return null;
  }

  return (
    <DynamicSizeContainer
      defaultSize={defaultSize}
      size={{
        width,
        height,
      }}
    >
      <WidgetContainer
        {...props}
        dataSetName={dataSource && getDataSourceName(dataSource)}
        onRefresh={() => setRefreshCounter(refreshCounter + 1)}
      >
        <Chart {...chartProps} refreshCounter={refreshCounter} />
      </WidgetContainer>
    </DynamicSizeContainer>
  );
});
