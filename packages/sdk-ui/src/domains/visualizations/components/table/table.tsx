/* eslint-disable max-lines-per-function */
import { Data } from '@sisense/sdk-data';

import { asSisenseComponent } from '../../../../infra/decorators/component-decorators/as-sisense-component';
import { TableProps } from '../../../../props';
import { TableComponent } from './table-component';

/** Function to check if we should wait for sisense context for rendering the table */
function shouldSkipSisenseContextWaiting(props: TableProps) {
  return isCompleteDataSet(props.dataSet);
}

function isCompleteDataSet(dataSet: TableProps['dataSet']): dataSet is Data {
  return !!dataSet && typeof dataSet !== 'string' && 'rows' in dataSet && 'columns' in dataSet;
}

/**
 * Table with aggregation and pagination.
 *
 * @example
 * Table displaying year, condition, and total revenue from the Sample ECommerce data model.
 *
 * ```tsx
 * import { Table } from '@sisense/sdk-ui';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * const CodeExample = () => (
 *   <Table
 *     dataSet={DM.DataSource}
 *     dataOptions={{
 *       columns: [
 *         { column: DM.Commerce.Date.Years, name: 'Year', dateFormat: 'yyyy' },
 *         DM.Commerce.Condition,
 *         measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue'),
 *       ],
 *     }}
 *     styleOptions={{
 *       rowsPerPage: 12,
 *       height: 420,
 *       header: { color: { enabled: true, backgroundColor: '#94F5F0', textColor: '#121A23' } },
 *       rows: { alternatingColor: { enabled: true, backgroundColor: '#f2f2f2' } },
 *     }}
 *   />
 * );
 *
 * export default CodeExample;
 * ```
 *
 * <img src="media://table-example-1.png" width="700px" />
 *
 * @param props - Table properties
 * @returns Table component
 * @group Data Grids
 */

export const Table = asSisenseComponent({
  componentName: 'Table',
  shouldSkipSisenseContextWaiting,
})((props: TableProps) => {
  return <TableComponent {...props} />;
});

export const DEFAULT_TABLE_ROWS_PER_PAGE = 25 as const;

/** How many pages of data will be loaded in one query */
export const PAGES_BATCH_SIZE = 10;
