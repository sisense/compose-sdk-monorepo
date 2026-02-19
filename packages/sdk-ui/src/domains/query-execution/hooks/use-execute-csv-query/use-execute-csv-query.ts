import { useEffect, useReducer } from 'react';

import { getFilterListAndRelationsJaql } from '@sisense/sdk-data';

import { useQueryParamsChanged } from '@/domains/query-execution/hooks/shared/query-params-comparator.js';

import { useSisenseContext } from '../../../../infra/contexts/sisense-context/sisense-context.js';
import { withTracking } from '../../../../infra/decorators/hook-decorators/index.js';
import { TranslatableError } from '../../../../infra/translation/translatable-error.js';
import { useShouldLoad } from '../../../../shared/hooks/use-should-load.js';
import { executeCsvQuery } from '../../core/execute-query.js';
import { CsvQueryState, ExecuteCsvQueryParams } from '../../types.js';
import { downloadCsvQueryStateReducer } from './csv-query-state-reducer.js';

/**
 * React hook that executes a CSV data query.
 * Similar to {@link useExecuteQuery}, but returns the data in CSV format as text or as a stream.
 *
 * @example
 * An example of using the hook to obtain data in a CSV string:
 ```tsx
 const { data, isLoading, isError } = useExecuteCsvQuery({
   dataSource: DM.DataSource,
   dimensions: [DM.Commerce.AgeRange],
   measures: [measureFactory.sum(DM.Commerce.Revenue)],
   filters: [filterFactory.greaterThan(DM.Commerce.Revenue, 1000)],
 });
 if (isLoading) {
   return <div>Loading...</div>;
 }
 if (isError) {
   return <div>Error</div>;
 }
 if (data) {
   return <div>{`CSV as string: ${data}`}</div>;
 }
 return null;
 ```
 * An example of using the hook to obtain data in CSV format as a stream, translating headers, and triggering file download:
 ```tsx
 const { data, isLoading, isError } = useExecuteCsvQuery({
   dataSource: DM.DataSource,
   dimensions: [DM.Commerce.AgeRange],
   measures: [measureFactory.sum(DM.Commerce.Revenue)],
   filters: [filterFactory.greaterThan(DM.Commerce.Revenue, 1000)],
   config: { asDataStream: true },
 });
 if (isLoading) {
   return <div>Loading...</div>;
 }
 if (isError) {
   return <div>Error</div>;
 }
 if (data) {
   const reader = new FileReader();
   reader.onload = () => {
     if (reader.result) {
       const text = reader.result as string;
       const lines = text.split('\n');
       // Update headers
       if (lines.length > 0) {
         lines[0] = translateHeaders(lines[0]); // replace with own implementation
       }
       // Join modified lines back to a text
       const modifiedCsv = lines.join('\n');
       // Create a new Blob with modified content
       const modifiedBlob = new Blob([modifiedCsv], { type: 'text/csv' });
       // Trigger file download
       const blobURL = window.URL.createObjectURL(modifiedBlob);
       const a = document.createElement('a');
       a.href = blobURL;
       const fileName = 'data_translated_headers'
       a.download = fileName;
       document.body.appendChild(a);
       a.click();
       window.URL.revokeObjectURL(blobURL);
       document.body.removeChild(a);
     }
   };
   reader.readAsText(data as Blob);
 }
 return null;
 ```
 * @returns Query state that contains the status of the query execution, the result data, or the error if any occurred
 * @group Queries
 */
export const useExecuteCsvQuery = withTracking('useExecuteCsvQuery')(useExecuteCsvQueryInternal);

/**
 * {@link useExecuteQuery} without tracking to be used inside other hooks or components in Compose SDK.
 *
 * @param params - Parameters of the query
 * @internal
 */
export function useExecuteCsvQueryInternal(params: ExecuteCsvQueryParams): CsvQueryState {
  const isQueryParamsChanged = useQueryParamsChanged(params);
  const shouldLoad = useShouldLoad(params, isQueryParamsChanged);
  const [queryState, dispatch] = useReducer(downloadCsvQueryStateReducer, {
    isLoading: true,
    isError: false,
    isSuccess: false,
    status: 'loading',
    error: undefined,
    data: undefined,
  });
  const { isInitialized, app } = useSisenseContext();

  useEffect(() => {
    if (!isInitialized) {
      dispatch({
        type: 'error',
        error: new TranslatableError('errors.executeQueryNoSisenseContext'),
      });
    }
    if (shouldLoad(app)) {
      dispatch({ type: 'loading' });
      const {
        dataSource,
        dimensions,
        measures,
        filters,
        highlights,
        count,
        offset,
        config,
        onBeforeQuery,
      } = params;
      const { filters: filterList, relations: filterRelations } =
        getFilterListAndRelationsJaql(filters);
      void executeCsvQuery(
        {
          dataSource,
          dimensions,
          measures,
          filters: filterList,
          filterRelations,
          highlights,
          count,
          offset,
        },
        app,
        { onBeforeQuery },
      )
        .then((data) => {
          if (config?.asDataStream) {
            dispatch({ type: 'success', data });
            return null;
          }
          return data.text();
        })
        .then((data) => data && dispatch({ type: 'success', data }))
        .catch((error: Error) => {
          dispatch({ type: 'error', error });
        });
    }
  }, [app, isInitialized, params, shouldLoad]);

  // Return the loading state on the first render, before the loading action is
  // dispatched in useEffect().
  if (queryState.data && isQueryParamsChanged) {
    return downloadCsvQueryStateReducer(queryState, { type: 'loading' });
  }

  return queryState;
}
