import { useMemo } from 'react';
import { createDataTableFromData } from '../../chart-data-processor/table-creators';
import { filterAndAggregateChartData } from '../../chart-data/filter-and-aggregate-chart-data';
import { Attribute, Data, Measure } from '@sisense/sdk-data';
import { tableData } from '../../chart-data/table-data';
import {
  Category,
  isCategory,
  isValue,
  TableDataOptionsInternal,
  Value,
} from '../../chart-data-options/types';
import {
  DataColumnNamesMapping,
  validateDataOptionsAgainstData,
} from '../../chart-data-options/validate-data-options';

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
    const attributes = innerDataOptions.columns.filter((c) => isCategory(c));
    const measures = innerDataOptions.columns.filter((c) => isValue(c));

    validateDataOptionsAgainstData(
      table,
      attributes as Attribute[],
      measures as Measure[],
      dataColumnNamesMapping,
    );

    if (needToAggregate) {
      table = filterAndAggregateChartData(
        table,
        attributes as Category[],
        measures as Value[],
        dataColumnNamesMapping,
      );
    }

    return tableData(innerDataOptions, table);
  }, [data, innerDataOptions, needToAggregate, dataColumnNamesMapping]);
};
