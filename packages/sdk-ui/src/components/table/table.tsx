/* eslint-disable max-lines-per-function */
import React, { useEffect, useRef, useState } from 'react';
import { Pagination } from '@mui/material';
import { isDataSource } from '@sisense/sdk-data';
import { TableProps } from '../../props';
import { useThemeContext } from '../theme-provider';
import { translateTableDataOptions } from '../../chart-data-options/translate-data-options';
import { useTableData } from './hooks/use-table-data';
import { useTableDataTable } from './hooks/use-table-datatable';
import { Column as DataTableColumn } from '../../chart-data-processor/table-processor';
import { updateInnerDataOptionsSort } from '../../chart-data/table-data';
import { PureTable, TableDesignOptions } from '../../charts/table';
import { getCustomPaginationStyles } from './styles/get-custom-pagination-styles';
import { generateUniqueDataColumnsNames } from '../../chart-data-options/validate-data-options';
import { isValue, TableDataOptionsInternal } from '../../chart-data-options/types';
import { isDataTableEmpty } from '../../chart-data-processor/table-creators';
import { NoResultsOverlay } from '../no-results-overlay/no-results-overlay';
import { asSisenseComponent } from '../decorators/as-sisense-component';
import { shouldSkipSisenseContextWaiting } from '../chart';
import { DynamicSizeContainer, getChartDefaultSize } from '../dynamic-size-container';

/**
 * Table with aggregation and pagination.
 *
 * @example
 * (1) Example of Table of raw data from the `Sample ECommerce` data model:
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
 * <img src="media://table-example-1.png" width="800px" />
 *
 * (2) Example of Table of aggregated data from the same data model:
 *
 * ```tsx
 * <Table
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     columns: [
 *       DM.Commerce.AgeRange,
 *       measures.sum(DM.Commerce.Revenue, 'Total Revenue'),
 *       measures.sum(DM.Commerce.Cost, 'Total Cost'),
 *     ],
 *   }}
 *   styleOptions={{
 *     headersColor: true,
 *     alternatingColumnsColor: false,
 *     alternatingRowsColor: true,
 *   }}
 * />
 * ```
 * ###
 * <img src="media://table-example-2.png" width="800px" />
 * @param props - Table properties
 * @returns Table component
 */

export const Table = asSisenseComponent({
  componentName: 'Table',
  shouldSkipSisenseContextWaiting,
})(({ dataSet, dataOptions, styleOptions = {}, filters }: TableProps) => {
  const { rowsPerPage = 25, width, height } = styleOptions;
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
    <DynamicSizeContainer
      defaultSize={getChartDefaultSize('table')}
      size={{
        width,
        height,
      }}
    >
      {(size) => {
        if (isDataTableEmpty(dataTable)) {
          return <NoResultsOverlay iconType={'table'} />;
        }

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
              designOptions={styleOptions as TableDesignOptions}
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
});
