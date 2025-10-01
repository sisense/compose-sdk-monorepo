import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Pagination from '@mui/material/Pagination';
import { isDataSource } from '@ethings-os/sdk-data';
import { TableProps } from '../props';
import { useThemeContext } from '../theme-provider';
import { translateTableDataOptions } from '../chart-data-options/translate-data-options';
import { useTableData } from './hooks/use-table-data';
import { useTableDataTable } from './hooks/use-table-datatable';
import { Column as DataTableColumn } from '../chart-data-processor/table-processor';
import { updateInnerDataOptionsSort } from '../chart-data/table-data';
import { PureTable } from '../charts/table';
import { getCustomPaginationStyles } from './styles/get-custom-pagination-styles';
import { generateUniqueDataColumnsNames } from '../chart-data-options/validate-data-options';
import { StyledMeasureColumn, TableDataOptionsInternal } from '../chart-data-options/types';
import { isDataTableEmpty } from '../chart-data-processor/table-creators';
import { NoResultsOverlay } from '../no-results-overlay/no-results-overlay';
import { DynamicSizeContainer, getChartDefaultSize } from '../dynamic-size-container';
import { LoadingIndicator } from '../common/components/loading-indicator';
import { getFilterListAndRelationsJaql } from '@ethings-os/sdk-data';
import { translateTableStyleOptionsToDesignOptions } from './translations/design-options';
import { orderBy } from '../chart-data-processor/table-processor';
import { isMeasureColumn, translateColumnToMeasure } from '@/chart-data-options/utils';
import { TranslatableError } from '@/translation/translatable-error';
import { isData } from '@/chart/regular-chart';

export const DEFAULT_TABLE_ROWS_PER_PAGE = 25;

/** How many pages of data will be loaded in one query */
export const PAGES_BATCH_SIZE = 10;

/**
 * Component that renders a table with aggregation and pagination.
 */
export const TableComponent = ({
  dataSet,
  dataOptions,
  styleOptions = {},
  filters,
  onDataReady,
}: TableProps) => {
  const { rowsPerPage = DEFAULT_TABLE_ROWS_PER_PAGE, width, height } = styleOptions;
  const { themeSettings } = useThemeContext();
  const [offset, setOffset] = useState(0);
  const { filters: filterList, relations: filterRelations } =
    getFilterListAndRelationsJaql(filters);
  const [currentPage, setCurrentPage] = useState(1);
  const paginationEl = useRef(null);

  const translatedDataOptions = useMemo(
    () => translateTableDataOptions(dataOptions),
    [dataOptions],
  );
  const dataColumnNamesMapping = useMemo(
    () =>
      generateUniqueDataColumnsNames(
        (translatedDataOptions.columns.filter(isMeasureColumn) as StyledMeasureColumn[]).map(
          translateColumnToMeasure,
        ),
      ),
    [translatedDataOptions],
  );

  const designOptions = useMemo(
    () => translateTableStyleOptionsToDesignOptions(styleOptions),
    [styleOptions],
  );

  const [innerDataOptions, setInnerDataOptions] =
    useState<TableDataOptionsInternal>(translatedDataOptions);

  const [usedDataSet, setUsedDataset] = useState(dataSet);
  const [data, updatedDataOptions] = useTableData({
    dataSet: usedDataSet,
    dataOptions: innerDataOptions,
    filters: filterList,
    filterRelations,
    count: rowsPerPage * PAGES_BATCH_SIZE,
    offset,
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
    dataColumnNamesMapping,
    needToAggregate: !isDataSource(usedDataSet),
  });

  useEffect(() => {
    setInnerDataOptions(translatedDataOptions);
    setUsedDataset(dataSet);

    setCurrentPage(1);
    setOffset(0);
  }, [dataSet, translatedDataOptions]);

  const onPageChange = useCallback(
    (page: number) => {
      if (!data) return;
      const lastPage = Math.floor(data.rows.length / rowsPerPage) === page;
      if (lastPage) {
        setOffset(data.rows.length);
      }
      setCurrentPage(page);
    },
    [data, rowsPerPage],
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

  const paginatedTable = useMemo(
    () =>
      sortedTable
        ? {
            columns: sortedTable.columns,
            rows: sortedTable.rows.slice(
              (currentPage - 1) * rowsPerPage,
              currentPage * rowsPerPage,
            ),
          }
        : undefined,
    [sortedTable, currentPage, rowsPerPage],
  );

  if (!updatedDataOptions) return null;

  return (
    <DynamicSizeContainer
      defaultSize={getChartDefaultSize('table')}
      size={{
        width,
        height,
      }}
    >
      {(size) => {
        if (!dataTable || !paginatedTable) {
          return <LoadingIndicator themeSettings={themeSettings} />;
        }

        if (isDataTableEmpty(dataTable)) {
          return <NoResultsOverlay iconType={'table'} />;
        }

        const pagesCount = Math.ceil(dataTable.rows.length / rowsPerPage);
        const paginationHeight = 32;

        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: themeSettings.chart.backgroundColor,
            }}
            aria-label="table-root"
          >
            <PureTable
              dataTable={paginatedTable}
              dataOptions={updatedDataOptions}
              designOptions={designOptions}
              themeSettings={themeSettings}
              width={size.width}
              height={size.height - paginationHeight}
              onSortUpdate={onSortUpdate}
            />
            <Pagination
              ref={paginationEl}
              page={currentPage}
              count={pagesCount}
              onChange={(event, page) => onPageChange(page)}
              sx={getCustomPaginationStyles(themeSettings)}
            />
          </div>
        );
      }}
    </DynamicSizeContainer>
  );
};
