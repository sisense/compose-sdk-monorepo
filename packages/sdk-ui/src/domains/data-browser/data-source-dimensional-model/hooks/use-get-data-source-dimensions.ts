import { useMemo } from 'react';

import {
  DataSource,
  Dimension,
  getDimensionsFromDataSourceFields,
  isDataSourceInfo,
} from '@sisense/sdk-data';

import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context.js';
import { withTracking } from '@/infra/decorators/hook-decorators/with-tracking.js';

import { useGetDataSourceFields } from './use-get-data-source-fields.js';

/**
 * States of a data source dimensions load.
 */
export type DataSourceDimensionsState =
  | DataSourceDimensionsLoadingState
  | DataSourceDimensionsErrorState
  | DataSourceDimensionsSuccessState;

/**
 * State of data source dimensions that is loading.
 */
export type DataSourceDimensionsLoadingState = {
  /** Whether the dimensions are loading */
  isLoading: true;
  /** Whether the dimensions load has failed */
  isError: false;
  /** Whether the dimensions load has succeeded */
  isSuccess: false;
  /** Error, if one occurred */
  error: undefined;
  /** Dimensions, if the load succeeded */
  dimensions: undefined;
  /** Loading status */
  status: 'loading';
};

/**
 * State of a data source dimensions load that has failed.
 */
export type DataSourceDimensionsErrorState = {
  /** Whether the dimensions are loading */
  isLoading: false;
  /** Whether the dimensions load has failed */
  isError: true;
  /** Whether the dimensions load has succeeded */
  isSuccess: false;
  /** Error, if one occurred */
  error: Error;
  /** Dimensions, if the load succeeded */
  dimensions: undefined;
  /** Loading status */
  status: 'error';
};

/**
 * State of a data source dimensions load that has succeeded.
 */
export type DataSourceDimensionsSuccessState = {
  /** Whether the dimensions are loading */
  isLoading: false;
  /** Whether the dimensions load has failed */
  isError: false;
  /** Whether the dimensions load has succeeded */
  isSuccess: true;
  /** Error, if one occurred */
  error: undefined;
  /** Dimensions, if the load succeeded */
  dimensions: Dimension[];
  /** Loading status */
  status: 'success';
};

/**
 * Parameters for {@link useGetDataSourceDimensions} hook.
 */
export interface GetDataSourceDimensionsParams {
  /** The data source to get the dimensions for. If no data source is provided, the default data source will be used. */
  dataSource: DataSource | undefined;
  /** Whether the query should be enabled. */
  enabled?: boolean;
  /** The number of items to return */
  count?: number;
  /** The offset for pagination */
  offset?: number;
  /** The search value to filter by */
  searchValue?: string;
}

/**
 * {@link useGetDataSourceDimensions} without tracking to be used inside other hooks or components.
 *
 * @param params - The parameters for getting the dimensions
 * @returns The dimensions state
 * @internal
 */
export function useGetDataSourceDimensionsInternal(
  params: GetDataSourceDimensionsParams,
): DataSourceDimensionsState {
  const { dataSource, enabled = true, count, offset, searchValue } = params;
  const { app } = useSisenseContext();

  const { dataSourceFields, status, error } = useGetDataSourceFields({
    dataSource,
    enabled,
    count,
    offset,
    searchValue,
    cacheTime: 0,
  });

  const dataSourceToQuery = dataSource || app?.defaultDataSource;
  const dataSourceString = dataSourceToQuery
    ? isDataSourceInfo(dataSourceToQuery)
      ? dataSourceToQuery.title
      : dataSourceToQuery
    : undefined;
  const dimensions = useMemo(
    () =>
      dataSourceFields && dataSourceString
        ? getDimensionsFromDataSourceFields(dataSourceFields, dataSourceString)
        : undefined,
    [dataSourceFields, dataSourceString],
  );
  if (!dataSourceString) {
    return {
      dimensions: undefined,
      isLoading: false,
      isError: true,
      isSuccess: false,
      error: new Error('No data source provided'),
      status: 'error',
    };
  }
  switch (status) {
    case 'success':
      return {
        dimensions: dimensions!,
        isLoading: false,
        isError: false,
        isSuccess: true,
        error: undefined,
        status,
      };
    case 'loading':
      return {
        dimensions: undefined,
        isLoading: true,
        isError: false,
        isSuccess: false,
        error: undefined,
        status: 'loading',
      };
    case 'error':
      return {
        dimensions: undefined,
        isLoading: false,
        isError: true,
        isSuccess: false,
        error,
        status,
      };
    default:
      throw new Error(`Unknown status: ${status}`);
  }
}

/**
 * Gets the dimensions of a data source.
 *
 * @param params - The parameters for getting the dimensions
 * @returns The dimensions state
 * @group Fusion Assets
 * @fusionEmbed
 */
export const useGetDataSourceDimensions = (
  params: GetDataSourceDimensionsParams,
): DataSourceDimensionsState => {
  return withTracking('useGetDataSourceDimensions')(useGetDataSourceDimensionsInternal)(params);
};
