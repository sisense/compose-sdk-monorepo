import { useMemo } from 'react';

import { Attribute, DataSource, Filter, FilterRelations, Measure } from '@sisense/sdk-data';

import { useExecuteQuery } from '@/domains/query-execution/hooks/use-execute-query';
import { ExecuteQueryParams, QueryState } from '@/domains/query-execution/types';
import {
  isMeasureColumn,
  translateColumnToAttribute,
  translateColumnToMeasure,
} from '@/domains/visualizations/core/chart-data-options/utils';
import { HookEnableParam } from '@/shared/hooks/types';
import { useAppSettings } from '@/shared/hooks/use-app-settings';
import { GenericDataOptions } from '@/types';

import { withTracking } from '../../decorators/hook-decorators';
import { formatDataSet } from '../../formatting';

/**
 * State of a query execution retrieving data of a custom widget.
 */
export type CustomWidgetQueryState = QueryState;

/**
 * Parameters for executing a query for a custom widget.
 * Contains only data-related properties needed for query execution,
 * excluding event handlers and other non-query props.
 */
export interface ExecuteCustomWidgetQueryParams
  extends HookEnableParam,
    Pick<ExecuteQueryParams, 'onBeforeQuery' | 'count' | 'offset' | 'ungroup'> {
  /** Data source for the query */
  dataSource?: DataSource;
  /** Data options defining dimensions and measures */
  dataOptions: GenericDataOptions;
  /** Filters to apply to the query */
  filters?: Filter[] | FilterRelations;
  /** Highlight filters */
  highlights?: Filter[];
}

/**
 * Utility function for converting data options to parameters for executing a query.
 *
 * @example
 * ```ts
 * import { extractDimensionsAndMeasures } from '@sisense/sdk-ui';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * const { dimensions, measures } = extractDimensionsAndMeasures({
 *   category: [DM.Commerce.Condition],
 *   value: [measureFactory.sum(DM.Commerce.Revenue)],
 * });
 * ```
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
  const appSettings = useAppSettings();
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

    return formatDataSet(rawData, dataOptions, appSettings);
  }, [rawData, dataOptions, appSettings]);

  return { data, isLoading, isError, isSuccess, status, error } as CustomWidgetQueryState;
}

/**
 * React hook that takes a custom widget component's props and executes a data query.
 *
 * @example
 * Used inside a {@link CustomWidgetComponent} to fetch the data it needs to render, based on
 * the `dataSource`/`dataOptions`/`filters` props supplied by the dashboard:
 *
 * ```tsx
 * import { CustomWidgetComponent, useExecuteCustomWidgetQuery } from '@sisense/sdk-ui';
 *
 * const MyTableWidget: CustomWidgetComponent = (props) => {
 *   const { data } = useExecuteCustomWidgetQuery(props);
 *   if (!data) return null;
 *
 *   return (
 *     <table>
 *       <thead>
 *         <tr>
 *           {data.columns.map((column, i) => (
 *             <th key={i}>{column.name}</th>
 *           ))}
 *         </tr>
 *       </thead>
 *       <tbody>
 *         {data.rows.map((row, i) => (
 *           <tr key={i}>
 *             {row.map((cell, j) => (
 *               <td key={j}>{cell.text}</td>
 *             ))}
 *           </tr>
 *         ))}
 *       </tbody>
 *     </table>
 *   );
 * };
 *
 * export default MyTableWidget;
 * ```
 *
 * @group Queries
 */
export const useExecuteCustomWidgetQuery = withTracking('useExecuteCustomWidgetQuery')(
  useExecuteCustomWidgetQueryInternal,
);
