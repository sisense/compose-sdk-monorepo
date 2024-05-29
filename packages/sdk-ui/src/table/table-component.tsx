import { useEffect, useRef, useState } from 'react';
import Pagination from '@mui/material/Pagination';
import { isDataSource } from '@sisense/sdk-data';
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
import { isValue, TableDataOptionsInternal } from '../chart-data-options/types';
import { isDataTableEmpty } from '../chart-data-processor/table-creators';
import { NoResultsOverlay } from '../no-results-overlay/no-results-overlay';
import { DynamicSizeContainer, getChartDefaultSize } from '../dynamic-size-container';
import { LoadingIndicator } from '../common/components/loading-indicator';
import { getFilterListAndRelations } from '@sisense/sdk-data';
import { translateTableStyleOptionsToDesignOptions } from './translations/design-options';

/**
 * Component that renders a table with aggregation and pagination.
 */
export const TableComponent = ({
  dataSet,
  dataOptions,
  styleOptions = {},
  filters,
  refreshCounter,
}: TableProps) => {
  const { rowsPerPage = DEFAULT_TABLE_ROWS_PER_PAGE, width, height } = styleOptions;
  const { themeSettings } = useThemeContext();
  const [innerDataOptions, setInnerDataOptions] = useState<TableDataOptionsInternal | null>(null);
  const [dataColumnNamesMapping, setDataColumnNamesMapping] = useState({});
  const [offset, setOffset] = useState(0);
  const { filters: filterList, relations: filterRelations } = getFilterListAndRelations(filters);
  const data = useTableData({
    dataSet,
    dataOptions: innerDataOptions,
    filters: filterList,
    filterRelations,
    count: rowsPerPage * PAGES_BATCH_SIZE,
    offset,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const paginationEl = useRef(null);

  const dataTable = useTableDataTable({
    data,
    innerDataOptions,
    dataColumnNamesMapping,
    needToAggregate: dataSet !== undefined && !isDataSource(dataSet),
  });

  useEffect(() => {
    const translatedDataOptions = translateTableDataOptions(dataOptions);
    setDataColumnNamesMapping(
      generateUniqueDataColumnsNames(translatedDataOptions.columns.filter(isValue)),
    );
    setInnerDataOptions(translatedDataOptions);

    setOffset(0);
  }, [dataOptions, refreshCounter]);

  const onPageChange = (page: number) => {
    if (!data) return;
    const lastPage = Math.floor(data.rows.length / rowsPerPage) === page;
    if (lastPage) {
      setOffset(data.rows.length);
    }
    setCurrentPage(page);
  };

  const onSortUpdate = (column: DataTableColumn) => {
    setCurrentPage(1);
    setOffset(0);
    if (innerDataOptions) {
      setInnerDataOptions(updateInnerDataOptionsSort(innerDataOptions, column));
    }
  };

  if (!innerDataOptions) return null;

  return (
    <DynamicSizeContainer
      defaultSize={getChartDefaultSize('table')}
      size={{
        width,
        height,
      }}
    >
      {(size) => {
        if (!dataTable) {
          return <LoadingIndicator themeSettings={themeSettings} />;
        }

        if (isDataTableEmpty(dataTable)) {
          return <NoResultsOverlay iconType={'table'} />;
        }

        const paginatedTable = {
          columns: dataTable.columns,
          rows: dataTable.rows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage),
        };
        const pagesCount = Math.ceil(dataTable.rows.length / rowsPerPage);
        const paginationHeight = pagesCount > 1 ? 32 : 0;

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
              dataOptions={innerDataOptions}
              designOptions={translateTableStyleOptionsToDesignOptions(styleOptions)}
              themeSettings={themeSettings}
              width={size.width}
              height={size.height - paginationHeight}
              onSortUpdate={onSortUpdate}
            />
            {pagesCount > 1 && (
              <Pagination
                ref={paginationEl}
                page={currentPage}
                count={pagesCount}
                onChange={(event, page) => onPageChange(page)}
                sx={getCustomPaginationStyles(themeSettings)}
              />
            )}
          </div>
        );
      }}
    </DynamicSizeContainer>
  );
};

export const DEFAULT_TABLE_ROWS_PER_PAGE = 25 as const;

/** How many pages of data will be loaded in one query */
export const PAGES_BATCH_SIZE = 10;
