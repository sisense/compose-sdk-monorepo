import { useExecuteQuery } from './use-execute-query';
import { useState, type FunctionComponent } from 'react';
import { ExecuteQueryProps } from '../props';

import { asSisenseComponent } from '../decorators/as-sisense-component';

/**
 * Executes a query and renders a function as child component. The child
 * component is passed the results of the query.
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
 *   measures={[measures.sum(DM.Commerce.Revenue)]}
 *   filters={[filters.greaterThan(DM.Commerce.Revenue, 1000)]}
 * >
 * {
 *   (data) => {
 *     if (data) {
 *       console.log(data);
 *       return <div>{`Total Rows: ${data.rows.length}`}</div>;
 *     }
 *   }
 * }
 * </ExecuteQuery>
 * ```
 * @param props - ExecuteQuery properties
 * @returns ExecuteQuery component
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
    const { data, error } = useExecuteQuery({
      dataSource,
      dimensions,
      measures,
      filters,
      highlights,
      count,
      offset,
      onBeforeQuery,
    });

    // TODO: discuss if we need API like 'onDataChanged' for this component as we providing 'useExecuteQuery' hook
    const [prevData, setPrevData] = useState(data);
    if (prevData !== data) {
      setPrevData(data);
      if (data) {
        onDataChanged?.(data);
      }
    }

    if (error) {
      throw error;
    }

    return <>{data && children?.(data)}</>;
  },
);
