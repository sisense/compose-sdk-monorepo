/* eslint-disable max-lines-per-function */
import { TableProps } from '../../props';
import { ErrorBoundary } from '../ErrorBoundary/ErrorBoundary';
import { useThemeContext } from '../ThemeProvider';
import React, { useEffect, useRef, useState } from 'react';
import { translateTableDataOptions } from '../../chart-data-options/translate_data_options';
import { useTableData } from './hooks/use_table_data';
import { useTableDataTable } from './hooks/use_table_datatable';
import { Column as DataTableColumn } from '../../chart-data-processor/table_processor';
import { updateInnerDataOptionsSort } from '../../chart-data/table_data';
import { PureTable, TableDesignOptions } from '../../charts/table';
import { Pagination } from '@mui/material';
import { getCustomPaginationStyles } from './styles/get_custom_pagination_styles';
import { generateUniqueDataColumnsNames } from '../../chart-data-options/validate_data_options';
import { isValue, TableDataOptionsInternal } from '../../chart-data-options/types';
import { isDataSource } from '@sisense/sdk-data';
import { TrackingContextProvider, useTrackComponentInit } from '../../useTrackComponentInit';

export const UnwrappedTable = ({
  dataSet,
  dataOptions,
  styleOptions = {},
  filters,
}: TableProps) => {
  const { rowsPerPage = 25, width = 400, height = 500 } = styleOptions;
  const pagesCountLoadingStep = 10;
  const { themeSettings } = useThemeContext();
  const [innerDataOptions, setInnerDataOptions] = useState<TableDataOptionsInternal | null>(null);
  const [dataColumnNamesMapping, setDataColumnNamesMapping] = useState({});
  const [offset, setOffset] = useState(0);
  const data = useTableData({
    dataSet,
    dataOptions: innerDataOptions,
    filters,
    count: rowsPerPage * pagesCountLoadingStep,
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
  }, [dataOptions]);

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

  if (!dataTable || !innerDataOptions) return null;

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
    >
      <PureTable
        dataTable={paginatedTable}
        dataOptions={innerDataOptions}
        designOptions={styleOptions as TableDesignOptions}
        themeSettings={themeSettings}
        width={width}
        height={height - paginationHeight}
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
};

/**
 * Table with aggregation and pagination.
 *
 * @example
 * Example of Table of data from the `Sample ECommerce` data model:
 *
 * ```tsx
 * <Table
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     columns: [
 *       DM.Commerce.AgeRange,
 *       DM.Commerce.Revenue,
 *       DM.Commerce.Cost,
 *       DM.Commerce.Quantity,
 *     ],
 *   }}
 *   styleOptions={{ width: 600, height: 750 }}
 * />
 * ```
 * ###
 * <img src="media://table-chart-example-1.png" width="800px" />
 * @param props - Table properties
 * @returns Table component
 */
export const Table = (props: TableProps) => {
  useTrackComponentInit('Table', props);

  return (
    <TrackingContextProvider>
      <ErrorBoundary>
        <UnwrappedTable {...props} />
      </ErrorBoundary>
    </TrackingContextProvider>
  );
};
