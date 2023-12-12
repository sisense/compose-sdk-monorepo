import {
  DataSourceField,
  ExecutingCsvQueryResult,
  ExecutingQueryResult,
  QueryDescription,
  QueryExecutionConfig,
} from './types.js';
import { DataSource } from '@sisense/sdk-data';

export interface QueryClient {
  executeQuery(params: QueryDescription, config?: QueryExecutionConfig): ExecutingQueryResult;
  executeCsvQuery(params: QueryDescription, config?: QueryExecutionConfig): ExecutingCsvQueryResult;
  getDataSourceFields(dataSource: DataSource): Promise<DataSourceField[]>;
}
