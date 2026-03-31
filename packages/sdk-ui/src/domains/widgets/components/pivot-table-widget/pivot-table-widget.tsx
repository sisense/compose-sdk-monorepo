import { type FunctionComponent, useCallback, useState } from 'react';

import { Attribute, getDataSourceName } from '@sisense/sdk-data';

import { PivotTable } from '@/domains/visualizations/components/pivot-table';
import type { WidgetChangeEvent } from '@/domains/widgets/change-events';
import { DataOptionLocation, DrilldownSelection } from '@/index';
import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';
import { asSisenseComponent } from '@/infra/decorators/component-decorators/as-sisense-component';
import {
  DynamicSizeContainer,
  getWidgetDefaultSize,
} from '@/shared/components/dynamic-size-container';

import { DEFAULT_WIDGET_HEADER_HEIGHT } from '../../constants';
import { useWidgetHeaderManagement } from '../../hooks/use-widget-header-management';
import { WidgetContainer } from '../../shared/widget-container';
import { PivotTableWidgetProps } from './types';
import { usePivotWidgetCsvDownload } from './use-pivot-widget-csv-download.js';
import { useWithPivotTableWidgetDrilldown } from './use-with-pivot-table-widget-drilldown';

const MIN_PIVOT_HEIGHT = 100;

function calcPivotTableWidgetHeight(pivotTableHeight: number | undefined) {
  return pivotTableHeight
    ? Math.max(MIN_PIVOT_HEIGHT, pivotTableHeight + DEFAULT_WIDGET_HEADER_HEIGHT)
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
 *
 * @param props - Pivot Table Widget properties
 * @returns Widget component representing a pivot table
 * @group Dashboards
 */
export const PivotTableWidget: FunctionComponent<PivotTableWidgetProps> = asSisenseComponent({
  componentName: 'PivotTableWidget',
})((props) => {
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [pivotTableHeight, setPivotTableHeight] = useState<number | undefined>();
  const { app } = useSisenseContext();

  const { styleOptions, dataSource = app?.defaultDataSource, dataOptions, onChange } = props;

  const { headerConfig: headerConfigWithRenaming, titleEditor } = useWidgetHeaderManagement({
    title: props.title,
    onChange: props.onChange as (event: WidgetChangeEvent) => void,
    headerConfig: props.config?.header,
  });

  const { headerConfig } = usePivotWidgetCsvDownload({
    baseHeaderConfig: headerConfigWithRenaming,
    title: props.title,
    dataOptions,
    dataSource,
    filters: props.filters,
    highlights: props.highlights,
    config: props.config,
  });

  const defaultSize = getWidgetDefaultSize('pivot', {
    hasHeader: !styleOptions?.header?.hidden,
  });
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
        height: styleOptions?.isAutoHeight ? calcPivotTableWidgetHeight(pivotTableHeight) : height,
      }}
    >
      <WidgetContainer
        {...props}
        headerConfig={headerConfig}
        titleEditor={titleEditor}
        topSlot={
          <>
            {props.topSlot}
            {breadcrumbs}
          </>
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
