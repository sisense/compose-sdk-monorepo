import {
  convertDataSource,
  DataSource,
  DimensionalLevelAttribute,
  Filter,
  isDatetime,
  isMembersFilter,
  isNumber,
} from '@sisense/sdk-data';
import { useMemo } from 'react';
import { applyDateFormat } from '@/query/date-formats';
import { getDefaultDateMask } from '@/query/date-formats/apply-date-format';
import { useSisenseContext } from '@/sisense-context/sisense-context';
import { useExecuteQueryInternal } from '@/query-execution/use-execute-query';
import { withTracking } from '@/decorators/hook-decorators';
import { Member, SelectedMember } from '../components/member-filter-tile';
import { TranslatableError } from '@/translation/translatable-error';

/**
 * Returns new `members` array with members transformed to required type.
 */
function castMembersToType(members: any[], type: string) {
  return members.map((member) => (isNumber(type) ? Number(member) : member.toString()));
}

/**
 * Params for {@link useGetFilterMembers}
 */
export interface GetFilterMembersParams {
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
}

export interface GetFilterMembersSuccess {
  /** Whether the data fetching is loading */
  isLoading: boolean;
  /**
   * Function to load more data rows
   *
   * @internal
   * */
  loadMore: (count: number) => void;
  /** Whether the data fetching has failed */
  isError: false;
  /** The error if any occurred */
  error: undefined;
  /** The result data */
  data: {
    selectedMembers: SelectedMember[];
    allMembers: Member[];
    excludeMembers: boolean;
    enableMultiSelection: boolean;
    hasBackgroundFilter: boolean;
  };
}

export interface GetFilterMembersError {
  /** Whether the data fetching is loading */
  isLoading: false;
  /** Whether the data fetching has failed */
  error: Error;
  /** The error if any occurred */
  isError: true;
  /** The result data */
  data: undefined;
  /**
   * Function to load more data rows
   *
   * @internal
   * */
  loadMore: (count: number) => void;
}

/**
 * State for {@link useGetFilterMembers} hook.
 */
export type GetFilterMembersResult = GetFilterMembersError | GetFilterMembersSuccess;

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
  const { data, isLoading, isError, error, loadMore } = useExecuteQueryInternal({
    // prioritize attribute dataSource for the use case of multi-source dashboard
    dataSource: filterAttribute.dataSource
      ? convertDataSource(filterAttribute.dataSource)
      : defaultDataSource,
    dimensions,
    filters: queryFilters,
    count,
  });

  const { app } = useSisenseContext();
  const formattedData = useMemo(() => {
    if (!data) return;
    if (isDatetime(filterAttribute.type)) {
      return {
        ...data,
        rows: data.rows.map((cell) =>
          cell.map((d) => ({
            ...d,
            text: applyDateFormat(
              new Date(d.data),
              getDefaultDateMask((filterAttribute as DimensionalLevelAttribute).granularity),
              app?.settings?.locale,
            ),
          })),
        ),
      };
    }
    return data;
  }, [data, filterAttribute, app]);

  const queriedMembers = useMemo(
    () => (!formattedData ? [] : formattedData.rows.map((r) => r[0])),
    [formattedData],
  );

  const selectedMembers: SelectedMember[] = useMemo(() => {
    const members = castMembersToType(filter.members, filterAttribute.type);
    const deactivatedMembers = castMembersToType(
      filter.config.deactivatedMembers,
      filterAttribute.type,
    );
    return queriedMembers
      .filter(
        (queriedMember) =>
          members.includes(queriedMember.data) || deactivatedMembers.includes(queriedMember.data),
      )
      .map((queriedMember) => ({
        key: queriedMember.data.toString(),
        title: queriedMember.text ?? queriedMember.data.toString(),
        inactive: deactivatedMembers.includes(queriedMember.data),
      }));
  }, [filter.config.deactivatedMembers, filter.members, queriedMembers, filterAttribute.type]);

  const allMembers: Member[] = useMemo(
    () =>
      queriedMembers.map((queriedMember) => ({
        key: queriedMember.data.toString(),
        title: queriedMember.text ?? queriedMember.data.toString(),
      })),
    [queriedMembers],
  );

  const hasBackgroundFilter = !!backgroundFilter && parentFilters.length === 0;

  if (error) {
    return {
      isLoading,
      loadMore,
      isError,
      error,
      data: undefined,
    };
  }

  return {
    isLoading,
    loadMore,
    isError,
    error,
    data: {
      selectedMembers,
      allMembers,
      excludeMembers,
      enableMultiSelection,
      hasBackgroundFilter,
    },
  };
};

/**
 * Hook that fetches members of the provided filter
 *
 * Those members can be used to display a list of members in a third-party filter component such as Material UI Select.
 *
 * * ## Example
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
 * @beta
 */
export const useGetFilterMembers = withTracking('useGetFilterMembers')(useGetFilterMembersInternal);
