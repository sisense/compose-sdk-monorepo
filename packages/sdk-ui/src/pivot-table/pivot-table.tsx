/* eslint-disable promise/catch-or-return */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  EVENT_SORTING_SETTINGS_CHANGED,
  type SortingSettingsChangePayload,
} from '@sisense/sdk-pivot-client';
import { PivotTableProps } from '../props';
import { asSisenseComponent } from '../decorators/component-decorators/as-sisense-component';
import { useSisenseContext } from '../sisense-context/sisense-context';
import { preparePivotRowsSortCriteriaList } from './sorting-utils';
import { DEFAULT_PIVOT_TABLE_SIZE, DynamicSizeContainer } from '@/dynamic-size-container';
import { type ContainerSize } from '@/dynamic-size-container/dynamic-size-container';
import { useThemeContext } from '@/theme-provider';
import { LoadingOverlay } from '@/common/components/loading-overlay';
import { useHasChanged } from '@/common/hooks/use-has-changed';
import { NoResultsOverlay } from '@/no-results-overlay/no-results-overlay';
import { usePivotDataLoading } from './hooks/use-pivot-data-loading';
import { usePivotDataService } from './hooks/use-pivot-data-service';
import { usePivotTableDataOptionsInternal } from './hooks/use-pivot-table-data-options-internal';
import { useApplyPivotTableFormatting } from './hooks/use-apply-pivot-table-formatting';
import { usePivotTableQuery } from './hooks/use-get-pivot-table-query';
import { useRenderPivot } from './hooks/use-render-pivot';
import { TranslatableError } from '@/translation/translatable-error';

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
 * @beta
 */

export const PivotTable = asSisenseComponent({
  componentName: 'PivotTable',
})((pivotTableProps: PivotTableProps) => {
  const { dataSet, dataOptions, filters, highlights, refreshCounter = 0 } = pivotTableProps;
  const styleOptions = useMemo(
    () => pivotTableProps.styleOptions ?? {},
    [pivotTableProps.styleOptions],
  );
  const nodeRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<ContainerSize | null>(null);
  // retrieve and validate the pivot client
  const { app } = useSisenseContext();
  const { themeSettings } = useThemeContext();
  const pivotClient = app?.pivotClient;

  if (!pivotClient) {
    throw new TranslatableError('errors.noPivotClient');
  }

  const { dataOptionsInternal, updateSort } = usePivotTableDataOptionsInternal({ dataOptions });

  // get the jaql from the pivot table props
  const { error, jaql } = usePivotTableQuery({
    dataSet,
    dataOptionsInternal,
    filters,
    highlights,
  });
  if (error) {
    throw error;
  }

  const pivotBuilder = useMemo(() => pivotClient.preparePivotBuilder(), [pivotClient]);

  const isJaqlChanged = useHasChanged(jaql);
  const isForceReload = refreshCounter > 0 && useHasChanged(refreshCounter);

  const dataService = usePivotDataService({
    pivotClient,
    pivotBuilder,
    shouldBeRecreated: isJaqlChanged || isForceReload,
  });
  useApplyPivotTableFormatting({ dataService, dataOptions });

  const { isLoading, isNoResults } = usePivotDataLoading({
    jaql,
    pivotBuilder,
    isForceReload,
  });

  useRenderPivot({ nodeRef, pivotBuilder, dataOptions, styleOptions, themeSettings, size });

  const onSort = useCallback(
    (payload: SortingSettingsChangePayload) => {
      const rowsSortCriteriaList = preparePivotRowsSortCriteriaList(payload, dataOptionsInternal);
      updateSort({
        rows: rowsSortCriteriaList,
      });
    },
    [dataOptionsInternal, updateSort],
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
      useContentSize={{ height: styleOptions?.isAutoHeight }}
      onSizeChange={updateSize}
    >
      <LoadingOverlay themeSettings={themeSettings} isVisible={isLoading}>
        <>
          {isNoResults && <NoResultsOverlay iconType="table" />}
          <div ref={nodeRef} aria-label="pivot-table-root" />
        </>
      </LoadingOverlay>
    </DynamicSizeContainer>
  );
});
