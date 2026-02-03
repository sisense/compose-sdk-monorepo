import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Pagination from '@mui/material/Pagination';
import { isDataSource } from '@sisense/sdk-data';
import { getFilterListAndRelationsJaql } from '@sisense/sdk-data';

import { isData } from '@/domains/visualizations/components/chart/components/regular-chart';
import {
  isMeasureColumn,
  translateColumnToMeasure,
} from '@/domains/visualizations/core/chart-data-options/utils';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import { TranslatableError } from '@/infra/translation/translatable-error';
import {
  DynamicSizeContainer,
  getChartDefaultSize,
} from '@/shared/components/dynamic-size-container';
import { LoadingOverlay } from '@/shared/components/loading-overlay';
import { NoResultsOverlay } from '@/shared/components/no-results-overlay/no-results-overlay';

import { TableProps } from '../../../../props';
import { translateTableDataOptions } from '../../core/chart-data-options/translate-data-options';
import { StyledMeasureColumn, TableDataOptionsInternal } from '../../core/chart-data-options/types';
import { generateUniqueDataColumnsNames } from '../../core/chart-data-options/validate-data-options';
import { isDataTableEmpty } from '../../core/chart-data-processor/table-creators';
import { Column as DataTableColumn } from '../../core/chart-data-processor/table-processor';
import { orderBy } from '../../core/chart-data-processor/table-processor';
import { updateInnerDataOptionsSort } from '../../core/chart-data/table-data';
import { useTableData } from './hooks/use-table-data';
import { useTableDataTable } from './hooks/use-table-datatable';
import { PureTable } from './pure-table';
import { getCustomPaginationStyles } from './styles/get-custom-pagination-styles';
import { translateTableStyleOptionsToDesignOptions } from './translations/design-options';

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
          return <LoadingOverlay />;
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
