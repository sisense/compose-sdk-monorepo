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

  async executeQueryByWidgetId(params: ExecuteQueryByWidgetIdParams) {
    const app = await this.sisenseContextService.getApp();

    return executeQueryByWidgetId({
      ...params,
      app,
    });
  }
}
