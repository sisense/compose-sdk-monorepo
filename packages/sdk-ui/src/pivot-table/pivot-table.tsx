/* eslint-disable promise/catch-or-return */
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  EVENT_SORTING_SETTINGS_CHANGED,
  type SortingSettingsChangePayload,
} from '@sisense/sdk-pivot-ui';

import { LoadingOverlay } from '@/common/components/loading-overlay';
import { useHasChanged } from '@/common/hooks/use-has-changed';
import { useSyncedState } from '@/common/hooks/use-synced-state';
import { DEFAULT_PIVOT_TABLE_SIZE, DynamicSizeContainer } from '@/dynamic-size-container';
import { type ContainerSize } from '@/dynamic-size-container/dynamic-size-container';
import { NoResultsOverlay } from '@/no-results-overlay/no-results-overlay';
import { useThemeContext } from '@/theme-provider';
import { TranslatableError } from '@/translation/translatable-error';

import { asSisenseComponent } from '../decorators/component-decorators/as-sisense-component';
import { PivotTableProps } from '../props';
import { useSisenseContext } from '../sisense-context/sisense-context';
import { useApplyPivotTableFormatting } from './hooks/use-apply-pivot-table-formatting';
import { usePivotTableQuery } from './hooks/use-get-pivot-table-query';
import { usePivotBuilder } from './hooks/use-pivot-builder';
import { usePivotClient } from './hooks/use-pivot-client';
import { usePivotDataLoading } from './hooks/use-pivot-data-loading';
import { usePivotDataService } from './hooks/use-pivot-data-service';
import { usePivotTableDataOptionsInternal } from './hooks/use-pivot-table-data-options-internal';
import { useRenderPivot } from './hooks/use-render-pivot';
import { preparePivotRowsSortCriteriaList } from './sorting-utils';

export const PIVOT_WIDGET_PADDING = 8;
const NO_RESULTS_HEIGHT = 200;

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
 *     grandTotals: { rows: true, columns: true },
 *   }}
 *   filters={[filterFactory.members(DM.Commerce.Gender, ['Female', 'Male'])]}
 *   styleOptions={{ width: 1000, height: 600, rowsPerPage: 50 }}
 * />
 * ```
 * <img src="media://pivot-example-1.png" width="800px" />
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
 *
 * (3) Example of PivotTable with auto content width enabled:
 * When {@link PivotTableStyleOptions.isAutoContentWidth | `isAutoContentWidth: true`} is set, all vertical columns will be resized to fit within the component width without requiring horizontal scroll.
 *
 * ```tsx
 * <PivotTable
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     rows: [DM.Category.Category],
 *     columns: [DM.Commerce.Gender],
 *     values: [
 *       measureFactory.sum(DM.Commerce.Cost, 'Total Cost'),
 *       measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue'),
 *     ],
 *   }}
 *   styleOptions={{
 *     width: 800,
 *     height: 600,
 *     isAutoContentWidth: true,
 *     rowsPerPage: 50,
 *   }}
 * />
 * ```
 * <img src="media://pivot-auto-content-width-true.png" width="800px" />
 *
 * @remarks
 * Configuration options can also be applied within the scope of a `<SisenseContextProvider>` to control the default behavior of PivotTable, by changing available settings within `appConfig.chartConfig.tabular.*`
 *
 * Follow the link to {@link AppConfig} for more details on the available settings.
 *
 * @param props - Pivot Table properties
 * @returns Pivot Table component
 * @group Data Grids
 */
export const PivotTable = asSisenseComponent({
  componentName: 'PivotTable',
})((pivotTableProps: PivotTableProps) => {
  const {
    dataSet,
    dataOptions,
    filters,
    highlights,
    refreshCounter = 0,
    onHeightChange,
    onDataPointClick,
    onDataPointContextMenu,
  } = pivotTableProps;
  const styleOptions = useMemo(
    () => pivotTableProps.styleOptions ?? {},
    [pivotTableProps.styleOptions],
  );
  const [size, setSize] = useState<ContainerSize | null>(null);
  const [pivotTotalHeight, setPivotTotalHeight] = useState<number | null>(null);
  // retrieve and validate the pivot client
  const { app } = useSisenseContext();
  const { themeSettings } = useThemeContext();
  const pivotQueryClient = app?.pivotQueryClient;

  if (!pivotQueryClient) {
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

  const pivotClient = usePivotClient({ pivotQueryClient });
  const pivotBuilder = usePivotBuilder({ pivotClient });
  const isJaqlChanged = useHasChanged(jaql);
  const isForceReload = refreshCounter > 0 && useHasChanged(refreshCounter);

  const [pageSize, setPageSize] = useSyncedState(
    typeof styleOptions?.rowsPerPage === 'number' && !isNaN(styleOptions?.rowsPerPage)
      ? styleOptions?.rowsPerPage
      : pivotBuilder.defaultPageSize,
  );

  if (pageSize !== pivotBuilder.pageSize) {
    pivotBuilder.updatePageSize(pageSize);
  }

  const dataService = usePivotDataService({
    pivotClient,
    pivotBuilder,
    shouldBeRecreated: isJaqlChanged || isForceReload,
  });
  useApplyPivotTableFormatting({
    dataService,
    dataOptions: dataOptionsInternal,
    onDataCellFormat: pivotTableProps.onDataCellFormat,
    onHeaderCellFormat: pivotTableProps.onHeaderCellFormat,
  });

  const handlePivotHeightChange = useCallback(
    (height: number) => {
      onHeightChange?.(height);
      setPivotTotalHeight(height);
    },
    [onHeightChange],
  );

  const { pivotElement } = useRenderPivot({
    pivotBuilder,
    dataOptions: dataOptionsInternal,
    styleOptions,
    themeSettings,
    size,
    allowHtml: app?.settings?.chartConfig?.tabular?.htmlContent?.enabled,
    sanitizeHtml: app?.settings?.chartConfig?.tabular?.htmlContent?.sanitizeContents,
    isFullWidth: styleOptions.isAutoContentWidth,
    onTotalHeightChange: handlePivotHeightChange,
    onDataPointClick,
    onDataPointContextMenu,
    pageSize: pageSize,
    imageColumns: styleOptions.imageColumns,
    onPageSizeChange: setPageSize,
    alwaysShowResultsPerPage:
      styleOptions.alwaysShowResultsPerPage ??
      app?.settings?.chartConfig?.tabular?.alwaysShowResultsPerPage ??
      false,
  });

  // The pivot data layer depends on the pivot's render props.
  // Therefore, "usePivotDataLoading" hook should be invoked only after the "useRenderPivot" hook.
  const { isLoading, isNoResults } = usePivotDataLoading({
    jaql,
    pivotBuilder,
    isForceReload,
  });

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
      const height = containerSize.height - PIVOT_WIDGET_PADDING;
      const width = containerSize.width - 2 * PIVOT_WIDGET_PADDING;
      if (width !== size?.width || height !== size?.height) {
        setSize({ width, height });
      }
    },
    [size, setSize],
  );

  useEffect(() => {
    if (styleOptions?.isAutoHeight && isNoResults) {
      onHeightChange?.(NO_RESULTS_HEIGHT);
    }
  }, [pivotTotalHeight, styleOptions?.isAutoHeight, isNoResults, onHeightChange]);

  return (
    <DynamicSizeContainer
      defaultSize={DEFAULT_PIVOT_TABLE_SIZE}
      size={{
        width: styleOptions?.width,
        height:
          styleOptions?.isAutoHeight && !isNoResults
            ? pivotTotalHeight ?? styleOptions?.height
            : styleOptions?.height,
      }}
      onSizeChange={updateSize}
    >
      <LoadingOverlay isVisible={isLoading}>
        <>
          {isNoResults && <NoResultsOverlay iconType="table" />}
          <div
            aria-label="pivot-table-root"
            style={{
              padding: `${PIVOT_WIDGET_PADDING}px ${PIVOT_WIDGET_PADDING}px 0 ${PIVOT_WIDGET_PADDING}px`,
            }}
          >
            {pivotElement}
          </div>
        </>
      </LoadingOverlay>
    </DynamicSizeContainer>
  );
});
