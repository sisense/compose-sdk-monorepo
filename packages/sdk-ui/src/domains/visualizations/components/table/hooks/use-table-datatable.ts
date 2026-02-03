import { useMemo } from 'react';

import { Data } from '@sisense/sdk-data';

import {
  isMeasureColumn,
  translateColumnToAttribute,
  translateColumnToMeasure,
} from '@/domains/visualizations/core/chart-data-options/utils';

import { useSisenseContext } from '../../../../../infra/contexts/sisense-context/sisense-context';
import { applyDateFormats } from '../../../../query-execution/core/query-result-date-formatting';
import {
  StyledColumn,
  StyledMeasureColumn,
  TableDataOptionsInternal,
} from '../../../core/chart-data-options/types';
import {
  DataColumnNamesMapping,
  validateDataOptionsAgainstData,
} from '../../../core/chart-data-options/validate-data-options';
import { createDataTableFromData } from '../../../core/chart-data-processor/table-creators';
import { filterAndAggregateChartData } from '../../../core/chart-data/filter-and-aggregate-chart-data';
import { tableData } from '../../../core/chart-data/table-data';

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
