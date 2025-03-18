import { RestApi } from '@/api/rest-api.js';
import { useSisenseContext } from '@/sisense-context/sisense-context.js';
import { RestApiHookState } from '@/utils/utility-types';
import { DataSource, DataSourceField, isDataSourceInfo } from '@sisense/sdk-data';
import { useQuery } from '@tanstack/react-query';

/**
 * Gets the fields of a data source.
 *
 * @param dataSource - The data source to get the fields for
 * @internal
 */
export const useGetDataSourceFields = (params: {
  dataSource: DataSource | undefined;
  enabled?: boolean;
}): DataSourceFieldsState => {
  const { dataSource, enabled = true } = params;
  const { app, isInitialized } = useSisenseContext();
  const canLoad = isInitialized && app;
  const api = canLoad ? new RestApi(app?.httpClient) : undefined;

  const dataSourceToQuery = dataSource || app?.defaultDataSource;
  const shouldBeQueried = !!(enabled && dataSourceToQuery && api);

  const dataSourceString = dataSourceToQuery
    ? isDataSourceInfo(dataSourceToQuery)
      ? dataSourceToQuery.title
      : dataSourceToQuery
    : undefined;
  const {
    data,
    status,
    error: unknownError,
  } = useQuery({
    queryKey: ['getDataSourceFields', dataSource, api],
    queryFn: () =>
      dataSourceString && api ? api.getDataSourceFields(dataSourceString) : undefined,
    select: (data) => data,
    enabled: shouldBeQueried,
  });

  switch (status) {
    case 'success':
      return {
        dataSourceFields: data as DataSourceField[],
        isLoading: false,
        isError: false,
        isSuccess: true,
        error: undefined,
        status,
      };
    case 'loading':
      return loadingState;
    case 'error':
      return {
        dataSourceFields: undefined,
        isLoading: false,
        isError: true,
        isSuccess: false,
        error: unknownError as Error,
        status,
      };
    default:
      throw new Error(`Unknown status: ${status}`);
  }
};

const loadingState: DataSourceFieldsState = {
  dataSourceFields: undefined,
  isLoading: true,
  isError: false,
  isSuccess: false,
  error: undefined,
  status: 'loading',
};

type DataSourceFieldsState = RestApiHookState<'dataSourceFields', DataSourceField[]>;
