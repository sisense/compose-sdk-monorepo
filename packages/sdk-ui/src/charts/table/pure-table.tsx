import React, { useRef, useLayoutEffect, useMemo } from 'react';
import { DataTableWrapper } from './data-table-wrapper';
import styles from './styles/table-chart.module.scss';
import { TableProps } from './types';
import { TableDesignOptions } from '../../chart-options-processor/translations/design-options';
import { orderBy } from '../../chart-data-processor/table-processor';
import { formatNumbers } from './helpers/format-numbers';

/**
 * PureTable Component. Table without any data fetch or aggregation logic.
 *
 * @returns Pure Table component
 */
export const PureTable = ({
  dataTable,
  dataOptions,
  designOptions = {} as TableDesignOptions,
  onSortUpdate,
  themeSettings,
  width = 400,
  height = 500,
}: TableProps) => {
  const listRef = useRef<HTMLDivElement>(null);
  const loadedTable = useRef(dataTable);

  const sortedAndFormattedTable = useMemo(() => {
    let table = dataTable;

    const columnWithSorting = dataTable.columns.find((c) => c.direction !== 0);
    if (columnWithSorting) {
      table = orderBy(dataTable, [columnWithSorting]);
    }

    return formatNumbers(table, dataOptions);
  }, [dataTable, dataOptions]);

  useLayoutEffect(() => {
    loadedTable.current = dataTable;
  }, [dataTable]);

  const isLoading = dataTable !== loadedTable.current;

  return (
    <div className={styles.component} ref={listRef}>
      <DataTableWrapper
        dataTable={sortedAndFormattedTable}
        dataOptions={dataOptions}
        isLoading={isLoading}
        onSortUpdate={onSortUpdate}
        height={height}
        width={width}
        customStyles={{
          sortIcon: 'caret',
          showFieldTypeIcon: false,
          ...designOptions,
        }}
        themeSettings={themeSettings}
      />
    </div>
  );
};
