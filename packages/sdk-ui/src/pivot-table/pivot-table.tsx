import React, { useEffect, useRef } from 'react';
import { PivotTableProps } from '../props';
import { asSisenseComponent } from '../decorators/component-decorators/as-sisense-component';
import { shouldSkipSisenseContextWaiting } from '../chart';
import { useSisenseContext } from '../sisense-context/sisense-context';
import { useGetPivotTableQuery } from './use-get-pivot-table-query';

const DEFAULT_TABLE_ROWS_PER_PAGE = 25 as const;

/**
 * Pivot Table with pagination.
 *
 * See [Pivot Tables](https://docs.sisense.com/main/SisenseLinux/pivot.htm) for more information.
 *
 * @example
 * (1) Example of PivotTable from the `Sample ECommerce` data model:
 *
 * ```tsx
 * <PivotTable
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     rows: [
 *       { column: DM.Category.Category, includeSubTotals: true },
 *       { column: DM.Commerce.AgeRange, includeSubTotals: true },
 *       DM.Commerce.Condition,
 *     ],
 *     columns: [{ column: DM.Commerce.Gender, includeSubTotals: true }],
 *     values: [
 *       {
 *         column: measureFactory.sum(DM.Commerce.Cost, 'Total Cost'),
 *         dataBars: true,
 *         totalsCalculation: 'sum',
 *       },
 *       {
 *         column: measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue'),
 *         totalsCalculation: 'sum',
 *       },
 *     ],
 *     grandTotals: { title: 'Grand Total', rows: true, columns: true },
 *   }}
 *   filters={[filterFactory.members(DM.Commerce.Gender, ['Female', 'Male'])]}
 *   styleOptions={{ width: 1000, height: 600, rowsPerPage: 50 }}
 * />
 * ```
 * @param props - Pivot Table properties
 * @returns Pivot Table component
 * @alpha
 */

export const PivotTable = asSisenseComponent({
  componentName: 'PivotTable',
  shouldSkipSisenseContextWaiting,
})((pivotTableProps: PivotTableProps) => {
  // retrieve and validate the pivot client
  const { app } = useSisenseContext();
  const pivotClient = app?.pivotClient;
  if (!pivotClient) {
    throw new Error('Pivot client not initialized');
  }

  const { styleOptions = {} } = pivotTableProps;
  // get the jaql from the pivot table props
  const { isError, error, jaql } = useGetPivotTableQuery(pivotTableProps);

  if (isError) {
    throw error;
  }

  const nodeRef = useRef<HTMLDivElement>(null);
  const pivotBuilder = pivotClient.preparePivotBuilder();

  useEffect(() => {
    if (nodeRef.current && jaql) {
      const {
        rowsPerPage = DEFAULT_TABLE_ROWS_PER_PAGE,
        width = 400,
        height = 400,
        isAutoHeight = false,
      } = styleOptions;
      const props = {
        width,
        height,
        isAutoHeight,
        isPaginated: true,
        itemsPerPage: rowsPerPage,
      };

      pivotBuilder.render(nodeRef.current, props);
      pivotBuilder.updateJaql(jaql);
    }

    return () => {
      // for cleanup if needed
    };
  }, [jaql, pivotBuilder, pivotClient, styleOptions]);

  return <div ref={nodeRef} aria-label="pivot-table-root" />;
});
