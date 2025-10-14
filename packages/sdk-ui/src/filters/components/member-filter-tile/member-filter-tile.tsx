import { FunctionComponent, useCallback } from 'react';

import { Attribute, DataSource, Filter, filterFactory, MembersFilter } from '@sisense/sdk-data';
import merge from 'lodash-es/merge';

import { useGetFilterMembersInternal } from '@/filters/hooks/use-get-filter-members';
import { useSynchronizedFilter } from '@/filters/hooks/use-synchronized-filter';
import { cloneFilterAndToggleDisabled } from '@/utils/filters';

import { asSisenseComponent } from '../../../decorators/component-decorators/as-sisense-component';
import { FilterTileContainer, FilterTileDesignOptions } from '../filter-tile-container';
import { MemberList } from './member-list';
import { Member, SelectedMember } from './members-reducer';
import { PillSection } from './pill-section';

/**
 * Props of the {@link MemberFilterTile} component.
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
  /** Callback indicating when the source members filter should be updated */
  onChange: (filter: Filter | null) => void;
  /** Filter delete callback */
  onDelete?: () => void;
  /** Filter edit callback */
  onEdit?: () => void;
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
    onDelete,
    onEdit,
    onChange: updateFilterFromProps,
    parentFilters = [],
    tileDesignOptions,
  } = props;

  const { filter, updateFilter } = useSynchronizedFilter<MembersFilter>(
    filterFromProps as MembersFilter | null,
    updateFilterFromProps,
    () => filterFactory.members(attribute, []) as MembersFilter,
  );

  const { isError, error, data } = useGetFilterMembersInternal({
    filter,
    defaultDataSource: dataSource,
    parentFilters,
    allowMissingMembers: true,
  });

  if (isError) {
    return <div>{error.message}</div>;
  }

  const { selectedMembers, allMembers, excludeMembers, enableMultiSelection, hasBackgroundFilter } =
    data;

  const updateFilterFromMembersList = useCallback(
    (member: Member, isSelected: boolean) => {
      if (enableMultiSelection) {
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
    [enableMultiSelection, selectedMembers, allMembers, excludeMembers, filter, updateFilter],
  );

  return (
    <div aria-label="member-filter-tile">
      <FilterTileContainer
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
              enableMultiSelection={enableMultiSelection}
              disabled={tileDisabled}
            />
          );
        }}
        disabled={filter.config.disabled}
        onToggleDisabled={() => {
          const newFilter = cloneFilterAndToggleDisabled(filter);
          updateFilter(newFilter);
        }}
        isDependent={parentFilters && parentFilters.length > 0}
        design={merge(tileDesignOptions, {
          header: { hasBackgroundFilter },
        })}
        locked={filter.config.locked}
        onDelete={onDelete}
        onEdit={onEdit}
      />
    </div>
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

  const config = {
    guid: filter.config.guid,
    excludeMembers: excludeMembers,
    deactivatedMembers: inactiveFilterMembers,
    backgroundFilter: filter.config.backgroundFilter,
    enableMultiSelection: filter.config.enableMultiSelection,
  };

  return filterFactory.members(filter.attribute, activeFilterMembers, config) as MembersFilter;
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
