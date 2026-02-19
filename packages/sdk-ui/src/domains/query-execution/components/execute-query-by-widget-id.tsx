import React, { type FunctionComponent, useState } from 'react';

import { asSisenseComponent } from '../../../infra/decorators/component-decorators/as-sisense-component';
import { ExecuteQueryByWidgetIdProps } from '../../../props';
import { useExecuteQueryByWidgetIdInternal } from '../hooks/use-execute-query-by-widget-id/use-execute-query-by-widget-id';

/**
 * Executes a query over the existing widget and renders a function as child component.
 * The child component is passed the state of the query as defined in {@link QueryByWidgetIdState}.
 *
 * This component takes the Children Prop Pattern and
 * offers an alternative approach to the {@link useExecuteQueryByWidgetId} hook.
 *
 * **Note:** Widget extensions based on JS scripts and add-ons in Fusion are not supported.
 *
 * @example
 * The example below executes a query over the existing dashboard widget with the specified widget and dashboard OIDs.
 * ```tsx
 * <ExecuteQueryByWidgetId
 *   widgetOid={'64473e07dac1920034bce77f'}
 *   dashboardOid={'6441e728dac1920034bce737'}
 * >
 * {
 *   ({data, isLoading, isError}) => {
 *     if (isLoading) {
 *       return <div>Loading...</div>;
 *     }
 *     if (isError) {
 *       return <div>Error</div>;
 *     }
 *     if (data) {
 *       console.log(data);
 *       return <div>{`Total Rows: ${data.rows.length}`}</div>;
 *     }
 *     return null;
 *   }
 * }
 * </ExecuteQueryByWidgetId>
 * ```
 * @param props - ExecuteQueryByWidgetId properties
 * @returns ExecuteQueryByWidgetId component
 * @group Fusion Assets
 * @fusionEmbed
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
      includeDashboardFilters,
    }) => {
      const queryState = useExecuteQueryByWidgetIdInternal({
        widgetOid,
        dashboardOid,
        filters,
        highlights,
        count,
        offset,
        filtersMergeStrategy,
        onBeforeQuery,
        includeDashboardFilters,
      });

      const { data, query } = queryState;

      const [prevData, setPrevData] = useState(data);
      if (prevData !== data) {
        setPrevData(data);
        if (data && query) {
          onDataChanged?.(data, query);
        }
      }

      return <>{queryState && children?.(queryState)}</>;
    },
  );
