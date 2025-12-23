import { type FunctionComponent, useState } from 'react';

import { getDataSourceName } from '@sisense/sdk-data';

import { useSisenseContext } from '@/sisense-context/sisense-context';

import { asSisenseComponent } from '../decorators/component-decorators/as-sisense-component';
import { DynamicSizeContainer, getWidgetDefaultSize } from '../dynamic-size-container';
import { PivotTable } from '../pivot-table';
import { PivotTableWidgetProps } from '../props';
import { WidgetContainer } from './common/widget-container';
import { DEFAULT_WIDGET_HEADER_HEIGHT } from './constants';

function calcPivotTableWidgetHeight(pivotTableHeight: number | undefined) {
  return pivotTableHeight ? pivotTableHeight + DEFAULT_WIDGET_HEADER_HEIGHT : undefined;
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

  const { styleOptions, dataSource = app?.defaultDataSource, dataOptions } = props;

  const defaultSize = getWidgetDefaultSize('pivot', {
    hasHeader: !styleOptions?.header?.hidden,
  });
  const { width, height, ...styleOptionsWithoutSizing } = props.styleOptions || {};

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
        dataSetName={dataSource && getDataSourceName(dataSource)}
        onRefresh={() => setRefreshCounter(refreshCounter + 1)}
      >
        <PivotTable
          dataSet={props.dataSource}
          dataOptions={props.dataOptions}
          styleOptions={styleOptionsWithoutSizing}
          filters={props.filters}
          highlights={props.highlights}
          refreshCounter={refreshCounter}
          onHeightChange={setPivotTableHeight}
          onDataPointClick={props.onDataPointClick}
          onDataPointContextMenu={props.onDataPointContextMenu}
          onDataCellFormat={props.onDataCellFormat}
          onHeaderCellFormat={props.onHeaderCellFormat}
        />
      </WidgetContainer>
    </DynamicSizeContainer>
  );
});
