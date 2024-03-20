import { useExecuteQueryInternal } from './use-execute-query';
import { useState, type FunctionComponent } from 'react';
import { ExecuteQueryProps } from '../props';

import { asSisenseComponent } from '../decorators/component-decorators/as-sisense-component';

/**
 * Executes a query and renders a function as child component. The child
 * component is passed the state of the query as defined in {@link QueryState}.
 *
 * This component takes the Children Prop Pattern and
 * offers an alternative approach to the {@link useExecuteQuery} hook.
 *
 * @example
 * Example of using the component to query the `Sample ECommerce` data source:
 * ```tsx
 * <ExecuteQuery
 *   dataSource={DM.DataSource}
 *   dimensions={[DM.Commerce.AgeRange]}
 *   measures={[measureFactory.sum(DM.Commerce.Revenue)]}
 *   filters={[filterFactory.greaterThan(DM.Commerce.Revenue, 1000)]}
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
 * </ExecuteQuery>
 * ```
 * @param props - ExecuteQuery properties
 * @returns ExecuteQuery component
 * @group Queries
 */
export const ExecuteQuery: FunctionComponent<ExecuteQueryProps> = asSisenseComponent({
  componentName: 'ExecuteQuery',
})(
  ({
    dataSource,
    dimensions,
    measures,
    filters,
    highlights,
    count,
    offset,
    children,
    onDataChanged,
    onBeforeQuery,
  }) => {
    const queryState = useExecuteQueryInternal({
      dataSource,
      dimensions,
      measures,
      filters,
      highlights,
      count,
      offset,
      onBeforeQuery,
    });

    const queryStateData = queryState.data;
    const [prevData, setPrevData] = useState(queryStateData);
    if (prevData !== queryStateData) {
      setPrevData(queryStateData);
      if (queryStateData) {
        onDataChanged?.(queryStateData);
      }
    }

    return <>{queryState && children?.(queryState)}</>;
  },
);
