import { type FunctionComponent } from 'react';

import { asSisenseComponent } from '../../../infra/decorators/component-decorators/as-sisense-component';
import { ExecuteQueryProps } from '../../../props';
import { usePrevious } from '../../../shared/hooks/use-previous';
import { useExecuteQueryInternal } from '../hooks/use-execute-query';

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
    ungroup,
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
      ungroup,
      onBeforeQuery,
    });

    const queryStateData = queryState.data;
    const prevData = usePrevious(queryStateData);
    if (queryStateData && prevData !== queryStateData) {
      onDataChanged?.(queryStateData);
    }

    return <>{queryState && children?.(queryState)}</>;
  },
);
