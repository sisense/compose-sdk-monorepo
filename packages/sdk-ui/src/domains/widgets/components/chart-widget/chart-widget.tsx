/* eslint-disable @typescript-eslint/naming-convention */
import { type FunctionComponent, useCallback, useMemo, useState } from 'react';

import { getDataSourceName } from '@sisense/sdk-data';
import omit from 'lodash-es/omit';

import { Chart } from '@/domains/visualizations/components/chart';
import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';
import { asSisenseComponent } from '@/infra/decorators/component-decorators/as-sisense-component';
import { ChartWidgetProps, HighchartsOptions } from '@/props';
import {
  DynamicSizeContainer,
  getWidgetDefaultSize,
} from '@/shared/components/dynamic-size-container';
import { combineHandlers } from '@/shared/utils/combine-handlers';
import { ChartWidgetStyleOptions, DrilldownSelection } from '@/types';

import { useHighlightSelection } from '../../hooks/use-highlight-selection';
import { WidgetContainer } from '../../shared/widget-container';
import { useWithChartWidgetDrilldown } from './use-with-chart-widget-drilldown';

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
  const defaultSize = useMemo(
    () =>
      getWidgetDefaultSize(chartType, {
        hasHeader: !styleOptions?.header?.hidden,
      }),
    [chartType, styleOptions?.header?.hidden],
  );
  const size = useMemo(
    () => ({
      width,
      height,
    }),
    [width, height],
  );

  const [refreshCounter, setRefreshCounter] = useState(0);

  const styleOptionsWithoutSizing = useMemo(
    () => omit(styleOptions, ['width', 'height']) as ChartWidgetStyleOptions,
    [styleOptions],
  );
  const onDrilldownSelectionsChange = useCallback(
    (selections: DrilldownSelection[]) => {
      onChange?.({
        drilldownOptions: {
          ...props.drilldownOptions,
          drilldownSelections: selections,
        },
      });
    },
    [onChange, props.drilldownOptions],
  );

  const { propsWithDrilldown, isDrilldownEnabled, breadcrumbs } = useWithChartWidgetDrilldown({
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
    <DynamicSizeContainer defaultSize={defaultSize} size={size}>
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
