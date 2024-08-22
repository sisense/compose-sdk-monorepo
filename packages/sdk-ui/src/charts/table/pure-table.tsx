import { useRef, useLayoutEffect, useMemo } from 'react';
import { DataTableWrapper } from './data-table-wrapper';
import styles from './styles/table-chart.module.scss';
import { TableProps } from './types';
import { TableDesignOptions } from '../../chart-options-processor/translations/design-options';
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

  const formattedTable = useMemo(
    () => formatNumbers(dataTable, dataOptions),
    [dataTable, dataOptions],
  );

  useLayoutEffect(() => {
    loadedTable.current = dataTable;
  }, [dataTable]);

  const customStyles = useMemo(
    () => ({
      sortIcon: 'caret' as const,
      showFieldTypeIcon: false,
      ...designOptions,
    }),
    [designOptions],
  );

  return (
    <div className={styles.component} ref={listRef}>
      <DataTableWrapper
        dataTable={formattedTable}
        dataOptions={dataOptions}
        onSortUpdate={onSortUpdate}
        height={height}
        width={width}
        customStyles={customStyles}
        themeSettings={themeSettings}
      />
    </div>
  );
};
