import {
  Attribute,
  convertDataSource,
  DataSource,
  Filter,
  isNumber,
  MembersFilter,
} from '@sisense/sdk-data';
import { FunctionComponent, useCallback, useMemo } from 'react';
import { Member, SelectedMember } from './members-reducer';
import { asSisenseComponent } from '../../../decorators/component-decorators/as-sisense-component';
import { useExecuteQueryInternal } from '../../../query-execution/use-execute-query';
import { FilterTile, FilterTileDesignOptions } from '../filter-tile';
import { useSynchronizedFilter } from '@/filters/hooks/use-synchronized-filter';
import { PillSection } from './pill-section';
import { MemberList } from './member-list';
import merge from 'lodash-es/merge';
import { cloneFilterAndToggleDisabled } from '@/utils/filters';

/**
 * Props for {@link MemberFilterTile}
 */
export interface MemberFilterTileProps {
  /** Title for the filter tile, which is rendered into the header */
  title: string;
  /**
   * Data source the query is run against - e.g. `Sample ECommerce`
   *
   * If not specified, the query will use the `defaultDataSource` specified in the parent Sisense Context.
   */
  dataSource?: DataSource;
  /** Attribute to filter on. A query will run to fetch all this attribute's members */
  attribute: Attribute;
  /** Source filter object. Caller is responsible for keeping track of filter state */
  filter: Filter | null;
  /** Callback indicating when the source member filter object should be updated */
  onChange: (filter: Filter | null) => void;
  /** List of filters this filter is dependent on */
  parentFilters?: Filter[];
  /** Design options for the tile @internal */
  tileDesignOptions?: FilterTileDesignOptions;
}

/**
 * UI component that allows the user to select members to include/exclude in a
 * filter. A query is executed against the provided data source to fetch
 * all members that are selectable.
 *
 * @example
 * Below is an example for filtering countries in the `Country` dimension of the `Sample ECommerce` data model.
 * ```tsx
 * const [countryFilter, setCountryFilter] = useState<Filter | null>(null);
 *
 * return (
 * <MemberFilterTile
 *   title={'Country'}
 *   attribute={DM.Country.Country}
 *   filter={countryFilter}
 *   onChange={setCountryFilter}
 * />
 * );
 * ```
 *
 * <img src="media://member-filter-tile-example-1.png" width="300px" />
 * @param props - Member filter tile props
 * @returns Member filter tile component
 * @group Filter Tiles
 */
export const MemberFilterTile: FunctionComponent<MemberFilterTileProps> = asSisenseComponent({
  componentName: 'MemberFilterTile',
})((props) => {
  const {
    title,
    attribute,
    filter: filterFromProps,
    dataSource,
    onChange: updateFilterFromProps,
    parentFilters = [],
    tileDesignOptions,
  } = props;
  const { backgroundFilter } = (filterFromProps as MembersFilter) ?? {};

  const { filter, updateFilter } = useSynchronizedFilter<MembersFilter>(
    filterFromProps as MembersFilter | null,
    updateFilterFromProps,
    () => new MembersFilter(attribute, []),
  );

  const multiSelection = filter.multiSelection;
  const excludeMembers = filter.excludeMembers;

  // TODO: this is a temporary fix for useExecuteQuery so the reference to
  // "dimensions" does not change on every render, causing infinite rerenders.
  const dimensions = useMemo(() => [attribute], [attribute]);
  const queryFilters = [...parentFilters];

  if (backgroundFilter) {
    queryFilters.push(backgroundFilter);
  }

  const { data, error } = useExecuteQueryInternal({
    // prioritize attribute dataSource for the use case of multi-source dashboard
    dataSource: attribute.dataSource ? convertDataSource(attribute.dataSource) : dataSource,
    dimensions,
    filters: queryFilters,
  });

  const queriedMembers = useMemo(() => (!data ? [] : data.rows.map((r) => r[0])), [data]);

  const selectedMembers: SelectedMember[] = useMemo(() => {
    const members = alignMembersType(filter.members, attribute.type);
    const deactivatedMembers = alignMembersType(filter.deactivatedMembers, attribute.type);
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
  }, [filter.deactivatedMembers, filter.members, queriedMembers, attribute.type]);

  const allMembers: Member[] = useMemo(
    () =>
      queriedMembers.map((queriedMember) => ({
        key: queriedMember.data.toString(),
        title: queriedMember.text ?? queriedMember.data.toString(),
      })),
    [queriedMembers],
  );

  const hasBackgroundFilterIcon = !!backgroundFilter && parentFilters.length === 0;

  const updateFilterFromMembersList = useCallback(
    (member: Member, isSelected: boolean) => {
      if (multiSelection) {
        const newSelectedMembers = isSelected
          ? addSelectedMember(selectedMembers, member)
          : removeSelectedMember(selectedMembers, member);

        updateFilter(
          // if all members are excluded, we should reset the filter to exclude none to match the behavior in Fusion
          newSelectedMembers.length === allMembers.length && excludeMembers
            ? withSelectedMembers(filter, [], false)
            : withSelectedMembers(filter, newSelectedMembers, excludeMembers),
        );
      } else {
        updateFilter(withSelectedMembers(filter, [member], excludeMembers));
      }
    },
    [multiSelection, selectedMembers, allMembers, excludeMembers, filter, updateFilter],
  );

  if (error) {
    throw error;
  }
  if (!data) {
    return null;
  }

  return (
    <FilterTile
      title={title}
      renderContent={(collapsed, tileDisabled) => {
        if (collapsed) {
          return (
            <PillSection
              members={allMembers}
              selectedMembers={selectedMembers}
              onToggleSelectedMember={(memberKey) => {
                const newSelectedMembers = toggleActivationInSelectedMemberByMemberKey(
                  selectedMembers,
                  memberKey,
                );
                updateFilter(withSelectedMembers(filter, newSelectedMembers, excludeMembers));
              }}
              excludeMembers={excludeMembers}
              disabled={tileDisabled}
            />
          );
        }
        return (
          <MemberList
            members={allMembers}
            selectedMembers={selectedMembers}
            onSelectMember={updateFilterFromMembersList}
            checkAllMembers={() => updateFilter(withSelectedMembers(filter, [], true))}
            uncheckAllMembers={() => updateFilter(withSelectedMembers(filter, [], false))}
            excludeMembers={excludeMembers}
            multiSelection={multiSelection}
            disabled={tileDisabled}
          />
        );
      }}
      disabled={filter.disabled}
      onToggleDisabled={() => {
        const newFilter = cloneFilterAndToggleDisabled(filter);
        updateFilter(newFilter);
      }}
      isDependent={parentFilters && parentFilters.length > 0}
      design={merge(tileDesignOptions, {
        header: { hasBackgroundFilterIcon },
      })}
      locked={filter.locked}
    />
  );
});

/**
 * Creates new MembersFilter with new selected members list
 */
function withSelectedMembers(
  filter: MembersFilter,
  selectedMembers: SelectedMember[],
  excludeMembers: boolean,
): MembersFilter {
  const { activeFilterMembers, inactiveFilterMembers } =
    splitToActiveAndInactiveFilterMembers(selectedMembers);

  return new MembersFilter(
    filter.attribute,
    activeFilterMembers,
    excludeMembers,
    filter.guid,
    inactiveFilterMembers,
    filter.backgroundFilter,
    filter.multiSelection,
  );
}

/**
 * Splits all selected members into active and inactive filter members.
 *
 * @param selectedMembers - all selected members, both active and inactive
 */
function splitToActiveAndInactiveFilterMembers(selectedMembers: SelectedMember[]): {
  activeFilterMembers: string[];
  inactiveFilterMembers: string[];
} {
  const splittedFilterMembers: {
    activeFilterMembers: string[];
    inactiveFilterMembers: string[];
  } = {
    activeFilterMembers: [],
    inactiveFilterMembers: [],
  };
  selectedMembers.forEach((selectedMember) => {
    if (selectedMember.inactive) {
      splittedFilterMembers.inactiveFilterMembers.push(selectedMember.key);
    } else {
      splittedFilterMembers.activeFilterMembers.push(selectedMember.key);
    }
  });
  return splittedFilterMembers;
}

/**
 * Returns new `selectedMembers` array with added `selectedMemberToAdd`.
 * Won't add this member if it's already present in `selectedMembers`.
 */
function addSelectedMember(
  selectedMembers: SelectedMember[],
  selectedMemberToAdd: SelectedMember,
): SelectedMember[] {
  if (!selectedMembers.some((selectedMember) => selectedMember.key === selectedMemberToAdd.key)) {
    return [...selectedMembers, selectedMemberToAdd];
  }
  return selectedMembers;
}

/**
 * Returns new `selectedMembers` array without `selectedMemberToRemove`.
 */
function removeSelectedMember(
  selectedMembers: SelectedMember[],
  selectedMemberToRemove: SelectedMember,
): SelectedMember[] {
  return selectedMembers.filter(
    (selectedMember) => selectedMember.key !== selectedMemberToRemove.key,
  );
}

/**
 * Returns new `selectedMembers` array with toggled activation of one member.
 */
function toggleActivationInSelectedMemberByMemberKey(
  selectedMembers: SelectedMember[],
  selectedMemberKeyToToggleActivation: string,
): SelectedMember[] {
  return selectedMembers.map((selectedMember) =>
    selectedMember.key === selectedMemberKeyToToggleActivation
      ? { ...selectedMember, inactive: !selectedMember.inactive }
      : selectedMember,
  );
}

/**
 * Returns new `members` array with members transformed to required type.
 */
function alignMembersType(members: any[], type: string) {
  return members.map((member) => (isNumber(type) ? Number(member) : member.toString()));
}
