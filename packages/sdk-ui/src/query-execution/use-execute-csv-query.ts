/* eslint-disable max-lines-per-function */
/* eslint-disable sonarjs/cognitive-complexity */
import { useEffect, useReducer, useState } from 'react';
import { usePrevious } from '../common/hooks/use-previous.js';
import { executeCsvQuery } from '../query/execute-query.js';
import { useSisenseContext } from '../sisense-context/sisense-context.js';
import { TranslatableError } from '../translation/translatable-error.js';
import { withTracking } from '../decorators/hook-decorators/index.js';
import { isQueryParamsChanged } from './use-execute-query.js';
import { downloadCsvQueryStateReducer } from './csv-query-state-reducer.js';
import { CsvQueryState, ExecuteCsvQueryParams } from './types.js';
import { getFilterListAndRelations } from '@sisense/sdk-data';

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
 * @param params - Parameters of the query
 * @returns Query state that contains the status of the query execution, the result data, or the error if any occurred
 * @group Queries
 */
export const useExecuteCsvQuery = withTracking('useExecuteCsvQuery')(useExecuteCsvQueryInternal);

/**
 * {@link useExecuteQuery} without tracking to be used inside other hooks or components in Compose SDK.
 *
 * @internal
 */
export function useExecuteCsvQueryInternal(params: ExecuteCsvQueryParams): CsvQueryState {
  const prevParams = usePrevious(params);
  const [queryState, dispatch] = useReducer(downloadCsvQueryStateReducer, {
    isLoading: true,
    isError: false,
    isSuccess: false,
    status: 'loading',
    error: undefined,
    data: undefined,
  });
  const { isInitialized, app } = useSisenseContext();

  const [isNeverExecuted, setIsNeverExecuted] = useState(true);

  useEffect(() => {
    if (!isInitialized) {
      dispatch({
        type: 'error',
        error: new TranslatableError('errors.executeQueryNoSisenseContext'),
      });
    }
    if (!app) {
      return;
    }
    if (params?.enabled === false) {
      return;
    }
    if (isNeverExecuted || isQueryParamsChanged(prevParams, params)) {
      if (isNeverExecuted) {
        setIsNeverExecuted(false);
      }
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
        getFilterListAndRelations(filters);
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
  }, [app, isInitialized, prevParams, params, isNeverExecuted]);

  // Return the loading state on the first render, before the loading action is
  // dispatched in useEffect().
  if (queryState.data && isQueryParamsChanged(prevParams, params)) {
    return downloadCsvQueryStateReducer(queryState, { type: 'loading' });
  }

  return queryState;
}
