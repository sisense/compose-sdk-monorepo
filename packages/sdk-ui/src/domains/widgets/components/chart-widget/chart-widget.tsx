import { type FunctionComponent, useCallback, useMemo, useState } from 'react';

import { getDataSourceName } from '@sisense/sdk-data';
import omit from 'lodash-es/omit';

import { Chart } from '@/domains/visualizations/components/chart';
import { isTable } from '@/domains/visualizations/core/chart-options-processor/translations/types';
import { useWidgetHeaderInfoButton } from '@/domains/widgets/shared/widget-header/features/use-widget-header-info-button';
import { useWidgetHeaderMenu } from '@/domains/widgets/shared/widget-header/features/use-widget-header-menu';
import { useWidgetHeaderTitle } from '@/domains/widgets/shared/widget-header/features/use-widget-header-title';
import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import { asSisenseComponent } from '@/infra/decorators/component-decorators/as-sisense-component';
import { HighchartsOptions } from '@/props';
import {
  DynamicSizeContainer,
  getWidgetDefaultSize,
} from '@/shared/components/dynamic-size-container';
import { useElementHeight } from '@/shared/hooks/use-element-height';
import { combineHandlers } from '@/shared/utils/combine-handlers';
import { ChartWidgetStyleOptions, DrilldownSelection, TableStyleOptions } from '@/types';

import { withHeaderItemsInConfig } from '../../helpers/header-items-utils';
import { useHighlightSelection } from '../../hooks/use-highlight-selection';
import { useTrackWidgetInit } from '../../hooks/use-track-widget-init';
import { getWidgetEntityId } from '../../hooks/widget-entity-id';
import { getChartWidgetName, getWidgetTitle } from '../../hooks/widget-tracking-adapters';
import { WidgetContainer } from '../../shared/widget-container';
import { getWidgetOverheadHeight } from '../../shared/widget-style-utils';
import { ChartWidgetProps } from './types';
import { useChartWidgetCsvDownload } from './use-chart-widget-csv-download.js';
import { useChartWidgetExcelDownload } from './use-chart-widget-excel-download.js';
import { useChartWidgetNarrative } from './use-chart-widget-narrative.js';
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
  useTrackWidgetInit({
    widgetType: 'chart',
    widgetName: getChartWidgetName(props),
    widgetTitle: getWidgetTitle(props),
    entityId: getWidgetEntityId(props, 'chart', getChartWidgetName(props)),
    enabled: !!(props.chartType && props.dataOptions),
  });
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
  const { themeSettings } = useThemeContext();
  const [tableHeight, setTableHeight] = useState<number | undefined>();
  const { ref: topSlotRef, height: topSlotHeight } = useElementHeight<HTMLDivElement>();

  // Auto height currently applies to table charts only; every other chart type keeps its
  // configured or inherited height, and never receives an `onHeightChange` handler.
  const isAutoHeight =
    !!chartType &&
    isTable(chartType) &&
    !!(styleOptions as TableStyleOptions | undefined)?.isAutoHeight;

  const overheadHeight = getWidgetOverheadHeight({
    styleOptions,
    themeSettings,
    hasHeader: !styleOptions?.header?.hidden,
  });

  const handleTableHeightChange = useCallback((nextHeight: number) => {
    setTableHeight(nextHeight);
  }, []);

  const size = useMemo(
    () => ({
      width,
      height:
        isAutoHeight && tableHeight !== undefined
          ? tableHeight + overheadHeight + topSlotHeight
          : height,
    }),
    [width, height, isAutoHeight, tableHeight, overheadHeight, topSlotHeight],
  );

  const [refreshCounter, setRefreshCounter] = useState(0);

  const styleOptionsWithoutSizing = useMemo(
    () => omit(styleOptions, ['width', 'height']) as ChartWidgetStyleOptions,
    [styleOptions],
  );
  const onDrilldownSelectionsChange = useCallback(
    (selections: DrilldownSelection[]) => {
      onChange?.({ type: 'drilldownSelections/changed', payload: selections });
    },
    [onChange],
  );

  const headerConfigWithTitle = useWidgetHeaderTitle(props.config?.header, {
    title: props.title,
    styleOptions: styleOptions?.header,
    onChange: props.onChange,
  });

  const { headerConfig: headerConfigWithCsvDownload } = useChartWidgetCsvDownload({
    baseHeaderConfig: headerConfigWithTitle,
    title: props.title,
    chartType,
    dataOptions,
    dataSource,
    filters: props.filters,
    highlights: props.highlights,
    config: props.config,
  });

  const { headerConfig: headerConfigWithExcelDownload } = useChartWidgetExcelDownload({
    baseHeaderConfig: headerConfigWithCsvDownload,
    title: props.title,
    chartType,
    dataOptions,
    dataSource,
    filters: props.filters,
    config: props.config,
    id: props.id,
  });

  const { propsWithDrilldown, isDrilldownEnabled, breadcrumbs } = useWithChartWidgetDrilldown({
    propsToExtend: props,
    onDrilldownSelectionsChange,
  });

  const {
    contentAreaRef,
    narrativeToggleItem,
    narrativeTopSlot,
    narrativeBottomSlot,
    narrativeAloneContent,
  } = useChartWidgetNarrative({ propsWithDrilldown, styleOptions });

  const headerConfigWithNarrative = useMemo(
    () =>
      narrativeToggleItem
        ? withHeaderItemsInConfig([narrativeToggleItem])(headerConfigWithExcelDownload)
        : headerConfigWithExcelDownload,
    [headerConfigWithExcelDownload, narrativeToggleItem],
  );

  const refresh = useCallback(() => setRefreshCounter((counter) => counter + 1), []);
  const headerConfigWithInfoButton = useWidgetHeaderInfoButton(headerConfigWithNarrative, {
    styleOptions: styleOptions?.header,
    dataSetName: dataSource && getDataSourceName(dataSource),
    description,
    onRefresh: refresh,
  });
  const fullHeaderConfig = useWidgetHeaderMenu(headerConfigWithInfoButton);

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
    onHeightChange: isAutoHeight ? handleTableHeightChange : undefined,
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
        styleOptions={styleOptions}
        headerConfig={fullHeaderConfig}
        contentAreaRef={contentAreaRef}
        topSlot={
          <div ref={isAutoHeight ? topSlotRef : undefined}>
            {props.topSlot}
            {narrativeTopSlot}
            {breadcrumbs}
          </div>
        }
        bottomSlot={
          <>
            {narrativeBottomSlot}
            {props.bottomSlot}
          </>
        }
      >
        {narrativeAloneContent ?? <Chart {...chartProps} />}
      </WidgetContainer>
    </DynamicSizeContainer>
  );
});
