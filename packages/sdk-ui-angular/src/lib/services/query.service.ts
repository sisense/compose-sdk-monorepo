import { Injectable } from '@angular/core';
import {
  executeQuery,
  executeQueryByWidgetId,
  type ExecuteQueryParams as ExecuteQueryParamsPreact,
  type ExecuteQueryByWidgetIdParams as ExecuteQueryByWidgetIdParamsPreact,
} from '@sisense/sdk-ui-preact';
import { SisenseContextService } from './sisense-context.service';
import { TrackableService } from '../decorators/trackable.decorator';
import { getFilterListAndRelations } from '@sisense/sdk-data';

/**
 * Parameters for data query execution.
 */
export interface ExecuteQueryParams extends Omit<ExecuteQueryParamsPreact, 'enabled'> {}

/**
 * Parameters for data query by widget id execution.
 */
export interface ExecuteQueryByWidgetIdParams
  extends Omit<ExecuteQueryByWidgetIdParamsPreact, 'enabled'> {}

@Injectable({
  providedIn: 'root',
})
@TrackableService<QueryService>(['executeQuery', 'executeQueryByWidgetId'])
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
   * return Query result
   */
  async executeQuery(params: ExecuteQueryParams) {
    const { dataSource, dimensions, measures, filters, highlights, count, offset, onBeforeQuery } =
      params;
    const app = await this.sisenseContextService.getApp();
    const { filters: filterList, relations: filterRelations } = getFilterListAndRelations(filters);
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
      },
      app,
      { onBeforeQuery },
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
    });
  }
}
