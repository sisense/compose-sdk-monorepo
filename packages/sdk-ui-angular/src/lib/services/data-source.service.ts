import { Injectable } from '@angular/core';
import type { Dimension } from '@sisense/sdk-data';
import {
  type DataSourceDimensionsState,
  type GetDataSourceDimensionsParams as GetDataSourceDimensionsParamsPreact,
  HookAdapter,
  useGetDataSourceDimensionsInternal,
} from '@sisense/sdk-ui-preact';

import {
  createPluginContextConnector,
  createSisenseContextConnector,
} from '../component-wrapper-helpers';
import { TrackableService } from '../decorators/trackable.decorator';
import { SisenseContextService } from './sisense-context.service';

/**
 * Parameters for getting data source dimensions.
 */
export interface GetDataSourceDimensionsParams
  extends Omit<GetDataSourceDimensionsParamsPreact, 'enabled'> {}

/**
 * Service for working with data source dimensional model.
 *
 * @group Fusion Assets
 * @fusionEmbed
 */
@Injectable({
  providedIn: 'root',
})
@TrackableService<DataSourceService>(['getDataSourceDimensions'])
export class DataSourceService {
  constructor(private sisenseContextService: SisenseContextService) {}

  /**
   * Gets the dimensions of a data source.
   *
   * ## Example
   *
   * ```ts
   * try {
   *   const { dimensions } = await dataSourceService.getDataSourceDimensions({
   *     dataSource: DM.DataSource,
   *   });
   *   console.log('dimensions', dimensions);
   * } catch (error) {
   *   console.error('Error:', error);
   * }
   * ```
   *
   * @param params - Parameters for getting the dimensions
   * @returns Promise that resolves to the data source dimensions
   */
  async getDataSourceDimensions(
    params: GetDataSourceDimensionsParams,
  ): Promise<{ dimensions: Dimension[] }> {
    const hookAdapter = new HookAdapter(useGetDataSourceDimensionsInternal, [
      createPluginContextConnector(this.sisenseContextService),
      createSisenseContextConnector(this.sisenseContextService),
    ]);

    const resultPromise = new Promise<{ dimensions: Dimension[] }>((resolve, reject) => {
      hookAdapter.subscribe((res: DataSourceDimensionsState) => {
        const { isError, isSuccess, error } = res;
        if (isSuccess) {
          resolve({ dimensions: res.dimensions });
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
