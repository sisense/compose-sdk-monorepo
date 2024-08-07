import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  EVENT_QUERY_END,
  EVENT_QUERY_START,
  EVENT_SORTING_SETTINGS_CHANGED,
  PivotTreeNode,
  InitPageData,
  PivotBuilder,
  type SortingSettingsChangePayload,
} from '@sisense/sdk-pivot-client';
import { PivotTableProps } from '../props';
import { asSisenseComponent } from '../decorators/component-decorators/as-sisense-component';
import { useSisenseContext } from '../sisense-context/sisense-context';
import { usePivotTableQuery } from './use-get-pivot-table-query';
import { preparePivotRowsSortCriteriaList } from './sorting-utils';
import { DEFAULT_PIVOT_TABLE_SIZE, DynamicSizeContainer } from '@/dynamic-size-container';
import { type ContainerSize } from '@/dynamic-size-container/dynamic-size-container';
import { useApplyPivotTableFormatting } from './use-apply-pivot-table-formatting';
import { preparePivotStylingProps } from '@/pivot-table/helpers/prepare-pivot-styling-props';
import { useThemeContext } from '@/theme-provider';
import { usePivotTableDataOptionsInternal } from './use-pivot-table-data-options-internal';
import { LoadingOverlay } from '@/common/components/loading-overlay';
import { StyledColumn } from '@/chart-data-options/types';
import { useHasChanged } from '@/common/hooks/use-has-changed';
import { NoResultsOverlay } from '@/no-results-overlay/no-results-overlay';

const DEFAULT_TABLE_ROWS_PER_PAGE = 25 as const;

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
  const [isLoading, setIsLoading] = useState(false);
  const { dataSet, dataOptions, filters, highlights, refreshCounter } = pivotTableProps;
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
    throw new Error('Pivot client not initialized');
  }

  const { dataOptionsInternal, updateSort } = usePivotTableDataOptionsInternal({ dataOptions });

  // get the jaql from the pivot table props
  const { error, jaql } = usePivotTableQuery({
    dataSet,
    dataOptionsInternal,
    filters,
    highlights,
  });

  const onUpdatePredefinedColumnWidth = useCallback(
    (horizontalLastLevelsNodes: Array<PivotTreeNode>, resizedColumnWidth?: Array<number>) => {
      const dataOptionsFlatten = [
        ...(dataOptions.rows ? dataOptions.rows : []),
        ...(dataOptions.columns ? dataOptions.columns : []),
        ...(dataOptions.values ? dataOptions.values : []),
      ];

      const dataOptionsWidths = dataOptionsFlatten.map((i) => (i as StyledColumn)?.width);

      if (resizedColumnWidth) {
        const [nodeIndex, newWidth] = resizedColumnWidth;
        const node = horizontalLastLevelsNodes[nodeIndex];
        if (node && typeof node.jaqlIndex !== 'undefined') {
          dataOptionsWidths[node.jaqlIndex] = newWidth;
        }
      }

      const predefinedColumnWidth: Array<Array<number | undefined>> = [];
      horizontalLastLevelsNodes.forEach((columnNode, columnIndex) => {
        if (
          typeof columnNode.jaqlIndex !== 'undefined' &&
          typeof dataOptionsWidths[columnNode.jaqlIndex] !== 'undefined'
        ) {
          predefinedColumnWidth.push([
            columnIndex,
            dataOptionsWidths[columnNode.jaqlIndex] as number,
          ]);
        }
      });

      return predefinedColumnWidth;
    },
    [dataOptions],
  );

  const shouldReloadData = useHasChanged({ jaql, refreshCounter }, ['jaql', 'refreshCounter']);

  if (error) {
    throw error;
  }

  const pivotBuilder = useMemo(() => pivotClient.preparePivotBuilder(), [pivotClient]);
  const dataService = useMemo(
    () => pivotClient.prepareDataService(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pivotClient, shouldReloadData],
  );
  useApplyPivotTableFormatting({ dataService, dataOptions });

  useEffect(() => {
    if (nodeRef.current && jaql && size) {
      const { rowsPerPage = DEFAULT_TABLE_ROWS_PER_PAGE } = styleOptions;
      const props = {
        width: size.width,
        height: size.height,
        isPaginated: true,
        itemsPerPage: rowsPerPage,
        isSelectedMode: true,
        onUpdatePredefinedColumnWidth,
        ...preparePivotStylingProps(styleOptions, themeSettings),
      };
      const isPivotRendered = nodeRef.current.children.length;

      if (!isPivotRendered) {
        pivotBuilder.render(nodeRef.current, props);
      } else {
        pivotBuilder.updateProps(props);
      }

      // todo: remove "shouldReloadData" workaround after splitting pivot "render" and "data" flows into separate effects/hooks
      if (shouldReloadData) {
        // sends pivot query by redefining the dataService
        pivotBuilder.updateDataService(dataService);
        setIsLoading(true);
        dataService
          .loadData(jaql)
          .then(() => {
            pivotBuilder.updateJaql();
            setIsLoading(false);
          })
          .catch((e) => {
            setIsLoading(false);
            throw e;
          });
      }
    }
  }, [
    jaql,
    dataService,
    pivotBuilder,
    pivotClient,
    styleOptions,
    size,
    themeSettings,
    onUpdatePredefinedColumnWidth,
    shouldReloadData,
  ]);

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

  const { isNoResults } = useCheckForNoResults(pivotBuilder);

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

/**
 * Hook to check if the pivot table has no results.
 */
function useCheckForNoResults(pivotBuilder: PivotBuilder) {
  const [isNoResults, setIsNoResults] = useState(false);
  const onQueryStart = useCallback(() => {
    setIsNoResults(false);
  }, []);

  const onQueryEnd = useCallback((data: InitPageData) => {
    setIsNoResults(!data.cellsMetadata);
  }, []);

  useEffect(() => {
    pivotBuilder.on(EVENT_QUERY_START, onQueryStart);
    return () => {
      pivotBuilder.off(EVENT_QUERY_START, onQueryStart);
    };
  }, [pivotBuilder, onQueryStart]);

  useEffect(() => {
    pivotBuilder.on(EVENT_QUERY_END, onQueryEnd);
    return () => {
      pivotBuilder.off(EVENT_QUERY_END, onQueryEnd);
    };
  }, [pivotBuilder, onQueryEnd]);

  return { isNoResults };
}
