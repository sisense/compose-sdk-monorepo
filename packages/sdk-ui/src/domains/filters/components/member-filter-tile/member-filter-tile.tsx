import { FunctionComponent, useCallback, useMemo, useState } from 'react';

import { Attribute, DataSource, Filter, filterFactory, MembersFilter } from '@sisense/sdk-data';
import debounce from 'lodash-es/debounce';
import merge from 'lodash-es/merge';

import { useGetFilterMembersInternal } from '@/domains/filters/hooks/use-get-filter-members';
import { useSynchronizedFilter } from '@/domains/filters/hooks/use-synchronized-filter';
import {
  applyMemberToggle,
  asClearAllSelection,
  asSelectAllSelection,
  toggleSelectedMemberActivation,
  withMembersFilterSelection,
} from '@/domains/filters/shared/members-filter-selection';
import { asSisenseComponent } from '@/infra/decorators/component-decorators/as-sisense-component';
import ErrorBoundaryBox from '@/infra/error-boundary/error-boundary-box';
import { cloneFilterAndToggleDisabled } from '@/shared/utils/filters';

import { useFilterTileMenuItems } from '../../shared/use-filter-tile-menu-items/use-filter-tile-menu-items';
import { ScrollWrapperOnScrollEvent } from '../filter-editor-popover/common/scroll-wrapper';
import { FilterTileContainer, FilterTileDesignOptions } from '../filter-tile-container';
import { FilterTileConfig } from '../filter-tile/types';
import { MemberList } from './member-list';
import { Member } from './members-reducer';
import { PillSection } from './pill-section';

const LIST_SCROLL_LOAD_MORE_THRESHOLD = 0.75;
const QUERY_MEMBERS_COUNT = 50;
const SEARCH_VALUE_UPDATE_DELAY = 300;

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
  /**
   * Configuration for the filter tile.
   */
  config?: FilterTileConfig;

  /**
   * Render header title
   *
   * @internal
   */
  renderHeaderTitle?: (title: React.ReactNode) => React.ReactNode;
  /**
   * When true, the tile is linked to a FilterWidget and rendered read-only.
   *
   * @internal
   */
  linked?: boolean;
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
    config,
    renderHeaderTitle,
    linked,
  } = props;

  const [searchValue, setSearchValue] = useState('');
  const [searchFilter, setSearchFilter] = useState<Filter>(filterFactory.contains(attribute, ''));
  const debouncedSetSearchFilter = useMemo(
    () =>
      debounce(
        (search: string) => setSearchFilter(filterFactory.contains(attribute, search)),
        SEARCH_VALUE_UPDATE_DELAY,
      ),
    [attribute],
  );
  const onSearchValueChange = useCallback(
    (search: string) => {
      setSearchValue(search);
      debouncedSetSearchFilter(search);
    },
    [debouncedSetSearchFilter],
  );

  const { filter, updateFilter } = useSynchronizedFilter<MembersFilter>(
    filterFromProps as MembersFilter | null,
    updateFilterFromProps,
    () => filterFactory.members(attribute, []) as MembersFilter,
  );

  const menuItems = useFilterTileMenuItems(filter, config, updateFilter);

  const {
    isError,
    error,
    data,
    loadMore: loadMoreMembers,
    isLoading: membersLoading,
    isAllItemsLoaded: membersAllItemsLoaded,
  } = useGetFilterMembersInternal({
    filter,
    defaultDataSource: dataSource,
    parentFilters: useMemo(() => [...parentFilters, searchFilter], [searchFilter, parentFilters]),
    allowMissingMembers: true,
    count: QUERY_MEMBERS_COUNT,
  });

  // The members query can resolve to an error state, in which case `data` is
  // `undefined`. Fall back to neutral values so the hooks below always run in a
  // stable order — returning early before them would skip hooks on the error
  // render and trigger React's "Rendered fewer hooks than expected" crash.
  const { selectedMembers, allMembers, excludeMembers, enableMultiSelection, hasBackgroundFilter } =
    data ?? {
      selectedMembers: [],
      allMembers: [],
      excludeMembers: false,
      enableMultiSelection: false,
      hasBackgroundFilter: false,
    };

  const updateFilterFromMembersList = useCallback(
    (member: Member, isSelected: boolean) => {
      const nextSelection = applyMemberToggle(
        { selectedMembers, excludeMembers },
        member,
        isSelected,
        {
          enableMultiSelection,
          loadedMembersCount: allMembers.length,
          allItemsLoaded: membersAllItemsLoaded,
          hasSearchFilter: searchValue.length > 0,
        },
      );
      updateFilter(withMembersFilterSelection(filter, nextSelection));
    },
    [
      enableMultiSelection,
      selectedMembers,
      allMembers,
      excludeMembers,
      filter,
      updateFilter,
      membersAllItemsLoaded,
      searchValue,
    ],
  );

  const handleMembersListScroll = useCallback(
    ({ top, direction }: ScrollWrapperOnScrollEvent) => {
      if (!membersLoading && top > LIST_SCROLL_LOAD_MORE_THRESHOLD && direction === 'down') {
        loadMoreMembers(QUERY_MEMBERS_COUNT);
      }
    },
    [loadMoreMembers, membersLoading],
  );

  return (
    <FilterTileContainer
      title={title}
      renderHeaderTitle={renderHeaderTitle}
      renderContent={(collapsed, tileDisabled) => {
        // Surface query failures (e.g. a filter whose dimension is missing from the
        // data model) as a contained error box inside the tile, keeping the tile
        // header and controls, rather than dumping the raw error message.
        if (isError) {
          return <ErrorBoundaryBox error={error} />;
        }
        if (collapsed) {
          return (
            <PillSection
              selectedMembers={selectedMembers}
              // Linked tiles are read-only — no member toggling from the panel.
              onToggleSelectedMember={
                linked
                  ? undefined
                  : (memberKey) => {
                      updateFilter(
                        withMembersFilterSelection(filter, {
                          selectedMembers: toggleSelectedMemberActivation(
                            selectedMembers,
                            memberKey,
                          ),
                          excludeMembers,
                        }),
                      );
                    }
              }
              excludeMembers={excludeMembers}
              disabled={tileDisabled}
            />
          );
        }
        return (
          <MemberList
            members={allMembers}
            isMembersLoading={membersLoading}
            selectedMembers={selectedMembers}
            onSelectMember={updateFilterFromMembersList}
            checkAllMembers={() =>
              updateFilter(withMembersFilterSelection(filter, asSelectAllSelection()))
            }
            uncheckAllMembers={() =>
              updateFilter(withMembersFilterSelection(filter, asClearAllSelection()))
            }
            excludeMembers={excludeMembers}
            enableMultiSelection={enableMultiSelection}
            disabled={tileDisabled}
            onListScroll={handleMembersListScroll}
            searchValue={searchValue}
            onSearchValueChange={onSearchValueChange}
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
      toggleVisible={config?.actions?.toggleFilter?.visible}
      expandVisible={config?.actions?.expandFilter?.visible}
      linked={linked}
      menuItems={menuItems}
      onDelete={onDelete}
      onEdit={onEdit}
    />
  );
});
