import { Injectable } from '@angular/core';
import {
  getHierarchyModels,
  type GetHierarchyModelsParams as GetHierarchyModelsParamsPreact,
  HierarchyModel,
} from '@sisense/sdk-ui-preact';

import { TrackableService } from '../decorators/trackable.decorator';
import { SisenseContextService } from './sisense-context.service';

/**
 * Parameters for retrieving an existing hierarchy models from the Sisense instance.
 */
export interface GetHierarchyModelsParams extends Omit<GetHierarchyModelsParamsPreact, 'enabled'> {}

/**
 * Service for working with Sisense Fusion hierarchies.
 *
 * @group Fusion Assets
 * @fusionEmbed
 */
@Injectable({
  providedIn: 'root',
})
@TrackableService<HierarchyService>(['getHierarchyModels'])
export class HierarchyService {
  constructor(private sisenseContextService: SisenseContextService) {}

  /**
   * Retrieves existing hierarchy models from the Sisense instance.
   *
   * @param params - Parameters to identify the target hierarchy models
   * @returns Hierarchy models array
   */
  async getHierarchyModels(params: GetHierarchyModelsParams): Promise<HierarchyModel[]> {
    const app = await this.sisenseContextService.getApp();
    return getHierarchyModels(app.httpClient, params, app.defaultDataSource);
  }
}
