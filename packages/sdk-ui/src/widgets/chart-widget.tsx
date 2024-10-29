/* eslint-disable @typescript-eslint/naming-convention */
import { useCallback, useMemo, useState, type FunctionComponent } from 'react';
import omit from 'lodash-es/omit';
import { Chart } from '../chart';
import { ChartWidgetProps, HighchartsOptions } from '../props';
import { asSisenseComponent } from '../decorators/component-decorators/as-sisense-component';
import { DynamicSizeContainer, getWidgetDefaultSize } from '../dynamic-size-container';
import { getDataSourceName } from '@sisense/sdk-data';
import { WidgetContainer } from './common/widget-container';
import { useSisenseContext } from '@/sisense-context/sisense-context';
import { useHighlightSelection } from './hooks/use-highlight-selection';
import { combineHandlers } from '../utils/combine-handlers';
import { ChartWidgetStyleOptions, DrilldownSelection } from '..';
import { useWithDrilldown } from './hooks/use-with-drilldown';
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
 * @group Dashboards
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
    highlightSelectionDisabled = false,
    highlights,
    description,
    onChange,
  } = props;
  const { width, height } = styleOptions || {};
  const defaultSize = getWidgetDefaultSize(chartType, {
    hasHeader: !styleOptions?.header?.hidden,
  });

  const [refreshCounter, setRefreshCounter] = useState(0);

  const styleOptionsWithoutSizing = useMemo(
    () => omit(styleOptions, ['width', 'height']) as ChartWidgetStyleOptions,
    [styleOptions],
  );
  const onDrilldownSelectionsChange = useCallback(
    (selections: DrilldownSelection[]) => {
      onChange?.({
        drilldownOptions: {
          drilldownSelections: selections,
        },
      });
    },
    [onChange],
  );

  const { propsWithDrilldown, isDrilldownEnabled, breadcrumbs } = useWithDrilldown({
    propsToExtend: props,
    onDrilldownSelectionsChange,
  });

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

  if (!chartType || !dataOptions) {
    return null;
  }

  const chartProps = {
    ...propsWithDrilldown,
    dataSet: dataSource,
    styleOptions: styleOptionsWithoutSizing,
    refreshCounter: refreshCounter,
    onDataPointClick: useMemo(
      () => combineHandlers([highlightSelection.onDataPointClick, props.onDataPointClick]),
      [highlightSelection.onDataPointClick, props.onDataPointClick],
    ),
    onDataPointContextMenu: propsWithDrilldown.onDataPointContextMenu,
    onDataPointsSelected: useMemo(
      () =>
        combineHandlers([
          highlightSelection.onDataPointsSelected,
          propsWithDrilldown.onDataPointsSelected,
        ]),
      [highlightSelection.onDataPointsSelected, propsWithDrilldown.onDataPointsSelected],
    ),
    onBeforeRender: useMemo(
      () =>
        combineHandlers(
          [
            applyWidgetDescriptionAsAccessibilityDescription,
            highlightSelection.onBeforeRender,
            props.onBeforeRender,
          ],
          true,
        ),
      [
        applyWidgetDescriptionAsAccessibilityDescription,
        highlightSelection.onBeforeRender,
        props.onBeforeRender,
      ],
    ),
  };

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
        topSlot={
          <>
            {props.topSlot}
            {breadcrumbs}
          </>
        }
        dataSetName={dataSource && getDataSourceName(dataSource)}
        onRefresh={() => setRefreshCounter(refreshCounter + 1)}
      >
        <Chart {...chartProps} />
      </WidgetContainer>
    </DynamicSizeContainer>
  );
});
