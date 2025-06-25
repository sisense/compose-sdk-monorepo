import { onBeforeUnmount, type ToRefs, toRefs, watch } from 'vue';
import {
  type GetFilterMembersParams,
  type GetFilterMembersResult as GetFilterMembersResultPreact,
  type GetFilterMembersData,
  type FilterMembersState,
  type FilterMembersLoadingState,
  type FilterMembersErrorState,
  type FilterMembersSuccessState,
  HookAdapter,
  useGetFilterMembers as useGetFilterMembersPreact,
} from '@sisense/sdk-ui-preact';
import { isMembersFilter } from '@sisense/sdk-data';
import { createSisenseContextConnector } from '../helpers/context-connectors';
import type { MaybeRefOrWithRefs } from '../types';
import { collectRefs, toPlainObject } from '../utils';
import { useTracking } from './use-tracking';
import { useRefState } from '../helpers/use-ref-state';

/** Reexport types from @sisense/sdk-ui-preact */
export {
  GetFilterMembersParams,
  GetFilterMembersData,
  FilterMembersState,
  FilterMembersLoadingState,
  FilterMembersErrorState,
  FilterMembersSuccessState,
};

/**
 * A Vue composable function `useGetFilterMembers` that fetches members of a provided filter.
 *
 * Those members can be used to display a list of members in a third-party filter component.
 *
 * @param {MaybeRefOrWithRefs<GetFilterMembersParams>} params - The parameters for fetching filter members, supporting reactive Vue refs.
 * Includes the filter to fetch members for, optional default data source, parent filters, and count.
 *
 * @example
 * How to use `useGetFilterMembers` within a Vue component:
 * ```vue
 * <script setup>
 * import { ref } from 'vue';
 * import { useGetFilterMembers, filterFactory } from '@sisense/sdk-ui-vue';
 * import * as DM from './data-model';
 *
 * const filter = ref(filterFactory.members(DM.Country.Country, ['United States', 'Canada']));
 *
 * const { data, isLoading, isError, isSuccess, error, loadMore } = useGetFilterMembers({
 *   filter,
 *   // Optional parameters
 *   defaultDataSource: 'Sample ECommerce',
 *   parentFilters: [],
 * });
 * </script>
 * ```
 *
 * The composable returns an object with the following reactive properties to manage the filter members state:
 * - `data`: The filter members data containing selectedMembers, allMembers, excludeMembers, enableMultiSelection, and hasBackgroundFilter.
 * - `isLoading`: Indicates if the filter members fetching is in progress.
 * - `isError`: Indicates if an error occurred during filter members fetching.
 * - `isSuccess`: Indicates if the filter members fetching executed successfully without errors.
 * - `error`: Contains the error object if an error occurred during the fetching.
 * - `loadMore`: Function to load more data rows.
 *
 * This composable facilitates integrating Sisense filter members fetching into Vue applications, enabling developers
 * to easily manage filter member states and dynamically adjust parameters based on application needs.
 *
 * @group Filter Tiles
 */
export const useGetFilterMembers = (
  params: MaybeRefOrWithRefs<GetFilterMembersParams>,
): ToRefs<FilterMembersState> => {
  useTracking('useGetFilterMembers');

  const { filter, parentFilters = [] } = toPlainObject(params);
  const initialData: GetFilterMembersData = {
    selectedMembers: [],
    allMembers: [],
    ...(isMembersFilter(filter)
      ? {
          excludeMembers: filter.config.excludeMembers,
          enableMultiSelection: filter.config.enableMultiSelection,
          hasBackgroundFilter: !!filter.config.backgroundFilter && parentFilters.length === 0,
        }
      : {
          excludeMembers: false,
          enableMultiSelection: false,
          hasBackgroundFilter: false,
        }),
  };

  const hookAdapter = new HookAdapter(useGetFilterMembersPreact, [createSisenseContextConnector()]);
  const [queryState, setQueryState] = useRefState<Omit<GetFilterMembersResultPreact, 'loadMore'>>({
    isLoading: true,
    isError: false,
    isSuccess: false,
    status: 'loading',
    error: undefined,
    data: initialData,
  });

  hookAdapter.subscribe((result) => {
    setQueryState(result);
  });

  hookAdapter.run(toPlainObject(params));

  watch([...collectRefs(params)], () => {
    hookAdapter.run(toPlainObject(params));
  });

  onBeforeUnmount(() => {
    hookAdapter.destroy();
  });

  return toRefs(queryState.value) as ToRefs<FilterMembersState>;
};
