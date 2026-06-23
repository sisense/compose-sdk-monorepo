import {
  DataSource,
  DataSourceField,
  DataSourceMetadata,
  DataSourceSchema,
} from '@sisense/sdk-data';

import {
  ExecutingCountRowsQueryResult,
  ExecutingCsvQueryResult,
  ExecutingPivotQueryResult,
  ExecutingQueryResult,
  PivotQueryDescription,
  QueryDescription,
  QueryExecutionConfig,
} from './types.js';

export interface QueryClient {
  executeQuery(params: QueryDescription, config?: QueryExecutionConfig): ExecutingQueryResult;
  executeCountRowsQuery(
    params: QueryDescription,
    config?: QueryExecutionConfig,
  ): ExecutingCountRowsQueryResult;
  executeCsvQuery(params: QueryDescription, config?: QueryExecutionConfig): ExecutingCsvQueryResult;
  executePivotQuery(
    params: PivotQueryDescription,
    config?: QueryExecutionConfig,
  ): ExecutingPivotQueryResult;
  getDataSourceFields(dataSource: DataSource): Promise<DataSourceField[]>;
  getDataSourceSchema(datasourceName: string): Promise<DataSourceSchema | undefined>;
  getDataSourceList(): Promise<DataSourceMetadata[]>;
}
