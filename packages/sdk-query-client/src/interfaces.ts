import { DataSourceField, ExecutingQueryResult, QueryDescription } from './types.js';
import { DataSource } from '@sisense/sdk-data';

export interface QueryClient {
  executeQuery(params: QueryDescription): ExecutingQueryResult;
  getDataSourceFields(dataSource: DataSource): Promise<DataSourceField[]>;
}
