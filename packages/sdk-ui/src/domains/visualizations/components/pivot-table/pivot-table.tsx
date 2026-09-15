/* eslint-disable promise/catch-or-return */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  EVENT_SORTING_SETTINGS_CHANGED,
  type SortingSettingsChangePayload,
} from '@sisense/sdk-pivot-ui';

import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import { asSisenseComponent } from '@/infra/decorators/component-decorators/as-sisense-component';
import { TranslatableError } from '@/infra/translation/translatable-error';
import { PivotTableProps } from '@/props';
import {
  DEFAULT_PIVOT_TABLE_SIZE,
  DynamicSizeContainer,
} from '@/shared/components/dynamic-size-container';
import { type ContainerSize } from '@/shared/components/dynamic-size-container/dynamic-size-container';
import { LoadingOverlay } from '@/shared/components/loading-overlay';
import { NoResultsOverlay } from '@/shared/components/no-results-overlay/no-results-overlay';
import { useHasChanged } from '@/shared/hooks/use-has-changed';
import { useSyncedState } from '@/shared/hooks/use-synced-state';

import { useApplyPivotTableFormatting } from './hooks/use-apply-pivot-table-formatting';
import { usePivotTableQuery } from './hooks/use-get-pivot-table-query';
import { usePivotBuilder } from './hooks/use-pivot-builder';
import { usePivotClient } from './hooks/use-pivot-client';
import { usePivotDataLoading } from './hooks/use-pivot-data-loading';
import { usePivotDataService } from './hooks/use-pivot-data-service';
import { usePivotTableDataOptionsInternal } from './hooks/use-pivot-table-data-options-internal';
import { useRenderPivot } from './hooks/use-render-pivot';
import {
  hasPivotContainerSizeChanged,
  resolvePivotContainerSize,
} from './resolve-pivot-container-size';
import { preparePivotRowsSortCriteriaList } from './sorting-utils';

export const PIVOT_WIDGET_PADDING = 8;
const NO_RESULTS_HEIGHT = 200;

/**
 * Pivot table with pagination.
 *
 * @example
 * ```tsx
 * import { PivotTable } from '@sisense/sdk-ui';
 * import * as DM from './sample-ecommerce';
 * import { measureFactory } from '@sisense/sdk-data';
 *
 * const CodeExample = () => {
 *   return (
 *     <PivotTable
 *       dataSet={DM.DataSource}
 *       dataOptions={{
 *         rows: [
 *           {
 *             column: DM.Commerce.Date.Years,
 *             dateFormat: 'yyyy',
 *             name: 'Year',
 *           },
 *           DM.Commerce.Condition,
 *         ],
 *         columns: [DM.Commerce.AgeRange],
 *         values: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *       }}
 *       styleOptions={{
 *         rowsPerPage: 10,
 *         height: 425,
 *         width: 800,
 *       }}
 *     />
 *   );
 * };
 *
 * export default CodeExample;
 * ```
 *
 * <img src="media://pivot-table-example-1.png" width="800px" />
 *
 * Additional examples:
 *
 * Highlighting relative magnitude within a column with data bars:
 * ```tsx
 * import { PivotTable } from '@sisense/sdk-ui';
 * import * as DM from './sample-ecommerce';
 * import { measureFactory } from '@sisense/sdk-data';
 *
 * const CodeExample = () => {
 *   return (
 *     <PivotTable
 *       dataSet={DM.DataSource}
 *       dataOptions={{
 *         rows: [DM.Commerce.Condition, DM.Commerce.AgeRange],
 *         columns: [
 *           {
 *             column: DM.Commerce.Date.Years,
 *             dateFormat: 'yyyy',
 *             name: 'Year',
 *           },
 *         ],
 *         values: [
 *           {
 *             column: measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue'),
 *             dataBars: true,
 *           },
 *         ],
 *       }}
 *       styleOptions={{
 *         rowsPerPage: 10,
 *         height: 425,
 *         width: 850,
 *       }}
 *     />
 *   );
 * };
 *
 * export default CodeExample;
 * ```
 *
 * <img src="media://pivot-table-example-2.png" width="800px" />
 *
 * Sorting rows: `Condition` and `Age Range` rows sorted directly by their own values (equivalent to a user clicking a row heading and choosing Sort Descending):
 * ```tsx
 * import { PivotTable } from '@sisense/sdk-ui';
 * import * as DM from './sample-ecommerce';
 * import { measureFactory } from '@sisense/sdk-data';
 *
 * const CodeExample = () => {
 *   return (
 *     <PivotTable
 *       dataSet={DM.DataSource}
 *       dataOptions={{
 *         rows: [
 *           {
 *             column: DM.Commerce.Condition,
 *             sortType: 'sortDesc',
 *           },
 *           {
 *             column: DM.Commerce.AgeRange,
 *             sortType: 'sortDesc',
 *           },
 *         ],
 *         columns: [{ column: DM.Commerce.Date.Years }],
 *         values: [
 *           { column: measureFactory.sum(DM.Commerce.Revenue, 'Revenue') },
 *           { column: measureFactory.sum(DM.Commerce.Quantity, 'Units') },
 *         ],
 *       }}
 *       styleOptions={{
 *         rowsPerPage: 12,
 *         height: 425,
 *         width: 1200,
 *       }}
 *     />
 *   );
 * };
 *
 * export default CodeExample;
 * ```
 *
 * <img src="media://pivot-table-example-3.png" width="800px" />
 *
 * Sorting rows by a value column: `Age Range` sorted by its `Revenue` values (equivalent to a user clicking the `Revenue` value heading and sorting `Age Range` Descending):
 * ```tsx
 * import { PivotTable } from '@sisense/sdk-ui';
 * import * as DM from './sample-ecommerce';
 * import { measureFactory } from '@sisense/sdk-data';
 *
 * const CodeExample = () => {
 *   return (
 *     <PivotTable
 *       dataSet={DM.DataSource}
 *       dataOptions={{
 *         rows: [
 *           DM.Commerce.Condition,
 *           {
 *             column: DM.Commerce.AgeRange,
 *             sortType: {
 *               direction: 'sortDesc',
 *               by: {
 *                 valuesIndex: 0,
 *               },
 *             },
 *           },
 *         ],
 *         values: [
 *           measureFactory.sum(DM.Commerce.Revenue, 'Revenue'),
 *           measureFactory.sum(DM.Commerce.Quantity, 'Units'),
 *         ],
 *       }}
 *       styleOptions={{
 *         rowsPerPage: 12,
 *         height: 425,
 *         width: 800,
 *       }}
 *     />
 *   );
 * };
 *
 * export default CodeExample;
 * ```
 *
 * <img src="media://pivot-table-example-4.png" width="800px" />
 *
 * Grand totals across rows and columns:
 * ```tsx
 * import { PivotTable } from '@sisense/sdk-ui';
 * import * as DM from './sample-ecommerce';
 * import { measureFactory } from '@sisense/sdk-data';
 *
 * const CodeExample = () => {
 *   return (
 *     <PivotTable
 *       dataSet={DM.DataSource}
 *       dataOptions={{
 *         rows: [
 *           {
 *             column: DM.Commerce.Date.Years,
 *             dateFormat: 'yyyy',
 *             name: 'Year',
 *           },
 *           DM.Commerce.Condition,
 *         ],
 *         columns: [DM.Commerce.AgeRange],
 *         values: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *         grandTotals: {
 *           rows: true,
 *           columns: true,
 *         },
 *       }}
 *       styleOptions={{
 *         rowsPerPage: 15,
 *         height: 550,
 *         width: 900,
 *         totalsColor: true,
 *         headersColor: true,
 *       }}
 *     />
 *   );
 * };
 *
 * export default CodeExample;
 * ```
 *
 * <img src="media://pivot-table-example-5.png" width="800px" />
 *
 * Grand totals plus a subtotal row per `Year`, via {@link PivotTableDataOptions.rows}' `includeSubTotals`:
 * ```tsx
 * import { PivotTable } from '@sisense/sdk-ui';
 * import * as DM from './sample-ecommerce';
 * import { measureFactory } from '@sisense/sdk-data';
 *
 * const CodeExample = () => {
 *   return (
 *     <PivotTable
 *       dataSet={DM.DataSource}
 *       dataOptions={{
 *         rows: [
 *           {
 *             column: DM.Commerce.Date.Years,
 *             dateFormat: 'yyyy',
 *             name: 'Year',
 *             includeSubTotals: true,
 *           },
 *           DM.Commerce.Condition,
 *         ],
 *         columns: [DM.Commerce.AgeRange],
 *         values: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *         grandTotals: {
 *           rows: true,
 *           columns: true,
 *         },
 *       }}
 *       styleOptions={{
 *         rowsPerPage: 15,
 *         height: 550,
 *         width: 900,
 *         totalsColor: true,
 *         headersColor: true,
 *       }}
 *     />
 *   );
 * };
 *
 * export default CodeExample;
 * ```
 *
 * <img src="media://pivot-table-example-6.png" width="800px" />
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
  const { t } = useTranslation();
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
  const isAutoHeight = styleOptions?.isAutoHeight ?? false;

  /*
   * Detect client-side formatting changes that don't alter the JAQL query
   * (for example, color or number format changes on pivot value columns).
   *
   * These changes are applied entirely on the client side, so the generated
   * JAQL remains identical. Without this additional signal, the pivot would
   * not detect any change and therefore would not re-render.
   */
  const formattingKey = useMemo(
    () =>
      JSON.stringify({
        values: dataOptionsInternal.values?.map(({ color, numberFormatConfig }) => ({
          color,
          numberFormatConfig,
        })),
        rows: dataOptionsInternal.rows?.map(({ color, numberFormatConfig }) => ({
          color,
          numberFormatConfig,
        })),
      }),
    [dataOptionsInternal],
  );
  const isFormattingOnlyChange = useHasChanged(formattingKey) && !isJaqlChanged;

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
    shouldBeRecreated: isJaqlChanged || isForceReload || isFormattingOnlyChange,
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
  const {
    isLoading,
    isNoResults,
    error: queryError,
  } = usePivotDataLoading({
    jaql,
    pivotBuilder,
    isForceReload: isForceReload || isFormattingOnlyChange,
  });
  if (queryError) {
    throw queryError;
  }

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

  useEffect(() => {
    if (isJaqlChanged || isForceReload) {
      setSize(null);
    }
  }, [isJaqlChanged, isForceReload]);

  const updateSize = useCallback(
    (containerSize: ContainerSize) => {
      const nextSize = resolvePivotContainerSize(
        containerSize,
        { vertical: PIVOT_WIDGET_PADDING, horizontal: 2 * PIVOT_WIDGET_PADDING },
        size,
        isAutoHeight,
      );
      if (hasPivotContainerSizeChanged(size, nextSize)) {
        setSize(nextSize);
      }
    },
    [size, isAutoHeight],
  );

  useEffect(() => {
    if (isAutoHeight && isNoResults) {
      onHeightChange?.(NO_RESULTS_HEIGHT);
    }
  }, [pivotTotalHeight, isAutoHeight, isNoResults, onHeightChange]);

  return (
    <DynamicSizeContainer
      defaultSize={DEFAULT_PIVOT_TABLE_SIZE}
      size={{
        width: styleOptions?.width,
        height:
          isAutoHeight && !isNoResults
            ? pivotTotalHeight ?? styleOptions?.height
            : styleOptions?.height,
      }}
      onSizeChange={updateSize}
    >
      <LoadingOverlay isVisible={isLoading}>
        <>
          {isNoResults && <NoResultsOverlay iconType="table" />}
          <div
            role="region"
            aria-label={t('chart.pivotTable.label')}
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
