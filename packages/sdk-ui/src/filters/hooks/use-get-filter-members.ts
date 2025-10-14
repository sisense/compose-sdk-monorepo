import { useCallback, useMemo } from 'react';

import {
  convertDataSource,
  DataSource,
  DimensionalLevelAttribute,
  Filter,
  isDatetime,
  isMembersFilter,
  isNumber,
} from '@sisense/sdk-data';

import { HookEnableParam } from '@/common/hooks/types';
import { withTracking } from '@/decorators/hook-decorators';
import { useExecuteQueryInternal } from '@/query-execution/use-execute-query';
import { formatDateValue, getDefaultDateMask } from '@/query/date-formats/apply-date-format';
import { useSisenseContext } from '@/sisense-context/sisense-context';
import { TranslatableError } from '@/translation/translatable-error';

import { Member, SelectedMember } from '../components/member-filter-tile';

/**
 * Returns new `members` array with members transformed to required type.
 */
function castMembersToType(members: any[], type: string) {
  return members.map((member) => (isNumber(type) ? Number(member) : member.toString()));
}

/**
 * Params for {@link useGetFilterMembers}
 */
export interface GetFilterMembersParams extends HookEnableParam {
  /** Provided members filter */
  filter: Filter;
  /** Default data source to use if filter does not have one */
  defaultDataSource?: DataSource;
  /** List of filters this filter is dependent on */
  parentFilters?: Filter[];
  /**
   * Number of requested members to return in the query result
   *
   * If not specified, the default value is `20000`
   *
   * @internal
   */
  count?: number;
  /**
   * Whether to allow original filter members to be included in the result even if they are not present in the loaded data
   *
   * When enabled, filter members that are not found in the queried results will still be included
   * in the `selectedMembers` and `allMembers` arrays.
   *
   * Example case: there's no value for a specific date, but user still have to be able to select it in the filter
   *
   * If not specified, the default value is `false`
   *
   * @internal
   */
  allowMissingMembers?: boolean;
}

/**
 * Result data of retrieving filter members.
 */
export interface GetFilterMembersData {
  /** Array of members that are currently selected */
  selectedMembers: SelectedMember[];
  /** Array of all available members */
  allMembers: Member[];
  /** Flag indicating whether members are excluded */
  excludeMembers: boolean;
  /** Flag indicating if multiple selection is enabled */
  enableMultiSelection: boolean;
  /** Flag indicating if there is a background filter applied */
  hasBackgroundFilter: boolean;
}

/**
 * State of a filter members load that has succeeded.
 */
export interface FilterMembersSuccessState {
  /** Whether the data fetching is loading */
  isLoading: false;
  /** Whether the data fetching has failed */
  isError: false;
  /** Whether the data fetching has succeeded */
  isSuccess: true;
  /** The status of the data fetching execution */
  status: 'success';
  /** The error if any occurred */
  error: undefined;
  /** The result data */
  data: GetFilterMembersData;
}

/**
 * State of a filter members load that is loading.
 */
export interface FilterMembersLoadingState {
  /** Whether the data fetching is loading */
  isLoading: true;
  /** Whether the data fetching has failed */
  isError: false;
  /** Whether the data fetching has succeeded */
  isSuccess: false;
  /** The status of the data fetching execution */
  status: 'loading';
  /** The error if any occurred */
  error: undefined;
  /** The result data */
  data: GetFilterMembersData;
}

/**
 * State of a filter members load that has failed.
 */
export interface FilterMembersErrorState {
  /** Whether the data fetching is loading */
  isLoading: false;
  /** Whether the data fetching has failed */
  isError: true;
  /** Whether the data fetching has succeeded */
  isSuccess: false;
  /** The status of the data fetching execution */
  status: 'error';
  /** The error if any occurred */
  error: Error;
  /** The result data */
  data: undefined;
}

/**
 * States of the {@link useGetFilterMembers} hook.
 */
export type FilterMembersState =
  | FilterMembersLoadingState
  | FilterMembersErrorState
  | FilterMembersSuccessState;

/**
 * Result of the {@link useGetFilterMembers} hook.
 */
export type GetFilterMembersResult = FilterMembersState & {
  /**
   * Function to load more data rows
   *
   * @internal
   */
  loadMore: (count: number) => void;
};

/**
 * {@link useGetFilterMembers} without tracking to be used inside other hooks or components in Compose SDK.
 *
 * @param params - Parameters of the query
 * @internal
 */
export const useGetFilterMembersInternal = ({
  filter,
  defaultDataSource,
  parentFilters = [],
  count,
  enabled,
  allowMissingMembers = false,
}: GetFilterMembersParams): GetFilterMembersResult => {
  if (!isMembersFilter(filter)) {
    throw new TranslatableError('errors.notAMembersFilter');
  }

  const {
    attribute: filterAttribute,
    config: { backgroundFilter, enableMultiSelection, excludeMembers },
  } = filter;

  // TODO: this is a temporary fix for useExecuteQuery so the reference to
  // "dimensions" does not change on every render, causing infinite rerenders.
  const dimensions = useMemo(() => [filterAttribute], [filterAttribute]);
  const queryFilters = [...parentFilters];

  if (backgroundFilter) {
    queryFilters.push(backgroundFilter);
  }
  const { data, loadMore, ...loadState } = useExecuteQueryInternal({
    // prioritize attribute dataSource for the use case of multi-source dashboard
    dataSource: filterAttribute.dataSource
      ? convertDataSource(filterAttribute.dataSource)
      : defaultDataSource,
    dimensions,
    filters: queryFilters,
    count,
    enabled,
  });

  const { app } = useSisenseContext();

  const formatDate = useCallback(
    (value: Date | string) => {
      return formatDateValue(
        value,
        getDefaultDateMask((filterAttribute as DimensionalLevelAttribute).granularity),
        app?.settings?.locale,
      );
    },
    [filterAttribute, app?.settings?.locale],
  );

  const members = useMemo(
    () => castMembersToType(filter.members, filterAttribute.type),
    [filter.members, filterAttribute.type],
  );

  const deactivatedMembers = useMemo(
    () => castMembersToType(filter.config.deactivatedMembers ?? [], filterAttribute.type),
    [filter.config.deactivatedMembers, filterAttribute.type],
  );

  // Queried members with missing members when allowMissingMembers is enabled
  const availableMembers = useMemo(() => {
    // Queried members with applied date formatting
    const queriedMembers = (data?.rows || []).map((row) => ({
      data: row[0].data,
      text: isDatetime(filterAttribute.type) ? formatDate(row[0].data) : row[0].data.toString(),
    }));

    if (!allowMissingMembers) {
      return queriedMembers;
    }

    const queriedMemberData = queriedMembers.map((m) => m.data);

    // Find members that are in the filter but not in the queried data
    const missingMembers = members
      .filter((member) => !queriedMemberData.includes(member))
      .map((member) => ({
        data: member,
        text: isDatetime(filterAttribute.type) ? formatDate(member) : member.toString(),
      }));

    // Find deactivated members that are not in the queried data
    const missingDeactivatedMembers = deactivatedMembers
      .filter((member) => !queriedMemberData.includes(member) && !members.includes(member))
      .map((member) => ({
        data: member,
        text: isDatetime(filterAttribute.type) ? formatDate(member) : member.toString(),
      }));

    return [...missingMembers, ...missingDeactivatedMembers, ...queriedMembers];
  }, [data, allowMissingMembers, members, deactivatedMembers, filterAttribute.type, formatDate]);

  const selectedMembers: SelectedMember[] = useMemo(() => {
    // Find members that exist in the available data (includes missing members when allowMissingMembers is enabled)
    return availableMembers
      .filter(
        (availableMember) =>
          members.includes(availableMember.data) ||
          deactivatedMembers.includes(availableMember.data),
      )
      .map((availableMember) => ({
        key: availableMember.data.toString(),
        title: availableMember.text ?? availableMember.data.toString(),
        inactive: deactivatedMembers.includes(availableMember.data),
      }));
  }, [deactivatedMembers, members, availableMembers]);

  const allMembers: Member[] = useMemo(
    () =>
      availableMembers.map((availableMember) => ({
        key: availableMember.data.toString(),
        title: availableMember.text ?? availableMember.data.toString(),
      })),
    [availableMembers],
  );

  const hasBackgroundFilter = !!backgroundFilter && parentFilters.length === 0;
  const resultData = {
    selectedMembers,
    allMembers,
    excludeMembers,
    enableMultiSelection,
    hasBackgroundFilter,
  };

  if (loadState.isError) {
    return {
      ...loadState,
      data: undefined,
      loadMore,
    };
  }

  return {
    ...loadState,
    data: resultData,
    loadMore,
  };
};

/**
 * Hook that fetches members of the provided filter
 *
 * Those members can be used to display a list of members in a third-party filter component such as Material UI Select.
 *
 * ## Example
 *
 * Retrieve selected members from a Filter on Country of the Sample ECommerce data model.
 *
 * ```tsx
 * const {
 *   isLoading,
 *   data: { selectedMembers, allMembers, excludeMembers, enableMultiSelection },
 * } = useGetFilterMembers({ filter: filterFactory.members(DM.Country.Country, ['United States', 'Canada']) });
 *
 * if (isLoading) {
 *   return <div>Loading...</div>;
 * }
 * console.log('selectedMembers', selectedMembers);
 * ```
 *
 * @returns Results that contains the status of the filter query execution, the result data, or the error if any occurred
 * @shortDescription Hook to fetch members of a filter
 * @group Filter Tiles
 */
export const useGetFilterMembers = withTracking('useGetFilterMembers')(useGetFilterMembersInternal);
