import { Injectable } from '@angular/core';
import {
  getDashboardModel,
  type GetDashboardModelOptions,
  getDashboardModels,
  type GetDashboardModelsOptions,
} from '@sisense/sdk-ui-preact';

import { TrackableService } from '../decorators/trackable.decorator';
import { SisenseContextService } from './sisense-context.service';

/**
 * Service for working with Sisense Fusion dashboards.
 *
 * **Note:** Dashboard and Widget extensions based on JS scripts and add-ons in Fusion – for example, Blox and Jump To Dashboard – are not supported.
 *
 * @group Fusion Assets
 * @fusionEmbed
 */
@Injectable({
  providedIn: 'root',
})
@TrackableService<DashboardService>(['getDashboardModel', 'getDashboardModels'])
export class DashboardService {
  constructor(private sisenseContextService: SisenseContextService) {}

  /**
   * Retrieves an existing dashboard model from the Sisense instance.
   *
   * @param dashboardOid - Identifier of the dashboard
   * @param options - Advanced configuration options
   * @returns Dashboard model
   */
  async getDashboardModel(dashboardOid: string, options?: GetDashboardModelOptions) {
    const app = await this.sisenseContextService.getApp();
    return getDashboardModel(app.httpClient, dashboardOid, options);
  }

  /**
   * Retrieves existing dashboard models from the Sisense instance.
   *
   * @param options - Advanced configuration options
   * @returns Dashboard models array
   */
  async getDashboardModels(options?: GetDashboardModelsOptions) {
    const app = await this.sisenseContextService.getApp();
    return getDashboardModels(app.httpClient, options);
  }
}
