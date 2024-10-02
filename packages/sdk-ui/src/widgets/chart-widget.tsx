/* eslint-disable @typescript-eslint/naming-convention */
import { ReactNode, useCallback, useMemo, useState, type FunctionComponent } from 'react';
import { Chart } from '../chart';
import { ChartProps, ChartWidgetProps, DrilldownWidgetProps, HighchartsOptions } from '../props';
import { asSisenseComponent } from '../decorators/component-decorators/as-sisense-component';
import { DynamicSizeContainer, getWidgetDefaultSize } from '../dynamic-size-container';
import { getDataSourceName } from '@sisense/sdk-data';
import { WidgetContainer } from './common/widget-container';
import { useSisenseContext } from '@/sisense-context/sisense-context';
import { DrilldownWidget } from './drilldown-widget';
import { useHighlightSelection } from './hooks/use-highlight-selection';
import { combineHandlers } from '../utils/combine-handlers';
import {
  createDrilldownToChartConnector,
  getDrilldownInitialDimension,
  isDrilldownApplicableToChart,
} from './common/drilldown-connector';
import { useSyncedDrilldownPaths } from './hooks/use-synced-hierarchies';
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
 * @group Dashboarding
 */
export const ChartWidget: FunctionComponent<ChartWidgetProps> = asSisenseComponent({
  componentName: 'ChartWidget',
})((props) => {
  const { app } = useSisenseContext();
  const {
    chartType,
    dataSource = app?.defaultDataSource,
    dataOptions,
    styleOptions,
    drilldownOptions,
    highlightSelectionDisabled = false,
    highlights,
    description,
    onChange,
  } = props;
  const { width, height, ...styleOptionsWithoutSizing } = styleOptions || {};
  const defaultSize = getWidgetDefaultSize(chartType, {
    hasHeader: !styleOptions?.header?.hidden,
  });
  const [refreshCounter, setRefreshCounter] = useState(0);
  const isDrilldownApplicable = useMemo(
    () => isDrilldownApplicableToChart(chartType, dataOptions),
    [chartType, dataOptions],
  );
  const drilldownPaths = useSyncedDrilldownPaths({
    attribute: getDrilldownInitialDimension(chartType, dataOptions),
    dataSource: dataSource,
    drilldownPaths: drilldownOptions?.drilldownPaths,
    enabled: isDrilldownApplicable,
  });

  const isDrilldownEnabled = useMemo(() => {
    const hasDrilldownConfig =
      drilldownOptions?.drilldownSelections?.length ||
      drilldownOptions?.drilldownDimensions?.length ||
      drilldownPaths?.length;

    return hasDrilldownConfig && isDrilldownApplicable;
  }, [drilldownOptions, isDrilldownApplicable, drilldownPaths]);

  const highlightSelection = useHighlightSelection({
    chartType,
    dataOptions,
    enabled: !highlightSelectionDisabled && !isDrilldownEnabled && !highlights?.length,
  });

  const isAccessibilityEnabled = app?.settings.accessibilityConfig?.enabled;
  const applyWidgetDescriptionAsAccessibilityDescription: (
    options: HighchartsOptions,
  ) => HighchartsOptions = useCallback(
    (options) => {
      if (!isAccessibilityEnabled) {
        return options;
      }
      return {
        ...options,
        accessibility: {
          ...options.accessibility,
          description: description ?? options.accessibility?.description,
        },
      };
    },
    [description, isAccessibilityEnabled],
  );

  const onDrilldownWidgetChange = useCallback(
    ({ drilldownSelections }: Partial<DrilldownWidgetProps>) => {
      if (drilldownSelections) {
        onChange?.({
          drilldownOptions: {
            drilldownSelections,
          },
        });
      }
    },
    [onChange],
  );

  if (!chartType || !dataOptions) {
    return null;
  }

  const chartProps = {
    ...props,
    dataSet: dataSource,
    styleOptions: styleOptionsWithoutSizing,
    refreshCounter: refreshCounter,
    onDataPointClick: combineHandlers([
      highlightSelection.onDataPointClick,
      props.onDataPointClick,
    ]),
    onDataPointsSelected: combineHandlers([
      highlightSelection.onDataPointsSelected,
      props.onDataPointsSelected,
    ]),
    onBeforeRender: combineHandlers(
      [
        applyWidgetDescriptionAsAccessibilityDescription,
        highlightSelection.onBeforeRender,
        props.onBeforeRender,
      ],
      true,
    ),
  };

  const renderChart = (chartProps: ChartProps, topSlot?: ReactNode) => {
    return (
      <WidgetContainer
        {...props}
        topSlot={
          <>
            {props.topSlot}
            {topSlot}
          </>
        }
        dataSetName={dataSource && getDataSourceName(dataSource)}
        onRefresh={() => setRefreshCounter(refreshCounter + 1)}
      >
        <Chart {...chartProps} />
      </WidgetContainer>
    );
  };

  return (
    <DynamicSizeContainer
      defaultSize={defaultSize}
      size={{
        width,
        height,
      }}
    >
      {isDrilldownEnabled ? (
        <DrilldownWidget
          drilldownDimensions={drilldownOptions?.drilldownDimensions}
          drilldownPaths={drilldownPaths}
          initialDimension={getDrilldownInitialDimension(chartType, dataOptions)}
          drilldownSelections={drilldownOptions?.drilldownSelections || []}
          config={{
            isBreadcrumbsDetached: true,
          }}
          onChange={onDrilldownWidgetChange}
        >
          {(drilldownConnectProps) => {
            const { breadcrumbsComponent } = drilldownConnectProps;
            const withDrilldown = createDrilldownToChartConnector(drilldownConnectProps);

            return renderChart(withDrilldown(chartProps), breadcrumbsComponent);
          }}
        </DrilldownWidget>
      ) : (
        renderChart(chartProps)
      )}
    </DynamicSizeContainer>
  );
});
