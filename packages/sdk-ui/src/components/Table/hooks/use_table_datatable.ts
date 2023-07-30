import { useMemo } from 'react';
import { createDataTableFromData } from '../../../chart-data-processor/table_creators';
import { filterAndAggregateChartData } from '../../../chart-data/filter_and_aggregate_chart_data';
import { Data } from '@sisense/sdk-data';
import { tableData } from '../../../chart-data/table_data';
import {
  Category,
  isCategory,
  isValue,
  TableDataOptionsInternal,
  Value,
} from '../../../chart-data-options/types';
import { DataColumnNamesMapping } from '../../../chart-data-options/validate_data_options';

type UseTableDataTableProps = {
  data: null | Data;
  innerDataOptions: TableDataOptionsInternal | null;
  dataColumnNamesMapping: DataColumnNamesMapping;
  needToAggregate?: boolean;
};

export const useTableDataTable = ({
  data,
  innerDataOptions,
  dataColumnNamesMapping,
  needToAggregate = false,
}: UseTableDataTableProps) => {
  return useMemo(() => {
    if (!data || !innerDataOptions) return null;

    let table = createDataTableFromData(data);

    if (needToAggregate) {
      table = filterAndAggregateChartData(
        table,
        innerDataOptions.columns.filter((c) => isCategory(c)) as Category[],
        innerDataOptions.columns.filter((c) => isValue(c)) as Value[],
        dataColumnNamesMapping,
      );
    }

    return tableData(innerDataOptions, table);
  }, [data, innerDataOptions, needToAggregate, dataColumnNamesMapping]);
};
