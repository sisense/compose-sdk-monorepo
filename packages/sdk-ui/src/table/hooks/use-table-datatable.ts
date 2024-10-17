import { useMemo } from 'react';
import { createDataTableFromData } from '../../chart-data-processor/table-creators';
import { filterAndAggregateChartData } from '../../chart-data/filter-and-aggregate-chart-data';
import { Data } from '@sisense/sdk-data';
import { tableData } from '../../chart-data/table-data';
import {
  StyledColumn,
  StyledMeasureColumn,
  TableDataOptionsInternal,
} from '../../chart-data-options/types';
import {
  DataColumnNamesMapping,
  validateDataOptionsAgainstData,
} from '../../chart-data-options/validate-data-options';
import { applyDateFormats } from '../../query/query-result-date-formatting';
import { useSisenseContext } from '../../sisense-context/sisense-context';
import {
  isMeasureColumn,
  translateColumnToAttribute,
  translateColumnToMeasure,
} from '@/chart-data-options/utils';

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
  const { app } = useSisenseContext();
  return useMemo(() => {
    if (!data || !innerDataOptions) return null;

    let table = createDataTableFromData(
      applyDateFormats(data, innerDataOptions, app?.settings.locale, app?.settings.dateConfig),
    );
    const attributes = (
      innerDataOptions.columns.filter((c) => !isMeasureColumn(c)) as StyledColumn[]
    ).map(translateColumnToAttribute);
    const measures = (
      innerDataOptions.columns.filter((c) => isMeasureColumn(c)) as StyledMeasureColumn[]
    ).map(translateColumnToMeasure);

    validateDataOptionsAgainstData(table, attributes, measures, dataColumnNamesMapping);

    if (needToAggregate) {
      table = filterAndAggregateChartData(table, attributes, measures, dataColumnNamesMapping);
    }

    return tableData(innerDataOptions, table);
  }, [data, innerDataOptions, needToAggregate, dataColumnNamesMapping, app]);
};
