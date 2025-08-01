import { Injectable } from '@angular/core';
import { getFilterListAndRelationsJaql, QueryResultData } from '@sisense/sdk-data';
import {
  type ExecuteCsvQueryParams as ExecuteCsvQueryParamsPreact,
  type ExecuteCustomWidgetQueryParams as ExecuteCustomWidgetQueryParamsPreact,
  executePivotQuery,
  type ExecutePivotQueryParams as ExecutePivotQueryParamsPreact,
  executeQuery,
  executeQueryByWidgetId,
  type ExecuteQueryByWidgetIdParams as ExecuteQueryByWidgetIdParamsPreact,
  type ExecuteQueryParams as ExecuteQueryParamsPreact,
  HookAdapter,
  useExecuteCsvQueryInternal,
  useExecuteCustomWidgetQueryInternal,
} from '@sisense/sdk-ui-preact';

import { createSisenseContextConnector } from '../component-wrapper-helpers';
import { TrackableService } from '../decorators/trackable.decorator';
import { SisenseContextService } from './sisense-context.service';

interface ExecuteQueryHandlers {
  /** Sync or async callback that allows to modify the JAQL payload before it is sent to the server. */
  beforeQuery?: ExecuteQueryParamsPreact['onBeforeQuery'];
}

/**
 * Parameters for data query execution.
 */
export interface ExecuteQueryParams
  extends Omit<ExecuteQueryParamsPreact, 'enabled' | 'onBeforeQuery'>,
    ExecuteQueryHandlers {}

/**
 * Parameters for data query by widget id execution.
 */
export interface ExecuteQueryByWidgetIdParams
  extends Omit<ExecuteQueryByWidgetIdParamsPreact, 'enabled' | 'onBeforeQuery'>,
    ExecuteQueryHandlers {}

/**
 * Parameters for pivot data query execution.
 */
export interface ExecutePivotQueryParams
  extends Omit<ExecutePivotQueryParamsPreact, 'enabled' | 'onBeforeQuery'>,
    ExecuteQueryHandlers {}

/**
 * Parameters for CSV data query execution.
 */
export interface ExecuteCsvQueryParams
  extends Omit<ExecuteCsvQueryParamsPreact, 'enabled' | 'onBeforeQuery'>,
    ExecuteQueryHandlers {}

/**
 * Parameters for custom widget query execution.
 */
export interface ExecuteCustomWidgetQueryParams
  extends Omit<ExecuteCustomWidgetQueryParamsPreact, 'enabled' | 'onBeforeQuery'>,
    ExecuteQueryHandlers {}

/**
 * Service for executing data queries.
 *
 * @group Queries
 */
@Injectable({
  providedIn: 'root',
})
@TrackableService<QueryService>([
  'executeQuery',
  'executeQueryByWidgetId',
  'executePivotQuery',
  'executeCustomWidgetQuery',
])
export class QueryService {
  constructor(private sisenseContextService: SisenseContextService) {}

  /**
   * Executes a data query. If you want to display the query results, you can use
   * them to populate Compose SDK UI elements or third party UI elements.
   *
   * To learn how to populate third party UI elements with query results, see the
   * [External Charts Guide](/guides/sdk/guides/charts/guide-external-charts.html#query)
   *
   * @param params - Query parameters
   * @return Query result
   */
  async executeQuery(params: ExecuteQueryParams) {
    const {
      dataSource,
      dimensions,
      measures,
      filters,
      highlights,
      count,
      offset,
      ungroup,
      beforeQuery,
    } = params;
    const app = await this.sisenseContextService.getApp();
    const { filters: filterList, relations: filterRelations } =
      getFilterListAndRelationsJaql(filters);
    const data = await executeQuery(
      {
        dataSource,
        dimensions,
        measures,
        filters: filterList,
        filterRelations,
        highlights,
        count,
        offset,
        ungroup,
      },
      app,
      { onBeforeQuery: beforeQuery },
    );

    return { data };
  }

  /**
   * Executes a data query extracted from an existing widget in the Sisense instance.
   *
   * @param params - Parameters to identify the target widget
   * @returns Query result
   */
  async executeQueryByWidgetId(params: ExecuteQueryByWidgetIdParams) {
    const app = await this.sisenseContextService.getApp();

    return executeQueryByWidgetId({
      ...params,
      app,
      onBeforeQuery: params.beforeQuery,
    });
  }

  /**
   * Executes a data query for a pivot table.
   *
   * @param params - Pivot query parameters
   * @return Pivot query result
   * @beta
   */
  async executePivotQuery(params: ExecutePivotQueryParams) {
    const {
      dataSource,
      rows,
      columns,
      values,
      grandTotals,
      filters,
      highlights,
      count,
      offset,
      beforeQuery,
    } = params;
    const { filters: filterList, relations: filterRelations } =
      getFilterListAndRelationsJaql(filters);

    const app = await this.sisenseContextService.getApp();
    const data = await executePivotQuery(
      {
        dataSource,
        rows,
        columns,
        values,
        grandTotals,
        filters: filterList,
        filterRelations,
        highlights,
        count,
        offset,
      },
      app,
      { onBeforeQuery: beforeQuery },
    );

    return { data };
  }

  /**
   * Executes a CSV data query.
   * Similar to {@link QueryService.executeQuery}, but returns the data in CSV format as text or as a stream.
   *
   * @param params - CSV query parameters
   * @return CSV query result
   */
  async executeCsvQuery(params: ExecuteCsvQueryParams) {
    const hookAdapter = new HookAdapter(useExecuteCsvQueryInternal, [
      createSisenseContextConnector(this.sisenseContextService),
    ]);

    const resultPromise = new Promise<{ data: Blob | string }>((resolve, reject) => {
      hookAdapter.subscribe((res) => {
        const { data, isSuccess, isError, error } = res;
        if (isSuccess) {
          resolve({ data });
        } else if (isError) {
          reject(error);
        }
      });
    });

    hookAdapter.run(params);

    return resultPromise.finally(() => {
      hookAdapter.destroy();
    });
  }

  /**
   * Executes a data query from custom widget component props.
   *
   * This method takes custom widget props (dataSource, dataOptions, filters, etc.)
   * and executes the appropriate data query
   *
   * @param params - Custom widget component props containing data source, data options, filters, etc.
   * @returns Promise resolving to query result with formatted data
   */
  async executeCustomWidgetQuery(params: ExecuteCustomWidgetQueryParams) {
    const hookAdapter = new HookAdapter(useExecuteCustomWidgetQueryInternal, [
      createSisenseContextConnector(this.sisenseContextService),
    ]);

    const resultPromise = new Promise<{ data: QueryResultData }>((resolve, reject) => {
      hookAdapter.subscribe((res) => {
        const { data, isSuccess, isError, error } = res;
        if (isSuccess) {
          resolve({ data });
        } else if (isError) {
          reject(error);
        }
      });
    });

    hookAdapter.run(params);

    return resultPromise.finally(() => {
      hookAdapter.destroy();
    });
  }
}
