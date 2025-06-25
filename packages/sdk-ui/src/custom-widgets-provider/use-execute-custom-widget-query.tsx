import { Attribute, Cell, Measure, QueryResultData } from '@sisense/sdk-data';
import { useExecuteQuery } from '@/query-execution/use-execute-query';
import { GenericDataOptions, NumberFormatConfig } from '@/types';
import { CustomWidgetComponentProps } from './types';
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
import { withTracking } from '../decorators/hook-decorators';
import { ExecuteQueryParams, QueryState } from '../query-execution/types';
import { HookEnableParam } from '@/common/hooks/types';

/**
 * State of a query execution retrieving data of a custom widget.
 */
export type CustomWidgetQueryState = QueryState;

/**
 * Parameters for executing a query for a custom widget.
 */
export interface ExecuteCustomWidgetQueryParams
  extends CustomWidgetComponentProps,
    HookEnableParam,
    Pick<ExecuteQueryParams, 'onBeforeQuery' | 'count' | 'offset' | 'ungroup'> {}

/**
 * Utility function for converting data options to parameters for executing a query.
 *
 * @group Dashboards
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
 * {@link useExecuteCustomWidgetQuery} without tracking to be used inside other hooks or components in Compose SDK.
 *
 * @internal
 */
export function useExecuteCustomWidgetQueryInternal({
  dataSource,
  dataOptions,
  filters,
  highlights,
  count,
  offset,
  ungroup,
  onBeforeQuery,
}: ExecuteCustomWidgetQueryParams): CustomWidgetQueryState {
  const { dimensions, measures } = extractDimensionsAndMeasures(dataOptions);
  const {
    data: rawData,
    isLoading,
    isError,
    isSuccess,
    status,
    error,
  } = useExecuteQuery({
    dataSource,
    dimensions,
    measures,
    filters,
    highlights,
    count,
    offset,
    ungroup,
    onBeforeQuery,
  });

  const data = useMemo(() => {
    if (!rawData) {
      return rawData;
    }

    return applyNumberFormat(rawData, dataOptions);
  }, [rawData, dataOptions]);

  return { data, isLoading, isError, isSuccess, status, error } as CustomWidgetQueryState;
}

/**
 * React hook that takes a custom widget component's props and executes a data query.
 *
 * @group Queries
 */
export const useExecuteCustomWidgetQuery = withTracking('useExecuteCustomWidgetQuery')(
  useExecuteCustomWidgetQueryInternal,
);
