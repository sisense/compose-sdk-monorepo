/* eslint-disable max-lines-per-function */
import { Data } from '@sisense/sdk-data';

import { asSisenseComponent } from '../decorators/component-decorators/as-sisense-component';
import { TableProps } from '../props';
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
 * ## Example
 *
 * Table displaying year, condition, and total revenue from the Sample ECommerce data model.
 *
 * <iframe
 *  src='https://csdk-playground.sisense.com/?example=tables%2Faggregated-table&mode=docs'
 *  width=800
 *  height=870
 *  style='border:none;'
 * />
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
