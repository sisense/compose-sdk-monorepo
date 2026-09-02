import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Pagination from '@mui/material/Pagination';
import { isDataSource } from '@sisense/sdk-data';
import { getFilterListAndRelationsJaql } from '@sisense/sdk-data';

import { isData } from '@/domains/visualizations/components/chart/components/regular-chart';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import { TranslatableError } from '@/infra/translation/translatable-error';
import {
  DynamicSizeContainer,
  getChartDefaultSize,
} from '@/shared/components/dynamic-size-container';
import { LoadingOverlay } from '@/shared/components/loading-overlay';
import { NoResultsOverlay } from '@/shared/components/no-results-overlay/no-results-overlay';

import { TableProps } from '../../../../props';
import {
  translateTableDataOptions,
  withUniqueMeasureNames,
} from '../../core/chart-data-options/translate-data-options';
import { TableDataOptionsInternal } from '../../core/chart-data-options/types';
import { isDataTableEmpty } from '../../core/chart-data-processor/table-creators';
import { Column as DataTableColumn } from '../../core/chart-data-processor/table-processor';
import { orderBy } from '../../core/chart-data-processor/table-processor';
import { updateInnerDataOptionsSort } from '../../core/chart-data/table-data';
import { calcTableContentHeight, TABLE_NO_RESULTS_HEIGHT } from './calc-table-height';
import { formatRowCount } from './helpers/format-row-count';
import { useTableData } from './hooks/use-table-data';
import { useTableDataTable } from './hooks/use-table-datatable';
import { PureTable } from './pure-table';
import { PAGINATION_HEIGHT } from './pure-table/styles/style-constants';
import { getCustomPaginationStyles } from './styles/get-custom-pagination-styles';
import { translateTableStyleOptionsToDesignOptions } from './translations/design-options';

export const DEFAULT_TABLE_ROWS_PER_PAGE = 25;

/** How many pages of data will be loaded in one query */
export const PAGES_BATCH_SIZE = 10;

/** How many page-number links to show at each boundary of the pagination control. */
const PAGINATION_BOUNDARY_COUNT = 2;

/**
 * Component that renders a table with aggregation and pagination.
 */
export const TableComponent = ({
  dataSet,
  dataOptions,
  styleOptions = {},
  filters,
  includeTotalRows,
  onDataReady,
  onHeightChange,
}: TableProps) => {
  const {
    rowsPerPage = DEFAULT_TABLE_ROWS_PER_PAGE,
    width,
    height,
    isAutoHeight = false,
  } = styleOptions;
  const { t, i18n } = useTranslation();
  const { themeSettings } = useThemeContext();
  const [offset, setOffset] = useState(0);
  const { filters: filterList, relations: filterRelations } = useMemo(
    () => getFilterListAndRelationsJaql(filters),
    [filters],
  );
  const [currentPage, setCurrentPage] = useState(1);
  const paginationEl = useRef(null);

  const { dataOptions: translatedDataOptions, mapping: translatedDataColumnNamesMapping } = useMemo(
    () => withUniqueMeasureNames(translateTableDataOptions(dataOptions)),
    [dataOptions],
  );

  const designOptions = useMemo(
    () => translateTableStyleOptionsToDesignOptions(styleOptions),
    [styleOptions],
  );

  const [innerDataOptions, setInnerDataOptions] =
    useState<TableDataOptionsInternal>(translatedDataOptions);
  const [innerDataColumnNamesMapping, setInnerDataColumnNamesMapping] = useState(
    translatedDataColumnNamesMapping,
  );

  const [usedDataSet, setUsedDataset] = useState(dataSet);
  const {
    data,
    dataOptions: updatedDataOptions,
    dataColumnNamesMapping: updatedDataColumnNamesMapping,
    loadedRowRange,
    rowCount,
  } = useTableData({
    dataSet: usedDataSet,
    dataOptions: innerDataOptions,
    dataColumnNamesMapping: innerDataColumnNamesMapping,
    filters: filterList,
    filterRelations,
    count: rowsPerPage * PAGES_BATCH_SIZE,
    offset,
    includeTotalRows,
  });

  const finalData = useMemo(() => {
    if (data && onDataReady) {
      const customizedData = onDataReady(data);
      if (!isData(customizedData)) {
        throw new TranslatableError('errors.incorrectOnDataReadyHandler');
      }
      return customizedData;
    }
    return data;
    // Ignore rule to avoid unnecessary calls "onDataReady"
    // Trigger only on "data" update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const dataTable = useTableDataTable({
    data: finalData,
    innerDataOptions: updatedDataOptions,
    dataColumnNamesMapping: updatedDataColumnNamesMapping,
    needToAggregate: !isDataSource(usedDataSet),
  });

  useEffect(() => {
    setInnerDataOptions(translatedDataOptions);
    setInnerDataColumnNamesMapping(translatedDataColumnNamesMapping);
    setUsedDataset(dataSet);

    setCurrentPage(1);
    setOffset(0);
    // Filters can shrink the result set out from under a page the user is already on,
    // so a filter change resets pagination the same way a dataset change does.
  }, [
    dataSet,
    translatedDataOptions,
    translatedDataColumnNamesMapping,
    filterList,
    filterRelations,
  ]);

  const onPageChange = useCallback(
    (page: number) => {
      if (loadedRowRange) {
        const neededStart = (page - 1) * rowsPerPage;
        const neededEnd = page * rowsPerPage;
        const isWithinLoadedRange =
          neededStart >= loadedRowRange.start && neededEnd <= loadedRowRange.end;

        if (!isWithinLoadedRange) {
          const isSequentialExtension = neededStart === loadedRowRange.end;
          const nextOffset = isSequentialExtension
            ? loadedRowRange.end
            : Math.floor((page - 1) / PAGES_BATCH_SIZE) * PAGES_BATCH_SIZE * rowsPerPage;
          setOffset(nextOffset);
        }
      }
      setCurrentPage(page);
    },
    [loadedRowRange, rowsPerPage],
  );

  const onSortUpdate = useCallback(
    (column: DataTableColumn) => {
      setCurrentPage(1);
      setOffset(0);
      if (innerDataOptions) {
        setInnerDataOptions(updateInnerDataOptionsSort(innerDataOptions, column));
      }
    },
    [innerDataOptions],
  );

  const sortedTable = useMemo(() => {
    if (!dataTable) {
      return dataTable;
    }
    if (isDataSource(usedDataSet)) {
      return dataTable;
    }
    const columnWithSorting = dataTable.columns.find((c) => c.direction !== 0);
    if (!columnWithSorting) {
      return dataTable;
    }
    return orderBy(dataTable, [columnWithSorting]);
  }, [dataTable, usedDataSet]);

  const paginatedTable = useMemo(() => {
    if (!sortedTable) return undefined;
    // Rows loaded via a DataSource query may start at a non-zero absolute offset
    // (e.g. after jumping to a distant page), so the slice is relative to that.
    const rangeStart = loadedRowRange?.start ?? 0;
    const start = (currentPage - 1) * rowsPerPage - rangeStart;
    return {
      columns: sortedTable.columns,
      rows: sortedTable.rows.slice(start, start + rowsPerPage),
    };
  }, [sortedTable, currentPage, rowsPerPage, loadedRowRange]);

  // Derived only from the row count and fixed style metrics — never from a measured container
  // size, which would close a feedback loop with the surrounding DynamicSizeContainer.
  //
  // Sized for a full page rather than the current page's row count, so paging onto a shorter last
  // page does not resize the widget. This matches Fusion, which emits a height on widget render but
  // not on page change (its per-page re-measure is gated on wordwrap, which is off by default).
  //
  // `undefined` while there is no data yet: the height is unknown, not zero.
  const measuredAutoHeight = useMemo(() => {
    if (!isAutoHeight || !dataTable) {
      return undefined;
    }
    if (isDataTableEmpty(dataTable)) {
      return TABLE_NO_RESULTS_HEIGHT;
    }
    return calcTableContentHeight({
      rowsToFit: Math.min(rowsPerPage, dataTable.rows.length),
      paddingVertical: designOptions.paddingVertical,
    });
  }, [isAutoHeight, dataTable, rowsPerPage, designOptions.paddingVertical]);

  // Height used until the first result arrives. A page of data can only be navigated to if a full
  // page of rows exists for it, so this equals the measured height in every case except a dataset
  // shorter than one page (or an empty one), which settles on the first result.
  const estimatedAutoHeight = useMemo(
    () =>
      isAutoHeight
        ? calcTableContentHeight({
            rowsToFit: rowsPerPage,
            paddingVertical: designOptions.paddingVertical,
          })
        : undefined,
    [isAutoHeight, rowsPerPage, designOptions.paddingVertical],
  );

  // Last measured height, so a reload never falls back to an estimate that differs from what is
  // already on screen (a dataset shorter than one page would otherwise stretch and snap back).
  const lastMeasuredAutoHeightRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (measuredAutoHeight !== undefined) {
      lastMeasuredAutoHeightRef.current = measuredAutoHeight;
    }
  }, [measuredAutoHeight]);

  // Must never become `undefined` once auto height is on: `DynamicSizeContainer` then falls back to
  // inheriting its parent's height, and in auto-height mode the parent has no height of its own to
  // inherit — it is being sized by this value — so the whole table collapses. `useTableData`
  // returns `null` for the duration of every query, which makes that the normal loading state.
  const autoHeight = isAutoHeight
    ? measuredAutoHeight ?? lastMeasuredAutoHeightRef.current ?? estimatedAutoHeight
    : undefined;

  useEffect(() => {
    if (autoHeight !== undefined) {
      onHeightChange?.(autoHeight);
    }
  }, [autoHeight, onHeightChange]);

  if (!updatedDataOptions) return null;

  return (
    <DynamicSizeContainer
      defaultSize={getChartDefaultSize('table')}
      size={{
        width,
        height: autoHeight ?? height,
      }}
    >
      {(size) => {
        if (!dataTable || !paginatedTable) {
          return <LoadingOverlay />;
        }

        if (isDataTableEmpty(dataTable)) {
          return <NoResultsOverlay iconType={'table'} />;
        }

        const pagesCount =
          rowCount !== undefined
            ? Math.max(1, Math.ceil(rowCount / rowsPerPage))
            : Math.ceil(dataTable.rows.length / rowsPerPage);

        return (
          <div
            className="csdk-table-root"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: themeSettings.chart.backgroundColor,
            }}
            data-testid="table-root"
            role="region"
            aria-label={t('chart.table.label')}
          >
            <PureTable
              dataTable={paginatedTable}
              dataOptions={updatedDataOptions}
              designOptions={designOptions}
              themeSettings={themeSettings}
              width={size.width}
              height={size.height - PAGINATION_HEIGHT}
              onSortUpdate={onSortUpdate}
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {rowCount !== undefined && (
                <span
                  data-testid="table-total-rows"
                  style={{
                    color: themeSettings.chart.secondaryTextColor,
                    fontFamily: themeSettings.typography.fontFamily,
                    fontSize: '12px',
                  }}
                >
                  {t('chart.table.totalRows', {
                    formattedCount: formatRowCount(rowCount, i18n.language),
                  })}
                </span>
              )}
              <Pagination
                ref={paginationEl}
                page={currentPage}
                count={pagesCount}
                boundaryCount={rowCount !== undefined ? PAGINATION_BOUNDARY_COUNT : undefined}
                onChange={(event, page) => onPageChange(page)}
                sx={getCustomPaginationStyles(themeSettings)}
              />
            </div>
          </div>
        );
      }}
    </DynamicSizeContainer>
  );
};
