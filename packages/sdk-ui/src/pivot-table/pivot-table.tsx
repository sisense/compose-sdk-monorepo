import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  EVENT_SORTING_SETTINGS_CHANGED,
  type JaqlRequest,
  type SortingSettingsChangePayload,
} from '@sisense/sdk-pivot-client';
import { PivotTableProps } from '../props';
import { asSisenseComponent } from '../decorators/component-decorators/as-sisense-component';
import { shouldSkipSisenseContextWaiting } from '../chart';
import { useSisenseContext } from '../sisense-context/sisense-context';
import { useGetPivotTableQuery } from './use-get-pivot-table-query';
import { normalizeJaqlSorting, prepareSortedJaql } from './sorting-utils';
import { DynamicSizeContainer } from '@/dynamic-size-container';
import { type ContainerSize } from '@/dynamic-size-container/dynamic-size-container';
import { useApplyPivotTableFormatting } from './use-apply-pivot-table-formatting';

const DEFAULT_TABLE_ROWS_PER_PAGE = 25 as const;
const DEFAULT_PIVOT_TABLE_SIZE = {
  width: 400,
  height: 500,
};

/**
 * Pivot table with pagination.
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
 *
 * (2) Example of PivotTable with the predefined sorting configuration:
 * - Sort "Condition" row by its values in Ascending order. This is equivalent to users clicking on the "Condition" row heading and hit Sort Ascending (A-Z)
 * - Sort "Category" row by "Total Cost" values under the "columns" values of "Female" (for Gender) and "0-18" (for AgeRange) in Descending order.
 * This is equivalent to users clicking on the "Total Cost" value heading under "Female" (for Gender) and "0-18" (for AgeRange) and sort "Category (Subtotals)" in Descending (9-1)
 *
 * ```tsx
 * <PivotTable
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     rows: [
 *       {
 *         column: DM.Category.Category,
 *         includeSubTotals: true,
 *         sortType: {
 *           direction: 'sortDesc',
 *           by: {
 *             valuesIndex: 0,
 *             columnsMembersPath: ['Female', '0-18']
 *           }
 *         }
 *       },
 *       {
 *         column: DM.Commerce.Condition,
 *         sortType: {
 *           direction: 'sortAsc'
 *         }
 *       },
 *     ],
 *     columns: [
 *       DM.Commerce.Gender,
 *       DM.Commerce.AgeRange
 *     ],
 *     values: [
 *       measureFactory.sum(DM.Commerce.Cost, 'Total Cost'),
 *       measureFactory.sum(DM.Commerce.Quantity, 'Total Quantity'),
 *     ],
 *   }}
 * />
 * ```
 *
 * <img src="media://pivot-sorting-example-1.png" width="800px" />
 * @param props - Pivot Table properties
 * @returns Pivot Table component
 * @group Data Grids
 * @alpha
 */

export const PivotTable = asSisenseComponent({
  componentName: 'PivotTable',
  shouldSkipSisenseContextWaiting,
  // eslint-disable-next-line max-lines-per-function
})((pivotTableProps: PivotTableProps) => {
  const { styleOptions = {}, dataSet, dataOptions, filters, refreshCounter = 0 } = pivotTableProps;
  const nodeRef = useRef<HTMLDivElement>(null);
  const [jaql, setJaql] = useState<JaqlRequest | null>(null);
  const [size, setSize] = useState<ContainerSize | null>(null);
  // retrieve and validate the pivot client
  const { app } = useSisenseContext();
  const pivotClient = app?.pivotClient;

  if (!pivotClient) {
    throw new Error('Pivot client not initialized');
  }

  // get the initial jaql from the pivot table props
  const {
    isError,
    error,
    jaql: baseJaql,
  } = useGetPivotTableQuery({
    dataSet,
    dataOptions,
    filters,
    refreshCounter,
  });

  if (isError) {
    throw error;
  }

  const pivotBuilder = useMemo(() => pivotClient.preparePivotBuilder(), [pivotClient]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const dataService = useMemo(() => pivotClient.prepareDataService(), [pivotClient, jaql]);
  useApplyPivotTableFormatting({ dataService, dataOptions });

  useEffect(() => {
    if (baseJaql) {
      setJaql(normalizeJaqlSorting(baseJaql));
    }
  }, [baseJaql]);

  useEffect(() => {
    if (nodeRef.current && jaql && size) {
      const { rowsPerPage = DEFAULT_TABLE_ROWS_PER_PAGE, isAutoHeight = false } = styleOptions;
      const props = {
        width: size.width,
        height: size.height,
        isAutoHeight,
        isPaginated: true,
        itemsPerPage: rowsPerPage,
      };
      const isPivotRendered = nodeRef.current.children.length;

      if (!isPivotRendered) {
        pivotBuilder.render(nodeRef.current, props);
      } else {
        pivotBuilder.updateProps(props);
      }

      // sends pivot query by redefining the dataService
      pivotBuilder.updateDataService(dataService);
      /* eslint-disable-next-line promise/catch-or-return */
      dataService.loadData(jaql).then(() => pivotBuilder.updateJaql());
    }
  }, [jaql, dataService, pivotBuilder, pivotClient, styleOptions, size]);

  const onSort = useCallback(
    (payload: SortingSettingsChangePayload) => {
      const sortedJaql = prepareSortedJaql(jaql!, payload);
      setJaql(sortedJaql);
    },
    [jaql],
  );

  useEffect(() => {
    pivotBuilder.on(EVENT_SORTING_SETTINGS_CHANGED, onSort);
    return () => {
      pivotBuilder.off(EVENT_SORTING_SETTINGS_CHANGED, onSort);
    };
  }, [pivotBuilder, onSort]);

  const updateSize = useCallback(
    (containerSize: ContainerSize) => {
      if (containerSize.width !== size?.width || containerSize.height !== size?.height) {
        setSize(containerSize);
      }
    },
    [size, setSize],
  );

  return (
    <DynamicSizeContainer
      defaultSize={DEFAULT_PIVOT_TABLE_SIZE}
      size={{
        width: styleOptions?.width,
        height: styleOptions?.height,
      }}
      onSizeChange={updateSize}
    >
      <div ref={nodeRef} aria-label="pivot-table-root" />
    </DynamicSizeContainer>
  );
});
