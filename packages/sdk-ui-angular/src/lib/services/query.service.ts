import { Injectable } from '@angular/core';
import {
  executeQuery,
  executeQueryByWidgetId,
  type ExecuteQueryParams,
  type ExecuteQueryByWidgetIdParams,
} from '@sisense/sdk-ui-preact';
import { SisenseContextService } from './sisense-context.service';

@Injectable({
  providedIn: 'root',
})
export class QueryService {
  constructor(private sisenseContextService: SisenseContextService) {}

  /**
   * Executes a data query.
   *
   * @param params - Query parameters
   * return Query result
   */
  async executeQuery(params: ExecuteQueryParams) {
    const { dataSource, dimensions, measures, filters, highlights, count, offset, onBeforeQuery } =
      params;
    const app = await this.sisenseContextService.getApp();
    const data = await executeQuery(
      { dataSource, dimensions, measures, filters, highlights, count, offset },
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
