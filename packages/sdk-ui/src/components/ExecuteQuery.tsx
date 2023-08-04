/* eslint-disable react-hooks/exhaustive-deps */
import { QueryResultData } from '@sisense/sdk-data';
import React, { useEffect, useState, type FunctionComponent } from 'react';
import { ExecuteQueryProps } from '../props';
import { executeQuery } from '../query/execute-query';
import { useSisenseContext } from './SisenseContextProvider';
import { ErrorBoundary } from './ErrorBoundary/ErrorBoundary';
import { translation } from '../locales/en';
import { TrackingContextProvider, useTrackComponentInit } from '../useTrackComponentInit';

/**
 * @internal
 */
export const UnwrappedExecuteQuery: FunctionComponent<ExecuteQueryProps> = ({
  dataSource,
  dimensions,
  measures,
  filters,
  highlights,
  children,
  onDataChanged,
}) => {
  const [data, setData] = useState<QueryResultData | undefined>();
  const { isInitialized, app } = useSisenseContext();

  const [error, setError] = useState<Error>();
  if (error) {
    throw error;
  }

  useEffect(() => {
    if (!isInitialized) {
      setError(new Error(translation.errors.executeQueryNoSisenseContext));
    }

    if (!app) {
      return;
    }

    void executeQuery(dataSource, dimensions, measures, filters, highlights, app)
      .then((d) => {
        onDataChanged?.(d);
        setData(d);
      })
      .catch((asyncError: Error) => {
        // set error state to trigger rerender and throw synchronous error
        setError(asyncError);
      });
  }, [dataSource, dimensions, measures, filters, highlights, app]);

  return <>{data && children?.(data)}</>;
};

/**
 * Executes a query and renders a function as child component. The child
 * component is passed the results of the query.
 *
 * @example
 * Example of using the component to query the `Sample ECommerce` data source:
 * ```tsx
 * <ExecuteQuery
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
export const ExecuteQuery: FunctionComponent<ExecuteQueryProps> = (props) => {
  const displayName = 'ExecuteQuery';
  useTrackComponentInit(displayName, props);

  return (
    <TrackingContextProvider>
      <ErrorBoundary componentName={displayName}>
        <UnwrappedExecuteQuery {...props} />
      </ErrorBoundary>
    </TrackingContextProvider>
  );
};
