import { Injectable } from '@angular/core';
import {
  type GetFilterMembersData,
  type GetFilterMembersParams as GetFilterMembersParamsPreact,
  type GetFilterMembersResult as GetFilterMembersResultPreact,
  HookAdapter,
  useGetFilterMembers,
} from '@ethings-os/sdk-ui-preact';

import { createSisenseContextConnector } from '../component-wrapper-helpers';
import { TrackableService } from '../decorators/trackable.decorator';
import { SisenseContextService } from './sisense-context.service';

export type { GetFilterMembersData };

/**
 * Parameters for retrieving filter members.
 */
export interface GetFilterMembersParams extends Omit<GetFilterMembersParamsPreact, 'enabled'> {}

/**
 * Service for working with filter.
 *
 * @group Filters
 */
@Injectable({
  providedIn: 'root',
})
@TrackableService<FilterService>(['getFilterMembers'])
export class FilterService {
  constructor(private sisenseContextService: SisenseContextService) {}

  /**
   * Retrieves members of the provided filter.
   *
   * Those members can be used to display a list of members in a third-party filter component such as Material UI Select.
   *
   * ## Example
   *
   * Retrieve selected members from a Filter on Country of the Sample ECommerce data model.
   *
   * ```ts
   * try {
   *   const data = await filterService.getFilterMembers({
   *     filter: filterFactory.members(DM.Country.Country, ['United States', 'Canada'])
   *   });
   *
   *   const { selectedMembers, allMembers, excludeMembers, enableMultiSelection } = data;
   *   console.log('selectedMembers', selectedMembers);
   * } catch (error) {
   *   console.error('Error:', error);
   * }
   * ```
   *
   * @param params - Parameters for retrieving filter members
   * @returns Promise that resolves to the filter members data
   */
  async getFilterMembers(params: GetFilterMembersParams): Promise<GetFilterMembersData> {
    const hookAdapter = new HookAdapter(useGetFilterMembers, [
      createSisenseContextConnector(this.sisenseContextService),
    ]);

    const resultPromise = new Promise<GetFilterMembersData>((resolve, reject) => {
      hookAdapter.subscribe((res: GetFilterMembersResultPreact) => {
        const { isError, isSuccess, error } = res;

        if (isError) {
          reject(error);
        } else if (isSuccess) {
          resolve(res.data);
        }
      });
    });

    hookAdapter.run(params);

    return resultPromise.finally(() => {
      hookAdapter.destroy();
    });
  }
}
