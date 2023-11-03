import React, { useState, type FunctionComponent } from 'react';
import { ExecuteQueryByWidgetIdProps } from '../props';
import { asSisenseComponent } from '../decorators/as-sisense-component';
import { useExecuteQueryByWidgetId } from './use-execute-query-by-widget-id';

/**
 * Executes a query over the existing widget and renders a function as child component.
 * The child component is passed the results of the query.
 *
 * This component takes the Children Prop Pattern and
 * offers an alternative approach to the {@link useExecuteQueryByWidgetId} hook.
 *
 * @example
 * The example below executes a query over the existing dashboard widget with the specified widget and dashboard OIDs.
 * ```tsx
 * <ExecuteQueryByWidgetId
 *   widgetOid={'64473e07dac1920034bce77f'}
 *   dashboardOid={'6441e728dac1920034bce737'}
 * >
 * {
 *   (data, query) => {
 *     if (data) {
 *       return <div>{`Total Rows: ${data.rows.length}`}</div>;
 *     }
 *   }
 * }
 * </ExecuteQueryByWidgetId>
 * ```
 * @param props - ExecuteQueryByWidgetId properties
 * @returns ExecuteQueryByWidgetId component
 */
export const ExecuteQueryByWidgetId: FunctionComponent<ExecuteQueryByWidgetIdProps> =
  asSisenseComponent({
    componentName: 'ExecuteQueryByWidgetId',
  })(
    ({
      widgetOid,
      dashboardOid,
      children,
      onDataChanged,
      filters,
      highlights,
      count,
      offset,
      filtersMergeStrategy,
      onBeforeQuery,
    }) => {
      const { data, query, error } = useExecuteQueryByWidgetId({
        widgetOid,
        dashboardOid,
        filters,
        highlights,
        count,
        offset,
        filtersMergeStrategy,
        onBeforeQuery,
      });

      const [prevData, setPrevData] = useState(data);
      if (prevData !== data) {
        setPrevData(data);
        if (data && query) {
          onDataChanged?.(data, query);
        }
      }

      if (error) {
        throw error;
      }

      return <>{data && query && children?.(data, query)}</>;
    },
  );
