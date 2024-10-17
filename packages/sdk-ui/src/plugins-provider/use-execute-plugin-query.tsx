import { Attribute, Cell, Measure, QueryResultData } from '@sisense/sdk-data';
import { useExecuteQuery } from '@/query-execution/use-execute-query';
import { GenericDataOptions, NumberFormatConfig } from '@/types';
import { PluginComponentProps } from './types';
import { useMemo } from 'react';
import {
  isMeasureColumn,
  translateColumnToAttribute,
  translateColumnToMeasure,
} from '@/chart-data-options/utils';
import {
  applyFormatPlainText,
  getCompleteNumberFormatConfig,
} from '@/chart-options-processor/translations/number-format-config';

/**
 * Utility function for converting data options to parameters for executing a query.
 *
 * @group Dashboards
 * @alpha
 */
export function extractDimensionsAndMeasures(dataOptions: GenericDataOptions) {
  const dimensions: Attribute[] = [];
  const measures: Measure[] = [];

  Object.keys(dataOptions).forEach((key) => {
    if (!dataOptions[key].length) {
      return;
    }

    dataOptions[key].forEach((c) => {
      if (isMeasureColumn(c)) {
        measures.push(translateColumnToMeasure(c));
      } else {
        dimensions.push(translateColumnToAttribute(c));
      }
    });
  });

  return {
    dimensions,
    measures,
  };
}

type ColumnKey = string;
type NumberFormatMap = Map<ColumnKey, NumberFormatConfig>;
function makeNumberFormatMap(dataOptions: GenericDataOptions): NumberFormatMap {
  return Object.values(dataOptions).reduce((acc, categories) => {
    categories.forEach((cat) => {
      if (cat.numberFormatConfig) {
        acc.set(cat.column.name, cat.numberFormatConfig);
      }
    });
    return acc;
  }, new Map<ColumnKey, NumberFormatConfig>());
}

function applyNumberFormat(
  data: QueryResultData,
  dataOptions: GenericDataOptions,
): QueryResultData {
  const numberFormatMap: NumberFormatMap = makeNumberFormatMap(dataOptions);

  data.rows = data.rows.map((row) =>
    row.map((cell, columnIndex): Cell => {
      const numberFormat = numberFormatMap.get(data.columns[columnIndex].name);
      if (numberFormat) {
        return {
          ...cell,
          text: applyFormatPlainText(getCompleteNumberFormatConfig(numberFormat), cell.data),
        };
      }
      return cell;
    }),
  );
  return data;
}

/**
 * React hook that takes a plugin component's props and executes a data query.
 *
 * @group Dashboards
 * @alpha
 */
export function useExecutePluginQuery({
  dataSource,
  dataOptions,
  filters,
  highlights,
}: PluginComponentProps) {
  const { dimensions, measures } = extractDimensionsAndMeasures(dataOptions);
  const {
    data: rawData,
    isLoading,
    isError,
  } = useExecuteQuery({
    dataSource,
    dimensions,
    measures,
    filters,
    highlights,
  });

  const data = useMemo(() => {
    if (!rawData) {
      return rawData;
    }

    return applyNumberFormat(rawData, dataOptions);
  }, [rawData, dataOptions]);

  return { data, isLoading, isError };
}
