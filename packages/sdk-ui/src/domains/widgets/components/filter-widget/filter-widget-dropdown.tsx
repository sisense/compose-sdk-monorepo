import { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  DateLevels,
  DimensionalLevelAttribute,
  filterFactory,
  MembersFilter,
  MetadataTypes,
} from '@sisense/sdk-data';
import type { Attribute, Filter } from '@sisense/sdk-data';
import debounce from 'lodash-es/debounce';

import { ScrollWrapperOnScrollEvent } from '@/domains/filters/components/filter-editor-popover/common/scroll-wrapper';
import { SingleSelect } from '@/domains/filters/components/filter-editor-popover/common/select';
import { SearchableMultiSelect } from '@/domains/filters/components/filter-editor-popover/common/select/searchable-multi-select';
import { SearchableSingleSelect } from '@/domains/filters/components/filter-editor-popover/common/select/searchable-single-select';
import type { SelectItem } from '@/domains/filters/components/filter-editor-popover/common/select/types';
import { granularities } from '@/domains/filters/components/filter-editor-popover/sections/common/granularities';
import type { SelectedMember } from '@/domains/filters/components/member-filter-tile/members-reducer';
import { useGetFilterMembersInternal } from '@/domains/filters/hooks/use-get-filter-members';
import { useSynchronizedFilter } from '@/domains/filters/hooks/use-synchronized-filter';
import { useFireOnReady } from '@/domains/widgets/hooks/use-fire-on-ready';
import { usePrevious } from '@/shared/hooks/use-previous';
import { createLevelAttribute } from '@/shared/utils/create-level-attribute';
import { isSameAttribute } from '@/shared/utils/filters';

import { filterWidgetDesign, membersFilterWidgetDesign } from './filter-widget-design';
import type { FilterWidgetProps } from './types';

const LIST_SCROLL_LOAD_MORE_THRESHOLD = 0.75;
const QUERY_MEMBERS_COUNT = 50;
const SEARCH_VALUE_UPDATE_DELAY = 300;

type FilterWidgetDropdownProps = Pick<
  FilterWidgetProps,
  'attribute' | 'dataSource' | 'isMultiselect' | 'filter' | 'parentFilters' | 'excludedDateLevels'
> & {
  /**
   * Called when the user changes the filter selection. The host widget wraps
   * this into its unified `onChange` channel as a `filter/changed` event.
   */
  onFilterUpdate?: (filter: Filter | null) => void;
  /**
   * Called when the user picks a different date granularity, with the attribute
   * at the new level. The host widget wraps this into its unified `onChange`
   * channel as a `dateLevel/changed` event (e.g. to sync Fusion widget metadata).
   */
  onDateLevelChange?: (attribute: Attribute) => void;
  /**
   * Calls the provided callback on every rising edge of readiness — after member data loads
   * successfully and the list is ready to display, including after subsequent
   * reloads (e.g. dimension change, refetch). Used by the host FilterWidget to
   * surface the `onRender` prop.
   */
  onReady?: () => void;
};

/**
 * Effective selection mode for the dropdown. The widget and its linked dashboard filter
 * must stay in sync: even a single-select-configured widget renders the multi-select
 * control when the backing filter actually carries multiple members (or is multi-enabled),
 * so external changes to the shared filter (e.g. dashboard cross-filtering) are reflected
 * instead of being truncated to the first member.
 * @internal
 */
export function getEffectiveMultiselect(
  widgetMultiselect: boolean,
  selectedCount: number,
  filterMultiSelection: boolean | undefined,
): boolean {
  return widgetMultiselect || selectedCount > 1 || !!filterMultiSelection;
}

/**
 * Reduces a member selection to a single deterministic member (the alphabetically first)
 * when it holds more than one, for switching a filter from multi- to single-select.
 * @param members - Current member selection (treated as immutable).
 * @returns A newly-allocated array: the single retained member, or a copy of the input.
 * @internal
 */
export function asSingleSelectionMembers(members: readonly string[]): string[] {
  return members.length > 1 ? [[...members].sort()[0]] : [...members];
}

/**
 * Renders a searchable member-select dropdown using the existing CSDK filter editor select
 * components (SearchableMultiSelect / SearchableSingleSelect).
 *
 * For datetime attributes, renders two side-by-side dropdowns: a date-level granularity
 * selector (Year / Quarter / Month / Week / Day) and a searchable member value selector,
 * matching the Fusion filter editor popup UI.
 *
 * Used internally by FilterWidget to provide the 'members' filter type UI.
 */
export const FilterWidgetDropdown: FunctionComponent<FilterWidgetDropdownProps> = ({
  attribute,
  dataSource,
  isMultiselect = true,
  filter: filterFromProps = null,
  onFilterUpdate: updateFilterFromProps,
  parentFilters = [],
  onDateLevelChange,
  onReady,
  excludedDateLevels,
}) => {
  const { t } = useTranslation();

  // LevelAttribute (e.g. DM.Commerce.Date.Years) has type 'datelevel'; plain datetime
  // attributes created via createAttribute({type:'datetime'}) also qualify.
  const isDateAttribute =
    attribute.type === MetadataTypes.DateLevel || attribute.type === 'datetime';

  // ── Date granularity (date attributes only) ──────────────────────────────
  // Seed from the attribute's own granularity when it's already a LevelAttribute
  // (e.g. DM.Commerce.Date.Years passes granularity='Years'), otherwise default to Years.
  const [dateGranularity, setDateGranularity] = useState<string>(
    // Cast rationale: `granularity` exists only on LevelAttribute; for plain
    // (non-date) attributes the property is undefined and the fallback applies.
    (attribute as DimensionalLevelAttribute).granularity ?? DateLevels.Years,
  );

  // Resync local granularity during render when the host swaps dimension or level
  // (empty → Quarters, or Years → Quarters on the same expression). Use
  // `incomingGranularity` for derived work on that render — setState below still
  // holds the previous value until the follow-up render.
  const incomingGranularity =
    (attribute as DimensionalLevelAttribute).granularity ?? DateLevels.Years;
  const [trackedAttribute, setTrackedAttribute] = useState(() => ({
    expression: attribute.expression,
    granularity: incomingGranularity,
  }));
  const hostLevelChanged =
    attribute.expression !== trackedAttribute.expression ||
    incomingGranularity !== trackedAttribute.granularity;
  if (hostLevelChanged) {
    setTrackedAttribute({
      expression: attribute.expression,
      granularity: incomingGranularity,
    });
    setDateGranularity(incomingGranularity);
  }
  const resolvedGranularity = hostLevelChanged ? incomingGranularity : dateGranularity;

  // For date attributes, create a LevelAttribute that includes the selected granularity.
  // For non-date attributes the plain attribute is used as-is.
  const effectiveAttribute = useMemo(() => {
    if (!isDateAttribute || !attribute.expression) return attribute;
    // Cast rationale: isDateAttribute guarantees a datetime attribute here.
    return createLevelAttribute(attribute as DimensionalLevelAttribute, resolvedGranularity);
  }, [isDateAttribute, attribute, resolvedGranularity]);

  // searchFilter drives the text-search API query for list (non-date) dimensions.
  // For date dimensions this is unused — member fetch is driven by the level attribute only.
  const [searchFilter, setSearchFilter] = useState<Filter>(() =>
    attribute.expression
      ? filterFactory.contains(attribute, '')
      : filterFactory.members(attribute, []),
  );

  // Resync the text-search filter when the DIMENSION changes. Date granularity on the
  // same expression is owned by `handleDateLevelChange` / the render sync above.
  const prevExpressionRef = useRef(attribute.expression);
  useEffect(() => {
    if (prevExpressionRef.current === attribute.expression) return;
    prevExpressionRef.current = attribute.expression;
    setSearchFilter(
      attribute.expression
        ? filterFactory.contains(attribute, '')
        : filterFactory.members(attribute, []),
    );
  }, [attribute]);

  const debouncedSetSearchFilter = useMemo(
    () =>
      debounce(
        (search: string) =>
          setSearchFilter(
            attribute.expression
              ? filterFactory.contains(attribute, search)
              : filterFactory.members(attribute, []),
          ),
        SEARCH_VALUE_UPDATE_DELAY,
      ),
    [attribute],
  );

  const onSearchUpdate = useCallback(
    (search: string) => {
      debouncedSetSearchFilter(search);
    },
    [debouncedSetSearchFilter],
  );

  // Cast rationale: the 'members' filter type UI operates on MembersFilter; a
  // non-members filter injected for the same dimension is intentionally taken
  // over as a members filter on first user selection (same-dim override
  // semantics), preserving its guid via withSelectedMembers.
  const { filter, updateFilter } = useSynchronizedFilter<MembersFilter>(
    filterFromProps as MembersFilter | null,
    updateFilterFromProps as (f: MembersFilter) => void,
    () =>
      filterFactory.members(effectiveAttribute, [], {
        enableMultiSelection: isMultiselect,
      }) as MembersFilter,
  );

  // Keep the filter's selection mode aligned with the widget's `isMultiselect` config when
  // it is toggled live (widget editor / standalone). The synchronized filter's
  // `enableMultiSelection` is seeded only once, so without this a toggle would be ignored —
  // the control stayed multi after switching to single (SNS-131674). Switching to
  // single-select also drops the selection to a single member, since a single-select control
  // cannot hold several — mirroring the filter editor popup's MembersSection. Switching back
  // to multi keeps the current members.
  const prevIsMultiselect = usePrevious(isMultiselect);
  useEffect(() => {
    if (
      prevIsMultiselect === undefined ||
      prevIsMultiselect === isMultiselect ||
      !updateFilterFromProps
    ) {
      return;
    }
    const nextMembers = isMultiselect ? filter.members : asSingleSelectionMembers(filter.members);
    updateFilter(
      // Cast rationale: filterFactory.members returns the base Filter type but always
      // constructs a MembersFilter (same as createEmptyFilter / withSelectedMembers).
      filterFactory.members(filter.attribute, nextMembers, {
        guid: filter.config.guid,
        excludeMembers: filter.config.excludeMembers,
        deactivatedMembers: filter.config.deactivatedMembers,
        backgroundFilter: filter.config.backgroundFilter,
        enableMultiSelection: isMultiselect,
      }) as MembersFilter,
    );
  }, [isMultiselect, prevIsMultiselect, filter, updateFilter, updateFilterFromProps]);

  // Rebuild when dimension or date granularity changes. Filter is seeded once, so
  // expression-only comparison misses host level pushes (empty→Quarters or
  // Years→Quarters) while the seeded filter still carries the previous level.
  useEffect(() => {
    if (!updateFilterFromProps) return;
    if (isSameAttribute(filter.attribute, effectiveAttribute)) return;
    updateFilter(
      // Cast rationale: filterFactory.members returns the base Filter type but always
      // constructs a MembersFilter (same as the createEmptyFilter seed above).
      filterFactory.members(effectiveAttribute, [], {
        enableMultiSelection: isMultiselect,
      }) as MembersFilter,
    );
  }, [filter, effectiveAttribute, isMultiselect, updateFilter, updateFilterFromProps]);

  const membersQueryAligned =
    Boolean(effectiveAttribute.expression) && isSameAttribute(filter.attribute, effectiveAttribute);

  const {
    data,
    loadMore: loadMoreMembers,
    isLoading: membersLoading,
  } = useGetFilterMembersInternal({
    filter,
    defaultDataSource: dataSource,
    // Date dimensions: skip the text-search parentFilter — granularity handles scoping.
    parentFilters: useMemo(
      () => (isDateAttribute ? parentFilters : [...parentFilters, searchFilter]),
      [isDateAttribute, parentFilters, searchFilter],
    ),
    allowMissingMembers: true,
    count: QUERY_MEMBERS_COUNT,
    // No dimension picked yet (the editor mounts the dropdown before one exists) —
    // an empty-dim query is rejected by the analytical engine ("Jaql element
    // doesn't contain dim"), so keep it disabled until a real attribute arrives.
    // Matching expression + date level (via isSameAttribute) suppresses the
    // transient render between a prop swap and the rebuilding effect above.
    enabled: membersQueryAligned,
  });

  // `useExecuteQueryInternal` keeps prior rows while params change / query is
  // disabled — drop them so the list does not flash members from the previous
  // date level (e.g. Years) under an already-updated Quarters UI.
  const alignedMembersData = membersQueryAligned ? data : undefined;

  useFireOnReady(!membersLoading && alignedMembersData !== undefined, onReady);

  const { selectedMembers, allMembers, excludeMembers, enableMultiSelection } =
    alignedMembersData ?? {
      selectedMembers: [],
      allMembers: [],
      excludeMembers: false,
      enableMultiSelection: filter.config.enableMultiSelection ?? false,
    };

  // Map Member[] to SelectItem<string>[]
  const items: SelectItem<string>[] = useMemo(
    () => allMembers.map((m) => ({ value: m.key, displayValue: m.title })),
    [allMembers],
  );

  const selectedKeys: string[] = useMemo(
    () => selectedMembers.filter((m) => !m.inactive).map((m) => m.key),
    [selectedMembers],
  );

  const selectedKey: string | undefined = selectedKeys[0];

  // Keep the widget in sync with its linked filter: reflect all members even if the
  // widget itself was configured single-select but the shared filter gained several.
  const effectiveMultiselect = getEffectiveMultiselect(
    isMultiselect,
    selectedKeys.length,
    enableMultiSelection,
  );

  const handleListScroll = useCallback(
    ({ top, direction }: ScrollWrapperOnScrollEvent) => {
      if (!membersLoading && top > LIST_SCROLL_LOAD_MORE_THRESHOLD && direction === 'down') {
        loadMoreMembers(QUERY_MEMBERS_COUNT);
      }
    },
    [loadMoreMembers, membersLoading],
  );

  // ── Multiselect ────────────────────────────────────────────────────────────
  const handleMultiChange = useCallback(
    (newKeys: string[]) => {
      const newSelectedMembers: SelectedMember[] = newKeys.map((key) => {
        const member = allMembers.find((m) => m.key === key);
        return { key, title: member?.title ?? key, inactive: false };
      });
      updateFilter(withSelectedMembers(filter, newSelectedMembers, excludeMembers));
    },
    [allMembers, excludeMembers, filter, updateFilter],
  );

  // ── Single-select ──────────────────────────────────────────────────────────
  const [singleSelectKey, setSingleSelectKey] = useState(0);

  const handleSingleChange = useCallback(
    (key: string) => {
      const member = allMembers.find((m) => m.key === key);
      const selectedMember: SelectedMember = { key, title: member?.title ?? key, inactive: false };
      updateFilter(withSelectedMembers(filter, [selectedMember], excludeMembers));
      setSingleSelectKey((k) => k + 1);
    },
    [allMembers, excludeMembers, filter, updateFilter],
  );

  // ── Date level change ──────────────────────────────────────────────────────
  const translatedGranularities = useMemo(
    () =>
      granularities
        .filter((g) => !(excludedDateLevels ?? []).includes(g.value))
        .map((g) => ({ ...g, displayValue: t(g.displayValue) })),
    [t, excludedDateLevels],
  );

  const handleDateLevelChange = useCallback(
    (newGranularity: string) => {
      setDateGranularity(newGranularity);
      // Cast rationale: the date-level selector only renders for datetime attributes.
      const newAttr = createLevelAttribute(attribute as DimensionalLevelAttribute, newGranularity);
      // Reset selection and notify parent with an empty filter at the new level.
      updateFilter(
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- factory returns base Filter; updateFilter expects MembersFilter
        filterFactory.members(newAttr, [], {
          enableMultiSelection: isMultiselect,
        }) as MembersFilter,
      );
      // Report the level change as a widget-level event so the host can keep
      // its dimension metadata in sync with the selected granularity.
      onDateLevelChange?.(newAttr);
    },
    [attribute, isMultiselect, updateFilter, onDateLevelChange],
  );

  const placeholder = t('filterWidget.placeholders.setFilter');

  // When no dimension has been selected yet (placeholder attribute with empty expression),
  // render a minimal placeholder instead of making broken queries.
  // All hooks are called above unconditionally to satisfy the Rules of Hooks.
  const design = membersFilterWidgetDesign;

  if (!attribute.expression) {
    return (
      <div
        data-testid="filter-widget-no-dimension"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          ...filterWidgetDesign.noDimPlaceholder,
        }}
      >
        {t(
          'filterWidget.selectDimensionPlaceholder',
          'Select a dimension to configure this filter',
        )}
      </div>
    );
  }

  // All rows (label, list selector, date selectors) sit inside the SAME padded
  // container, so every dimension variant shares identical outer box metrics.
  // Dropdowns use width 100% / flex and follow the container as it resizes
  // between minWidth and maxWidth — no per-control pixel widths.
  return (
    <div
      data-testid="filter-widget-dropdown"
      style={{
        padding: `${design.padding.top}px ${design.padding.right}px ${design.padding.bottom}px ${design.padding.left}px`,
        width: '100%',
        minWidth: design.minWidth,
        maxWidth: design.maxWidth,
        boxSizing: 'border-box',
      }}
    >
      {isDateAttribute ? (
        <div style={{ display: 'flex', gap: design.dateRow.gap, width: '100%' }}>
          <div data-testid="filter-widget-date-level-select" style={{ flex: 1, minWidth: 0 }}>
            <SingleSelect<string>
              style={{ width: '100%' }}
              fieldStyle={design.selectField}
              value={resolvedGranularity}
              items={translatedGranularities}
              onChange={handleDateLevelChange}
            />
          </div>
          <div data-testid="filter-widget-members-select" style={{ flex: 1, minWidth: 0 }}>
            {effectiveMultiselect ? (
              <SearchableMultiSelect<string>
                width="100%"
                values={selectedKeys}
                placeholder={placeholder}
                placeholderColor={design.placeholder.color}
                onChange={handleMultiChange}
                onListScroll={handleListScroll}
                showListLoader={membersLoading}
                showSearch={false}
                items={items}
                fieldStyle={design.selectField}
              />
            ) : (
              <SearchableSingleSelect<string>
                key={singleSelectKey}
                width="100%"
                value={selectedKey}
                placeholder={placeholder}
                placeholderColor={design.placeholder.color}
                onChange={handleSingleChange}
                onListScroll={handleListScroll}
                showListLoader={membersLoading}
                showSearch={false}
                items={items}
                fieldStyle={design.selectField}
              />
            )}
          </div>
        </div>
      ) : (
        <div data-testid="filter-widget-members-select">
          {effectiveMultiselect ? (
            <SearchableMultiSelect<string>
              items={items}
              values={selectedKeys}
              placeholder={placeholder}
              placeholderColor={design.placeholder.color}
              onChange={handleMultiChange}
              onListScroll={handleListScroll}
              showListLoader={membersLoading}
              onSearchUpdate={onSearchUpdate}
              width="100%"
              fieldStyle={design.selectField}
            />
          ) : (
            <SearchableSingleSelect<string>
              key={singleSelectKey}
              items={items}
              value={selectedKey}
              placeholder={placeholder}
              placeholderColor={design.placeholder.color}
              onChange={handleSingleChange}
              onListScroll={handleListScroll}
              showListLoader={membersLoading}
              onSearchUpdate={onSearchUpdate}
              width="100%"
              fieldStyle={design.selectField}
            />
          )}
        </div>
      )}
    </div>
  );
};

function withSelectedMembers(
  filter: MembersFilter,
  selectedMembers: SelectedMember[],
  excludeMembers: boolean,
): MembersFilter {
  const active = selectedMembers.filter((m) => !m.inactive).map((m) => m.key);
  const inactive = selectedMembers.filter((m) => m.inactive).map((m) => m.key);
  // Cast rationale: filterFactory.members returns the base Filter type but always
  // constructs a MembersFilter instance.
  return filterFactory.members(filter.attribute, active, {
    guid: filter.config.guid,
    excludeMembers,
    deactivatedMembers: inactive,
    backgroundFilter: filter.config.backgroundFilter,
    enableMultiSelection: filter.config.enableMultiSelection,
  }) as MembersFilter;
}
