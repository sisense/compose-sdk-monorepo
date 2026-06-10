import { type FunctionComponent, useCallback, useState } from 'react';

import { Attribute, getDataSourceName } from '@sisense/sdk-data';

import { PivotTable } from '@/domains/visualizations/components/pivot-table';
import type { WidgetChangeEvent } from '@/domains/widgets/change-events';
import { DataOptionLocation, DrilldownSelection } from '@/index';
import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import { asSisenseComponent } from '@/infra/decorators/component-decorators/as-sisense-component';
import {
  DynamicSizeContainer,
  getWidgetDefaultSize,
} from '@/shared/components/dynamic-size-container';
import { useElementHeight } from '@/shared/hooks/use-element-height';

import { useTrackWidgetInit } from '../../hooks/use-track-widget-init';
import { useWidgetHeaderManagement } from '../../hooks/use-widget-header-management';
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
 * space above the pivot — the container chrome (header + `spaceAround` padding, SNS-127785) and
 * the optional top slot (e.g. drilldown breadcrumbs, SNS-128141). Callers must sum all such
 * non-pivot reserved space into `reservedHeight` so that pagination at the bottom of the pivot
 * remains reachable.
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
  // Measure the top slot (e.g. drilldown breadcrumbs) so its height is included in the
  // auto-height budget — otherwise breadcrumbs appearing after a drilldown push the
  // pagination controls out of the visible area (SNS-128141).
  const { ref: topSlotRef, height: topSlotHeight } = useElementHeight<HTMLDivElement>();
  const { app } = useSisenseContext();
  const { themeSettings } = useThemeContext();

  const { styleOptions, dataSource = app?.defaultDataSource, dataOptions, onChange } = props;

  const { headerConfig: headerConfigWithRenaming, titleEditor } = useWidgetHeaderManagement({
    title: props.title,
    onChange: props.onChange as (event: WidgetChangeEvent) => void,
    headerConfig: props.config?.header,
  });

  const { headerConfig: headerConfigWithCsv } = usePivotWidgetCsvDownload({
    baseHeaderConfig: headerConfigWithRenaming,
    title: props.title,
    dataOptions,
    dataSource,
    filters: props.filters,
    highlights: props.highlights,
    config: props.config,
  });

  const { headerConfig } = usePivotWidgetExcelDownload({
    baseHeaderConfig: headerConfigWithCsv,
    title: props.title,
    dataOptions,
    dataSource,
    filters: props.filters,
    highlights: props.highlights,
    config: props.config,
    id: props.id,
  });

  const hasHeader = !styleOptions?.header?.hidden;
  const defaultSize = getWidgetDefaultSize('pivot', { hasHeader });
  const overheadHeight = getWidgetOverheadHeight({ styleOptions, themeSettings, hasHeader });
  const { width, height, ...styleOptionsWithoutSizing } = props.styleOptions || {};

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

  if (!dataOptions) {
    return null;
  }

  return (
    <DynamicSizeContainer
      defaultSize={defaultSize}
      size={{
        width: width,
        height: styleOptions?.isAutoHeight
          ? calcPivotTableWidgetHeight(pivotTableHeight, overheadHeight + topSlotHeight)
          : height,
      }}
    >
      <WidgetContainer
        {...props}
        headerConfig={headerConfig}
        titleEditor={titleEditor}
        topSlot={
          props.topSlot || breadcrumbs ? (
            <div ref={topSlotRef}>
              {props.topSlot}
              {breadcrumbs}
            </div>
          ) : undefined
        }
        dataSetName={dataSource && getDataSourceName(dataSource)}
        onRefresh={() => setRefreshCounter(refreshCounter + 1)}
      >
        <PivotTable
          dataSet={propsWithDrilldown.dataSource}
          dataOptions={propsWithDrilldown.dataOptions}
          styleOptions={styleOptionsWithoutSizing}
          filters={propsWithDrilldown.filters}
          highlights={propsWithDrilldown.highlights}
          refreshCounter={refreshCounter}
          onHeightChange={setPivotTableHeight}
          onDataPointClick={propsWithDrilldown.onDataPointClick}
          onDataPointContextMenu={propsWithDrilldown.onDataPointContextMenu}
          onDataCellFormat={propsWithDrilldown.onDataCellFormat}
          onHeaderCellFormat={propsWithDrilldown.onHeaderCellFormat}
        />
      </WidgetContainer>
    </DynamicSizeContainer>
  );
});
