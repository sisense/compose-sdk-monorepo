/* eslint-disable @typescript-eslint/naming-convention */
import React, { type FunctionComponent, useState } from 'react';

import { getDataSourceName } from '@sisense/sdk-data';

import { useSisenseContext } from '@/sisense-context/sisense-context';
import { Table } from '@/table';

import { asSisenseComponent } from '../decorators/component-decorators/as-sisense-component';
import { DynamicSizeContainer, getWidgetDefaultSize } from '../dynamic-size-container';
import { TableWidgetProps } from '../props';
import { WidgetContainer } from './common/widget-container';

/**
 * The TableWidget component extending the Table component to support widget style options.
 *
 * @example
 * Example of using the `Widget` component to
 * plot a bar chart of the `Sample ECommerce` data source hosted in a Sisense instance.
 * Drill-down capability is enabled.
 * ```tsx
 * <TableWidget
 *   dataSource={DM.DataSource}
 *   dataOptions={{
 *     columns: [DM.Category.Category]
 *   }}
 * />
 * ```
 * @param props - Table Widget properties
 * @returns Widget component representing a table
 * @internal
 */
export const TableWidget: FunctionComponent<TableWidgetProps> = asSisenseComponent({
  componentName: 'TableWidget',
})((props) => {
  const [refreshCounter, setRefreshCounter] = useState(0);
  const { app } = useSisenseContext();

  const { styleOptions, dataSource = app?.defaultDataSource, dataOptions } = props;

  const defaultSize = getWidgetDefaultSize('table', {
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
        height: height,
      }}
    >
      <WidgetContainer
        {...props}
        dataSetName={dataSource && getDataSourceName(dataSource)}
        onRefresh={() => setRefreshCounter(refreshCounter + 1)}
      >
        <Table
          dataSet={props.dataSource}
          dataOptions={props.dataOptions}
          styleOptions={styleOptionsWithoutSizing}
          filters={props.filters}
          refreshCounter={refreshCounter}
        />
      </WidgetContainer>
    </DynamicSizeContainer>
  );
});
