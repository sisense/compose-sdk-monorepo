import { Injectable } from '@angular/core';
import {
  getWidgetModel,
  type GetWidgetModelParams as GetWidgetModelParamsPreact,
} from '@sisense/sdk-ui-preact';

import { TrackableService } from '../decorators/trackable.decorator';
import { SisenseContextService } from './sisense-context.service';

/**
 * Parameters for retrieving an existing widget model from the Sisense instance
 */
export interface GetWidgetModelParams extends Omit<GetWidgetModelParamsPreact, 'enabled'> {}

/**
 * Service for working with Sisense Fusion widgets.
 *
 * @group Fusion Assets
 * @fusionEmbed
 */
@Injectable({
  providedIn: 'root',
})
@TrackableService<WidgetService>(['getWidgetModel'])
export class WidgetService {
  constructor(private sisenseContextService: SisenseContextService) {}

  /**
   * Retrieves an existing widget model from the Sisense instance.
   *
   * @param params - Parameters to identify the target widget
   * @returns Widget model
   */
  async getWidgetModel(params: GetWidgetModelParams) {
    const { dashboardOid, widgetOid } = params;
    const app = await this.sisenseContextService.getApp();
    return getWidgetModel(app.httpClient, dashboardOid, widgetOid);
  }
}
