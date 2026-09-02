import { type FunctionComponent, useCallback, useMemo, useState } from 'react';

import { Attribute, getDataSourceName } from '@sisense/sdk-data';
import omit from 'lodash-es/omit';

import { createNarrativeToggleItem } from '@/domains/narrative/components/narrative-toggle-header-item.js';
import { WidgetNarrative } from '@/domains/narrative/components/widget-narrative';
import { getWidgetNarrativeConfigFromWidgetProps } from '@/domains/narrative/core/get-widget-narrative-from-widget-props.js';
import { getCompleteWidgetNarrativeConfig } from '@/domains/narrative/core/widget-narrative-config.js';
import { PivotTable } from '@/domains/visualizations/components/pivot-table';
import type { WithCommonWidgetProps } from '@/domains/widgets/components/widget/types';
import { useWidgetHeaderInfoButton } from '@/domains/widgets/shared/widget-header/features/use-widget-header-info-button';
import { useWidgetHeaderMenu } from '@/domains/widgets/shared/widget-header/features/use-widget-header-menu';
import { useWidgetHeaderTitle } from '@/domains/widgets/shared/widget-header/features/use-widget-header-title';
import { DataOptionLocation, DrilldownSelection } from '@/index';
import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import { asSisenseComponent } from '@/infra/decorators/component-decorators/as-sisense-component';
import {
  DynamicSizeContainer,
  getWidgetDefaultSize,
} from '@/shared/components/dynamic-size-container';
import { useElementHeight } from '@/shared/hooks/use-element-height';

import { withHeaderItemsInConfig } from '../../helpers/header-items-utils';
import { useTrackWidgetInit } from '../../hooks/use-track-widget-init';
import { getWidgetEntityId } from '../../hooks/widget-entity-id';
import { getPivotWidgetName, getWidgetTitle } from '../../hooks/widget-tracking-adapters';
import { WidgetContainer } from '../../shared/widget-container';
import { getWidgetOverheadHeight } from '../../shared/widget-style-utils';
import { PivotTableWidgetProps } from './types';
import { usePivotWidgetCsvDownload } from './use-pivot-widget-csv-download.js';
import { usePivotWidgetExcelDownload } from './use-pivot-widget-excel-download.js';
import { useWithPivotTableWidgetDrilldown } from './use-with-pivot-table-widget-drilldown';

const MIN_PIVOT_HEIGHT = 100;

/**
 * Computes the outer widget height in auto-height mode.
 *
 * The inner pivot reports only its own table height. The widget reserves additional vertical
 * space above the pivot — the container chrome (header + `spaceAround` padding) and
 * the optional top slot (e.g. drilldown breadcrumbs, narrative-above). Callers must
 * sum all such non-pivot reserved space into `reservedHeight` so that pagination at the bottom of
 * the pivot remains reachable.
 *
 * @param pivotTableHeight - The measured content height of the pivot table.
 * @param reservedHeight - The total non-pivot vertical space the widget reserves (chrome + topSlot).
 * @returns The total widget height in pixels, or `undefined` when the content height is unknown.
 * @internal
 */
export function calcPivotTableWidgetHeight(
  pivotTableHeight: number | undefined,
  reservedHeight: number,
) {
  return pivotTableHeight !== undefined
    ? Math.max(MIN_PIVOT_HEIGHT, pivotTableHeight + reservedHeight)
    : undefined;
}

/**
 * React component extending `PivotTable` to support widget style options.
 *
 * @example
 * Example of using the `PivotTableWidget` component to
 * plot a pivot table over the `Sample ECommerce` data source hosted in a Sisense instance.
 * ```tsx
 * <PivotTableWidget
 *   dataSource={DM.DataSource}
 *   dataOptions={{
 *     rows: [DM.Category.Category],
 *     values: [measureFactory.sum(DM.Commerce.Cost, 'Total Cost')]
 *   }}
 *   title="Pivot Table Widget Example"
 *   styleOptions={{
 *     spaceAround: 'Medium',
 *     cornerRadius: 'Large',
 *     shadow: 'Light',
 *     border: true,
 *     borderColor: '#e0e0e0',
 *     backgroundColor: '#ffffff',
 *     header: {
 *       hidden: false,
 *       titleTextColor: '#333333',
 *       titleAlignment: 'Center',
 *       dividerLine: true,
 *       dividerLineColor: '#e0e0e0',
 *       backgroundColor: '#f5f5f5'
 *     }
 *   }}
 * />
 * ```
 * <img src="media://pivot-widget-example.png" width="800px" />
 * @param props - Pivot Table Widget properties
 * @returns Widget component representing a pivot table
 * @group Dashboards
 */
export const PivotTableWidget: FunctionComponent<PivotTableWidgetProps> = asSisenseComponent({
  componentName: 'PivotTableWidget',
})((props) => {
  useTrackWidgetInit({
    widgetType: 'pivot',
    widgetName: getPivotWidgetName(),
    widgetTitle: getWidgetTitle(props),
    entityId: getWidgetEntityId(props, 'pivot', getPivotWidgetName()),
    enabled: !!props.dataOptions,
  });
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [pivotTableHeight, setPivotTableHeight] = useState<number | undefined>();
  // Measure the top slot (custom content, narrative-above, drilldown breadcrumbs) so its height is
  // included in the auto-height budget — otherwise dynamic top-slot content pushes the pagination
  // controls out of the visible area.
  const { ref: topSlotRef, height: topSlotHeight } = useElementHeight<HTMLDivElement>();
  const { app } = useSisenseContext();
  const { themeSettings } = useThemeContext();

  const { styleOptions, dataSource = app?.defaultDataSource, dataOptions, onChange } = props;

  const headerConfigWithTitle = useWidgetHeaderTitle(props.config?.header, {
    title: props.title,
    styleOptions: styleOptions?.header,
    onChange: props.onChange,
  });

  const { headerConfig: headerConfigWithCsvDownload } = usePivotWidgetCsvDownload({
    baseHeaderConfig: headerConfigWithTitle,
    title: props.title,
    dataOptions,
    dataSource,
    filters: props.filters,
    highlights: props.highlights,
    config: props.config,
  });

  const { headerConfig: headerConfigWithExcelDownload } = usePivotWidgetExcelDownload({
    baseHeaderConfig: headerConfigWithCsvDownload,
    title: props.title,
    dataOptions,
    dataSource,
    filters: props.filters,
    config: props.config,
    id: props.id,
  });

  const hasHeader = !styleOptions?.header?.hidden;
  const defaultSize = getWidgetDefaultSize('pivot', { hasHeader });
  const overheadHeight = getWidgetOverheadHeight({ styleOptions, themeSettings, hasHeader });
  const isAutoHeight = styleOptions?.isAutoHeight ?? false;
  const styleOptionsWithoutSizing = useMemo(
    () => omit(props.styleOptions, ['width', 'height']),
    [props.styleOptions],
  );

  const onDrilldownSelectionsChange = useCallback(
    (target: Attribute | DataOptionLocation, selections: DrilldownSelection[]) => {
      onChange?.({
        type: 'drilldownSelections/changed',
        payload: { target, selections },
      });
    },
    [onChange],
  );

  const { propsWithDrilldown, breadcrumbs } = useWithPivotTableWidgetDrilldown({
    propsToExtend: props,
    onDrilldownSelectionsChange,
  });

  const completeNarrativeConfig = useMemo(
    () =>
      getCompleteWidgetNarrativeConfig(getWidgetNarrativeConfigFromWidgetProps(propsWithDrilldown)),
    [propsWithDrilldown],
  );

  const isAutoShowNarrativeEnabled =
    !!app?.settings?.narrativeConfig?.enabled &&
    completeNarrativeConfig.enabled &&
    completeNarrativeConfig.autoShow;

  // Pivot table bottom slot causes issues with pagination controls
  // Force narrative to be shown above the pivot table when the display location is 'above' or 'below'
  const showNarrativeAbove =
    isAutoShowNarrativeEnabled &&
    (completeNarrativeConfig.displayLocation === 'above' ||
      completeNarrativeConfig.displayLocation === 'below');

  const canGenerateNarrativeViaAI = app?.settings?.narrative?.canGenerateNarrativeViaAI ?? false;

  const [narrativeVisible, setNarrativeVisible] = useState(false);

  const showNarrativeTrigger =
    !!app?.settings?.narrativeConfig?.enabled &&
    canGenerateNarrativeViaAI &&
    completeNarrativeConfig.enabled &&
    !completeNarrativeConfig.autoShow;

  // Contributed as a built-in header item, so it keeps a reserved id that `position` /
  // `onBeforeRender` can address like any other built-in.
  const headerConfigWithNarrative = useMemo(
    () =>
      showNarrativeTrigger
        ? withHeaderItemsInConfig([
            createNarrativeToggleItem({
              isVisible: narrativeVisible,
              onToggle: () => setNarrativeVisible((v) => !v),
            }),
          ])(headerConfigWithExcelDownload)
        : headerConfigWithExcelDownload,
    [showNarrativeTrigger, headerConfigWithExcelDownload, narrativeVisible, setNarrativeVisible],
  );

  const refresh = useCallback(() => setRefreshCounter((counter) => counter + 1), []);
  const headerConfigWithInfoButton = useWidgetHeaderInfoButton(headerConfigWithNarrative, {
    styleOptions: styleOptions?.header,
    dataSetName: dataSource && getDataSourceName(dataSource),
    description: props.description,
    onRefresh: refresh,
  });
  const fullHeaderConfig = useWidgetHeaderMenu(headerConfigWithInfoButton);

  const narrativeShouldShow =
    !!app?.settings?.narrativeConfig?.enabled &&
    canGenerateNarrativeViaAI &&
    completeNarrativeConfig.enabled &&
    (completeNarrativeConfig.autoShow || narrativeVisible);

  const narrativeWidgetProps = useMemo((): WithCommonWidgetProps<
    PivotTableWidgetProps,
    'pivot'
  > => {
    const base = propsWithDrilldown as PivotTableWidgetProps & { id?: string };
    const id = typeof base.id === 'string' ? base.id : '__pivotWidgetNarrative__';
    return {
      ...base,
      id,
      widgetType: 'pivot',
      dataSource,
    };
  }, [propsWithDrilldown, dataSource]);

  const hasTopSlotContent = Boolean(props.topSlot || breadcrumbs || showNarrativeAbove);

  const handlePivotTableHeightChange = useCallback((nextHeight: number) => {
    setPivotTableHeight(nextHeight);
  }, []);

  const pivotTableProps = useMemo(
    () => ({
      dataSet: dataSource,
      dataOptions: propsWithDrilldown.dataOptions,
      styleOptions: styleOptionsWithoutSizing,
      filters: propsWithDrilldown.filters,
      highlights: propsWithDrilldown.highlights,
      refreshCounter,
      onHeightChange: isAutoHeight ? handlePivotTableHeightChange : undefined,
      onDataPointClick: propsWithDrilldown.onDataPointClick,
      onDataPointContextMenu: propsWithDrilldown.onDataPointContextMenu,
      onDataCellFormat: propsWithDrilldown.onDataCellFormat,
      onHeaderCellFormat: propsWithDrilldown.onHeaderCellFormat,
    }),
    [
      dataSource,
      propsWithDrilldown.dataOptions,
      propsWithDrilldown.filters,
      propsWithDrilldown.highlights,
      propsWithDrilldown.onDataPointClick,
      propsWithDrilldown.onDataPointContextMenu,
      propsWithDrilldown.onDataCellFormat,
      propsWithDrilldown.onHeaderCellFormat,
      styleOptionsWithoutSizing,
      refreshCounter,
      isAutoHeight,
      handlePivotTableHeightChange,
    ],
  );

  if (!dataOptions) {
    return null;
  }

  return (
    <DynamicSizeContainer
      defaultSize={defaultSize}
      size={{
        width: styleOptions?.width,
        height: isAutoHeight
          ? calcPivotTableWidgetHeight(pivotTableHeight, overheadHeight + topSlotHeight)
          : styleOptions?.height,
      }}
    >
      <WidgetContainer
        {...props}
        styleOptions={styleOptions}
        headerConfig={fullHeaderConfig}
        topSlot={
          hasTopSlotContent ? (
            <div ref={isAutoHeight ? topSlotRef : undefined}>
              {props.topSlot}
              {narrativeShouldShow && completeNarrativeConfig.displayLocation === 'above' ? (
                <WidgetNarrative widgetProps={narrativeWidgetProps} />
              ) : null}
              {breadcrumbs}
            </div>
          ) : undefined
        }
        bottomSlot={
          <>
            {narrativeShouldShow && completeNarrativeConfig.displayLocation === 'below' ? (
              <WidgetNarrative widgetProps={narrativeWidgetProps} />
            ) : null}
            {props.bottomSlot}
          </>
        }
      >
        {narrativeShouldShow && completeNarrativeConfig.displayLocation === 'alone' ? (
          <WidgetNarrative widgetProps={narrativeWidgetProps} />
        ) : (
          <PivotTable {...pivotTableProps} />
        )}
      </WidgetContainer>
    </DynamicSizeContainer>
  );
});
