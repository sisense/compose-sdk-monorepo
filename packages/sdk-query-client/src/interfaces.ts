import {
  DataSourceField,
  DataSourceMetadata,
  DataSourceSchema,
  ExecutingCsvQueryResult,
  ExecutingPivotQueryResult,
  ExecutingQueryResult,
  PivotQueryDescription,
  QueryDescription,
  QueryExecutionConfig,
} from './types.js';
import { DataSource } from '@sisense/sdk-data';

export interface QueryClient {
  executeQuery(params: QueryDescription, config?: QueryExecutionConfig): ExecutingQueryResult;
  executeCsvQuery(params: QueryDescription, config?: QueryExecutionConfig): ExecutingCsvQueryResult;
  executePivotQuery(
    params: PivotQueryDescription,
    config?: QueryExecutionConfig,
  ): ExecutingPivotQueryResult;
  getDataSourceFields(dataSource: DataSource): Promise<DataSourceField[]>;
  getDataSourceSchema(datasourceName: string): Promise<DataSourceSchema>;
  getDataSourceList(): Promise<DataSourceMetadata[]>;
}
