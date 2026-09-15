import { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  DateLevels,
  DimensionalLevelAttribute,
  filterFactory,
  isIncludeAllMembersFilter,
  isLevelAttribute,
  isMembersFilter,
  MembersFilter,
  Sort,
} from '@sisense/sdk-data';
import type { Attribute, Filter } from '@sisense/sdk-data';
import debounce from 'lodash-es/debounce';

import {
  type DatetimeAttributeStats,
  useGetAttributeStats,
} from '@/domains/filters/components/filter-editor-popover/hooks/use-get-attribute-stats';
import { granularities } from '@/domains/filters/components/filter-editor-popover/sections/common/granularities';
import type {
  Member,
  SelectedMember,
} from '@/domains/filters/components/member-filter-tile/members-reducer';
import { useGetFilterMembersInternal } from '@/domains/filters/hooks/use-get-filter-members';
import { useSynchronizedFilter } from '@/domains/filters/hooks/use-synchronized-filter';
import { getFilterAttributeValueType } from '@/domains/filters/shared/filter-attribute-value-type.js';
import {
  applyMemberToggle,
  asClearAllSelection,
  asSelectAllSelection,
  withMembersFilterSelection,
} from '@/domains/filters/shared/members-filter-selection';
import type { MembersFilterSelection } from '@/domains/filters/shared/members-filter-selection';
import { useFireOnReady } from '@/domains/widgets/hooks/use-fire-on-ready';
import { usePrevious } from '@/shared/hooks/use-previous';
import { createLevelAttribute } from '@/shared/utils/create-level-attribute';
import { isSameAttribute } from '@/shared/utils/filters';

import { ConditionFilter, DatePickerFilter, FilterSelect, PeriodFilter } from './components';
import type { DropdownScrollEvent } from './components';
import { isEditableNumericConditionFilter } from './components/condition-numeric.js';
import { isEditableTextConditionFilter } from './components/condition-text.js';
import { asDateMembers, asDateText, asDateTexts } from './components/date-picker-members';
import { useDateMask } from './components/use-date-mask';
import {
  asBackgroundFilter,
  withBackgroundFilter,
  withoutBackgroundFilter,
} from './dimension-restriction';
import {
  filterWidgetDesign,
  membersFilterWidgetDesign,
  resolveFilterWidgetControlStyle,
} from './filter-widget-design';
import { FilterWidgetSetup } from './filter-widget-setup';
import filterWidgetSetupImage from './images/filter-widget-setup.svg';
import type { FilterWidgetControlStyleOptions, FilterWidgetProps } from './types';

const BORDER_BOX = 'border-box' as const;
const LIST_SCROLL_LOAD_MORE_THRESHOLD = 0.75;
const QUERY_MEMBERS_COUNT = 50;
const SEARCH_VALUE_UPDATE_DELAY = 300;

type FilterWidgetDropdownProps = Pick<
  FilterWidgetProps,
  | 'attribute'
  | 'dataSource'
  | 'isMultiselect'
  | 'filter'
  | 'filterType'
  | 'parentFilters'
  | 'dimensionFilters'
  | 'excludedDateLevels'
  | 'emptyState'
  | 'onSetup'
> & {
  /** The control's own styling — `styleOptions.control`, unwrapped by the widget. */
  controlStyleOptions?: FilterWidgetControlStyleOptions;
  /**
   * Called when the user changes the filter selection. The host widget wraps
   * this into its unified `onChange` channel as a `filter/changed` event.
   */
  onFilterUpdate?: (filter: Filter | null) => void;
  /**
   * Called when the user picks a different date granularity, with the attribute
   * at the new level. The host widget wraps this into its unified `onChange`
   * channel as a `dateLevel/changed` event (e.g. to sync host widget metadata).
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
 * Effective selection mode for the control.
 *
 * The widget's own setting decides — it is the one the reader toggles and the host
 * persists. The single exception is a selection that actually holds more than one member,
 * which renders multi whatever the setting says, so an external change to the shared
 * filter (dashboard cross-filtering, a chart selecting several values) is shown rather
 * than truncated to the first member.
 *
 * The filter's own `enableMultiSelection` is deliberately **not** consulted. A members
 * filter does not serialise `multiSelection` into its JAQL, and the reader that parses
 * JAQL back defaults the flag to `true` — so for any filter that reached this widget
 * through Fusion it is a constant `true`, and cannot tell a genuinely multi-select filter
 * from a single-select one that made a round trip. Reading it is what made every reopened
 * widget editor come back multi. The member count carries the same signal and is real data
 * rather than a defaulted flag.
 * @internal
 */
export function getEffectiveMultiselect(
  widgetMultiselect: boolean,
  selectedCount: number,
): boolean {
  return widgetMultiselect || selectedCount > 1;
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
 * Renders the FilterWidget's filter control: a searchable members select, or — for a
 * datetime attribute — the period control, whose panel drafts a level and its values and
 * commits them together.
 *
 * Used internally by FilterWidget to provide the 'members' filter type UI.
 */
export const FilterWidgetDropdown: FunctionComponent<FilterWidgetDropdownProps> = ({
  attribute,
  dataSource,
  isMultiselect = true,
  filter: filterFromProps = null,
  filterType = 'members',
  onFilterUpdate: updateFilterFromProps,
  parentFilters = [],
  dimensionFilters,
  onDateLevelChange,
  onReady,
  excludedDateLevels,
  controlStyleOptions,
  emptyState,
  onSetup,
}) => {
  const { t } = useTranslation();
  /* Days are read and written in the reader's own format, so the same mask the calendar
     control renders with is the one this converts through. The member it stores stays
     canonical either way — see `date-picker-members.ts`. */
  const { mask: dateMask } = useDateMask();

  /**
   * Same resolution as the dashboard filter editor — text / numeric / datetime —
   * so Condition and List modes agree on which catalogue applies.
   * Exposed on the root as `data-filter-attribute-value-type` for verification.
   */
  const attributeValueType = getFilterAttributeValueType(attribute);
  const isDateAttribute = attributeValueType === 'datetime';
  /** Design / style mode: List (`members`) vs Condition. */
  const isConditionMode = filterType === 'condition';
  /**
   * The calendar control, offered for datetime attributes only. It works at Day
   * granularity alone — the level screen the List control carries has no counterpart here,
   * because a calendar can only speak in days.
   */
  const isCalendarMode = isDateAttribute && filterType === 'calendar';

  /**
   * The level the host is on, which is the FILTER's whenever it has one.
   *
   * The filter is what the dashboard actually filters by, and the only carrier every host
   * round-trips reliably: some hosts forward `filters/updated` but drop the widget's
   * `dateLevel/changed`, so their copy of the widget can sit at the level the widget
   * was saved at indefinitely. Reading the level from the attribute there undid a commit —
   * a Years selection came back as the quarter its member key fell in.
   *
   * Falls back to the attribute for a widget with no filter yet, which is how a host picks
   * the starting level (and how the editor moves a freshly picked dimension to a free one).
   */
  const committedGranularity =
    filterFromProps &&
    isLevelAttribute(filterFromProps.attribute) &&
    filterFromProps.attribute.expression === attribute.expression
      ? filterFromProps.attribute.granularity
      : // Cast rationale: `granularity` exists only on LevelAttribute; for plain
        // (non-date) attributes the property is undefined and the fallback applies.
        (attribute as DimensionalLevelAttribute).granularity;

  // ── Date granularity (date attributes only) ──────────────────────────────
  const [dateGranularity, setDateGranularity] = useState<string>(
    committedGranularity ?? DateLevels.Years,
  );

  // Resync local granularity during render when the host swaps dimension or level
  // (empty → Quarters, or Years → Quarters on the same expression). Use
  // `incomingGranularity` for derived work on that render — setState below still
  // holds the previous value until the follow-up render.
  const incomingGranularity = committedGranularity ?? DateLevels.Years;
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
  /* Named the way every other date-level attribute in the SDK is — `Years in Date` — because
     the name travels: it becomes the filter's jaql title, so a host that syncs tile titles
     from the filter would rename its linked tile from `Years in Date` to the bare column
     `Date` the moment a value was picked. */
  const effectiveAttribute = useMemo(() => {
    if (!isDateAttribute || !attribute.expression) return attribute;
    // Cast rationale: isDateAttribute guarantees a datetime attribute here.
    return createLevelAttribute(attribute as DimensionalLevelAttribute, resolvedGranularity, t);
  }, [isDateAttribute, attribute, resolvedGranularity, t]);

  /**
   * The level the date panel is editing, when it differs from the committed one.
   *
   * A separate piece of state rather than a change to `dateGranularity`, which is what
   * keeps `Cancel` free of queries: the committed level — and therefore the widget's own
   * members query, `effectiveAttribute` and the filter-sync effect — never moves while
   * the panel is open. Abandoning the draft is just dropping this value.
   */
  const [draftLevel, setDraftLevel] = useState<string | null>(null);

  const [searchValue, setSearchValue] = useState('');

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
    setSearchValue('');
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

  const onSearchValueChange = useCallback(
    (search: string) => {
      setSearchValue(search);
      debouncedSetSearchFilter(search);
    },
    [debouncedSetSearchFilter],
  );

  // List mode only. Condition mode publishes TextFilters; feeding those into the
  // members synchronizer would read `.members` off a text filter and break.
  const membersFilterFromProps =
    isConditionMode ||
    !filterFromProps ||
    !Array.isArray((filterFromProps as MembersFilter).members)
      ? null
      : (filterFromProps as MembersFilter);

  // Cast rationale: the 'members' filter type UI operates on MembersFilter; a
  // non-members filter injected for the same dimension is intentionally taken
  // over as a members filter on first user selection (same-dim override
  // semantics), preserving its guid via withMembersFilterSelection.
  /* `onFilterUpdate` is an OPTIONAL prop and the hook calls it on every publish, so an
     omitted callback has to be absorbed here. It previously reached the hook through a cast
     that claimed it was always a function, which turned "host did not pass one" into a
     `TypeError` the first time anything was applied — silent only because no path had
     published without it before. */
  const publishToHost = useCallback(
    (nextFilter: MembersFilter) => updateFilterFromProps?.(nextFilter),
    [updateFilterFromProps],
  );

  // Cast rationale for the seed: see the note above about same-dim override semantics.
  const { filter, updateFilter: publishFilter } = useSynchronizedFilter<MembersFilter>(
    membersFilterFromProps,
    publishToHost,
    () =>
      filterFactory.members(effectiveAttribute, [], {
        enableMultiSelection: isMultiselect,
      }) as MembersFilter,
  );

  /**
   * How the widget's own restriction has to be carried by what it publishes.
   *
   * Read from `dimensionFilters` and not `parentFilters`: the latter also holds the dashboard
   * filters the widget opted in to, which are transient dashboard state and must not be baked
   * into the widget's filter — a selection frozen against them would stop tracking the dashboard.
   */
  const backgroundFilter = useMemo(
    () => asBackgroundFilter(dimensionFilters ?? [], effectiveAttribute),
    [dimensionFilters, effectiveAttribute],
  );

  /**
   * Every publish goes through here, so the restriction rides along on the filter's config the
   * same way the dashboard filter panel carries one — and survives select-all, which is
   * representational (`members: []`) and would otherwise widen to the whole dimension.
   *
   * Authoritative wherever the host declares `dimensionFilters`: there they are the only thing
   * that says what restricts this widget, so a restriction already on the filter is an echo of an
   * earlier publish and is replaced — including with nothing, once its dimension filter is
   * deleted. A caller that declares none is passing a filter the widget did not author, and its
   * background filter is left exactly as given.
   */
  const updateFilter = useCallback(
    (next: MembersFilter) =>
      publishFilter(dimensionFilters ? withBackgroundFilter(backgroundFilter)(next) : next),
    [publishFilter, dimensionFilters, backgroundFilter],
  );

  // Rebuild when dimension or date granularity changes. Filter is seeded once, so
  // expression-only comparison misses host level pushes (empty→Quarters or
  // Years→Quarters) while the seeded filter still carries the previous level.
  // Preserve members + excludeMembers — clearing them flashes "Set filter" after
  // select-all when createLevelAttribute briefly differs from filter.attribute.
  useEffect(() => {
    if (!updateFilterFromProps) return;
    if (isSameAttribute(filter.attribute, effectiveAttribute)) return;
    updateFilter(
      // Cast rationale: filterFactory.members returns the base Filter type but always
      // constructs a MembersFilter (same as the createEmptyFilter seed above).
      filterFactory.members(effectiveAttribute, filter.members, {
        guid: filter.config.guid,
        excludeMembers: filter.config.excludeMembers,
        deactivatedMembers: filter.config.deactivatedMembers,
        backgroundFilter: filter.config.backgroundFilter,
        enableMultiSelection: isMultiselect,
      }) as MembersFilter,
    );
  }, [filter, effectiveAttribute, isMultiselect, updateFilter, updateFilterFromProps]);

  /**
   * Scoping for both member queries. The text search belongs here for date dimensions too:
   * the date panel offers a search box over its value list, so leaving it out left that box
   * updating the input and filtering nothing.
   */
  const memberQueryParentFilters = useMemo(
    () => [...parentFilters, searchFilter],
    [parentFilters, searchFilter],
  );

  const membersQueryAligned =
    !isConditionMode &&
    Boolean(effectiveAttribute.expression) &&
    isSameAttribute(filter.attribute, effectiveAttribute);

  /**
   * The filter the member query runs on: the widget's own, moved to newest-first for a date
   * dimension so the freshest periods head the list.
   *
   * Stated here rather than inherited from the attribute the filter arrives with, which is
   * only sorted by accident — jaql translation defaults a datetime filter to descending, but
   * a level attribute built for a newly picked level or dimension carries no sort at all, and
   * the engine then answers oldest-first. Same order the filter editor popover asks for.
   *
   * Query-only, and deliberately not folded into `effectiveAttribute`: the order is how this
   * widget reads the dimension, not part of what the dashboard is filtered by, so it stays out
   * of the jaql the host persists and out of the attribute its linked-filter lookups key on.
   */
  const membersQueryFilter = useMemo(() => {
    /* The restriction reaches the query through `parentFilters` and nowhere else. Reading it off
       the filter as well would apply it twice, and — because the widget is what wrote it there —
       would make the list narrow itself: the nested clause outlives the dimension filter that
       produced it, comes back in on the next seed, and the list never widens again. */
    const queryFilter = withoutBackgroundFilter(filter);
    if (!isDateAttribute || queryFilter.attribute.getSort() === Sort.Descending) {
      return queryFilter;
    }
    return filterFactory.members(
      queryFilter.attribute.sort(Sort.Descending),
      queryFilter.members,
      queryFilter.config,
      // Cast rationale: filterFactory.members returns the base Filter type but always
      // constructs a MembersFilter.
    ) as MembersFilter;
  }, [isDateAttribute, filter]);

  const {
    data,
    loadMore: loadMoreMembers,
    isLoading: membersLoading,
    isAllItemsLoaded: membersAllItemsLoaded,
    totalMembersCount,
  } = useGetFilterMembersInternal({
    filter: membersQueryFilter,
    defaultDataSource: dataSource,
    // Date dimensions: skip the text-search parentFilter — granularity handles scoping.
    parentFilters: memberQueryParentFilters,
    allowMissingMembers: true,
    count: QUERY_MEMBERS_COUNT,
    includeTotalCount: true,
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

  /**
   * The date panel's own members query, for a level the reader is drafting.
   *
   * Its own query rather than moving the one above, because a drafted level is not the
   * widget's level: browsing Quarters must not disturb what the closed trigger reads, and
   * abandoning the draft must not cost a request to get back. It runs only while a
   * different level is actually drafted, and asks for members at that level alone — the
   * filter it carries has no members of its own, since changing level empties the
   * selection anyway.
   */
  const draftLevelFilter = useMemo(() => {
    if (!isDateAttribute || draftLevel === null || draftLevel === resolvedGranularity) {
      return null;
    }
    return filterFactory.members(
      // Newest-first, for the same reason the committed level's query is — a level attribute
      // built here has no sort of its own to inherit.
      createLevelAttribute(
        // Cast rationale: the date panel only renders for datetime attributes.
        attribute as DimensionalLevelAttribute,
        draftLevel,
        t,
      ).sort(Sort.Descending),
      [],
      { enableMultiSelection: isMultiselect },
      // Cast rationale: filterFactory.members returns the base Filter type but always
      // constructs a MembersFilter.
    ) as MembersFilter;
  }, [isDateAttribute, draftLevel, resolvedGranularity, attribute, isMultiselect, t]);

  const {
    data: draftData,
    loadMore: loadMoreDraftMembers,
    isLoading: draftMembersLoading,
    isAllItemsLoaded: draftAllItemsLoaded,
    totalMembersCount: draftTotalMembersCount,
  } = useGetFilterMembersInternal({
    filter: draftLevelFilter ?? membersQueryFilter,
    defaultDataSource: dataSource,
    parentFilters: memberQueryParentFilters,
    allowMissingMembers: true,
    count: QUERY_MEMBERS_COUNT,
    includeTotalCount: true,
    enabled: draftLevelFilter !== null,
  });

  /** The member page the date panel shows: the drafted level's when there is one. */
  const dateMembers = useMemo(
    () =>
      draftLevelFilter
        ? {
            allMembers: draftData?.allMembers ?? [],
            loadMore: loadMoreDraftMembers,
            isLoading: draftMembersLoading,
            allItemsLoaded: Boolean(draftAllItemsLoaded),
            totalMembersCount: draftTotalMembersCount,
          }
        : {
            allMembers: alignedMembersData?.allMembers ?? [],
            loadMore: loadMoreMembers,
            isLoading: membersLoading,
            allItemsLoaded: Boolean(membersAllItemsLoaded),
            totalMembersCount,
          },
    [
      draftLevelFilter,
      draftData,
      loadMoreDraftMembers,
      draftMembersLoading,
      draftAllItemsLoaded,
      draftTotalMembersCount,
      alignedMembersData,
      loadMoreMembers,
      membersLoading,
      membersAllItemsLoaded,
      totalMembersCount,
    ],
  );

  useFireOnReady(isConditionMode || (!membersLoading && alignedMembersData !== undefined), onReady);

  const { selectedMembers, allMembers, excludeMembers } = alignedMembersData ?? {
    selectedMembers: [],
    allMembers: [],
    // Prefer the synchronized filter flag — falling back to `false` flashes
    // "Set filter" for select-all while the members query is still aligning.
    excludeMembers: filter.config.excludeMembers,
  };

  const selectedCount = useMemo(
    () => selectedMembers.filter((m) => !m.inactive).length,
    [selectedMembers],
  );

  /** The selection as rendered; falls back to the filter's own members before it aligns. */
  const activeMemberKeys = useMemo(() => {
    const keys = selectedMembers.filter((member) => !member.inactive).map((member) => member.key);
    return keys.length > 0 ? keys : filter.members;
  }, [selectedMembers, filter.members]);

  /**
   * Follows the widget's own `isMultiselect` setting when it is toggled live (widget editor
   * / standalone). The filter's `enableMultiSelection` is seeded once, so without this the
   * toggle would be ignored. Turning it off also drops the selection to a single member —
   * a single-select control cannot hold several — keeping the first in sort order, which
   * for Day members is the earliest day. Turning it back on keeps what is selected.
   *
   * Gated on the toggle actually changing, which is what keeps it from fighting
   * {@link getEffectiveMultiselect}: a selection widened from outside (cross-filtering)
   * arrives with no change of setting, so it is left alone and shown rather than truncated.
   *
   * It reduces the selection as RENDERED, not the filter's own `members`. A widget still
   * being created has no linked filter behind it, so its members never reach the
   * synchronized filter and reducing that empty list published nothing at all.
   */
  const prevIsMultiselect = usePrevious(isMultiselect);
  useEffect(() => {
    if (prevIsMultiselect === undefined || prevIsMultiselect === isMultiselect) return;
    const nextMembers = isMultiselect
      ? activeMemberKeys
      : asSingleSelectionMembers(activeMemberKeys);
    updateFilter(
      // Cast rationale: filterFactory.members returns the base Filter type but always
      // constructs a MembersFilter (same as createEmptyFilter / withMembersFilterSelection).
      filterFactory.members(filter.attribute, nextMembers, {
        guid: filter.config.guid,
        excludeMembers: filter.config.excludeMembers,
        deactivatedMembers: filter.config.deactivatedMembers,
        backgroundFilter: filter.config.backgroundFilter,
        enableMultiSelection: isMultiselect,
      }) as MembersFilter,
    );
  }, [isMultiselect, prevIsMultiselect, activeMemberKeys, filter, updateFilter]);

  const effectiveMultiselect = getEffectiveMultiselect(isMultiselect, selectedCount);

  const handleListScroll = useCallback(
    ({ top, direction }: DropdownScrollEvent) => {
      if (!membersLoading && top > LIST_SCROLL_LOAD_MORE_THRESHOLD && direction === 'down') {
        loadMoreMembers(QUERY_MEMBERS_COUNT);
      }
    },
    [loadMoreMembers, membersLoading],
  );

  const handleSelectMember = useCallback(
    (member: Member, isSelected: boolean) => {
      const nextSelection = applyMemberToggle(
        { selectedMembers, excludeMembers },
        member,
        isSelected,
        {
          enableMultiSelection: effectiveMultiselect,
          loadedMembersCount: allMembers.length,
          allItemsLoaded: !!membersAllItemsLoaded,
          hasSearchFilter: searchValue.length > 0,
        },
      );
      updateFilter(withMembersFilterSelection(filter, nextSelection));
    },
    [
      selectedMembers,
      excludeMembers,
      effectiveMultiselect,
      allMembers.length,
      membersAllItemsLoaded,
      searchValue,
      filter,
      updateFilter,
    ],
  );

  /* Select-all stays the empty selection — what the control reads as Include all. The widget's
     own dimension filter rides along on the filter's config, so "all" resolves to the members it
     allows without the filter having to list them. */
  const handleSelectAll = useCallback(() => {
    updateFilter(withMembersFilterSelection(filter, asSelectAllSelection()));
  }, [filter, updateFilter]);

  const handleClearAll = useCallback(() => {
    updateFilter(withMembersFilterSelection(filter, asClearAllSelection()));
  }, [filter, updateFilter]);

  // ── Date panel draft ───────────────────────────────────────────────────────
  // The date panel is a transaction. **Nothing inside it reaches the filter until Apply**
  // — neither a member edit nor a level change — so the dashboard, its other widgets and
  // any linked filter stay untouched while the panel is open. `Cancel` therefore has
  // nothing to undo and publishes nothing at all.
  //
  // The level is bufferable because `dateQueryFilter` below, not the committed filter,
  // feeds the members query: the value list follows the drafted level while the filter
  // still carries the committed one.
  const [dateDraft, setDateDraft] = useState<MembersFilterSelection | null>(null);

  const dateSelection = useMemo<MembersFilterSelection>(
    () => dateDraft ?? { selectedMembers, excludeMembers },
    [dateDraft, selectedMembers, excludeMembers],
  );

  const handleDraftSelectMember = useCallback(
    (member: Member, isSelected: boolean) => {
      setDateDraft(
        /* Counts come from the page the panel is showing, which is the drafted level's when
           there is one — collapsing to select-all on the committed level's totals would be
           deciding "every member is ticked" from a different level's list. */
        applyMemberToggle(dateSelection, member, isSelected, {
          enableMultiSelection: effectiveMultiselect,
          loadedMembersCount: dateMembers.allMembers.length,
          allItemsLoaded: dateMembers.allItemsLoaded,
          hasSearchFilter: searchValue.length > 0,
        }),
      );
    },
    [dateSelection, effectiveMultiselect, dateMembers, searchValue.length],
  );

  const handleDraftSelectAll = useCallback(() => setDateDraft(asSelectAllSelection()), []);
  const handleDraftClearAll = useCallback(() => setDateDraft(asClearAllSelection()), []);

  /**
   * The closed trigger's ✕ on the date control.
   *
   * Publishes at once, unlike everything inside the panel: there is no panel open and so no
   * `Apply` coming, and a ✕ that only blanked the box would leave the dashboard filtered by
   * something the widget no longer shows. Any draft is dropped with it, so a level the
   * reader was trying is not committed as a side effect of clearing.
   */
  const handleDateClearFilter = useCallback(() => {
    setDraftLevel(null);
    setDateDraft(null);
    updateFilter(withMembersFilterSelection(filter, asClearAllSelection()));
  }, [filter, updateFilter]);

  // The one publish the panel makes. The level goes in here too, so a drafted level and
  // its members land in a single filter update rather than two.
  const handleDateApply = useCallback(() => {
    const committedLevel = draftLevel ?? resolvedGranularity;
    const levelAttribute = createLevelAttribute(
      // Cast rationale: the date panel only renders for datetime attributes.
      attribute as DimensionalLevelAttribute,
      committedLevel,
      t,
    );
    /* Moved to the drafted level first, then handed to the same helper the flat control
       uses, so both controls emit an identical payload for an identical selection. Doing
       the member split here instead would quietly diverge: the helper re-derives
       `deactivatedMembers` from the selection and takes `enableMultiSelection` from the
       filter's own config, neither of which is a pass-through of the previous filter. */
    const atDraftedLevel = filterFactory.members(levelAttribute, filter.members, {
      guid: filter.config.guid,
      excludeMembers: filter.config.excludeMembers,
      deactivatedMembers: filter.config.deactivatedMembers,
      backgroundFilter: filter.config.backgroundFilter,
      enableMultiSelection: filter.config.enableMultiSelection,
      // Cast rationale: filterFactory.members returns the base Filter type but always
      // constructs a MembersFilter.
    }) as MembersFilter;

    if (draftLevel !== null) {
      /* The level is reported BEFORE the filter, and the order is load-bearing for hosts
         that rewrite dimension granularity on `dateLevel/changed` and discard any selection
         captured against the old level — a filter published first would be thrown away by
         the level event that followed it. Reporting the level first also lets the host
         resolve the previous linked filter by its old dim+level key before the jaql is
         rewritten. Apply commits both halves at once, so this is the only ordering that
         works; a level change on its own used to arrive before any selection, which is why
         the old sequence was safe by construction. */
      onDateLevelChange?.(levelAttribute);
      // Only now does the committed level move, which is also when the widget's own
      // members query follows it — once, as part of the commit.
      setDateGranularity(draftLevel);
    }

    updateFilter(withMembersFilterSelection(atDraftedLevel, dateSelection));
    setDraftLevel(null);
    setDateDraft(null);
  }, [
    attribute,
    resolvedGranularity,
    draftLevel,
    dateSelection,
    filter.config,
    filter.members,
    updateFilter,
    onDateLevelChange,
    t,
  ]);

  /* What the dimension covers, at Day granularity — the same lookup the dashboard filter
     editor's calendar uses, so the two agree on the span. It aims the calendar's
     Earliest / Latest chips and greys the days beyond the data; it never blocks a pick,
     because the base can be queried past its current edges. Only asked for while the
     calendar is the control on screen. */
  const { data: dayStats } = useGetAttributeStats<DatetimeAttributeStats>({
    /* Only a datetime attribute can be re-levelled, and only the calendar asks for this —
       so a text dimension passes through untouched and the query stays disabled. */
    attribute: useMemo(
      () =>
        isCalendarMode
          ? createLevelAttribute(attribute as DimensionalLevelAttribute, DateLevels.Days, t)
          : attribute,
      [isCalendarMode, attribute, t],
    ),
    filters: parentFilters,
    enabled: isCalendarMode && Boolean(attribute.expression),
    ...(dataSource && { defaultDataSource: dataSource }),
  });

  /**
   * The calendar's one publish. It fires only on Apply or Enter, so unlike the List panel
   * there is no separate draft to hold here — the control owns its own.
   *
   * The filter is rebuilt at Day granularity and handed to the same helper the List
   * control commits through, so an identical set of days produces an identical payload
   * whichever control chose them.
   */
  const handleDatePickerChange = useCallback(
    (texts: string[]) => {
      const dayAttribute = createLevelAttribute(
        // Cast rationale: the calendar only renders for datetime attributes.
        attribute as DimensionalLevelAttribute,
        DateLevels.Days,
        t,
      );
      const atDayLevel = filterFactory.members(dayAttribute, [], {
        guid: filter.config.guid,
        backgroundFilter: filter.config.backgroundFilter,
        enableMultiSelection: filter.config.enableMultiSelection,
        // Cast rationale: filterFactory.members returns the base Filter type but always
        // constructs a MembersFilter.
      }) as MembersFilter;

      /* The level is reported before the filter, matching the List panel: a host that
         rewrites dimension granularity on `dateLevel/changed` discards any selection
         captured against the old level, so a filter published first would be thrown away. */
      if (resolvedGranularity !== DateLevels.Days) {
        onDateLevelChange?.(dayAttribute);
        setDateGranularity(DateLevels.Days);
      }

      /* Chronological, which for these members is a plain sort: they are ISO days, whose
         lexicographic order is their calendar order. Publishing them sorted keeps the
         payload stable however the days were picked, and makes "the first member" mean
         "the earliest day" for every host that truncates a multi-selection to one. */
      const members = asDateMembers(dateMask, texts).sort();

      updateFilter(
        withMembersFilterSelection(atDayLevel, {
          selectedMembers: members.map((key) => ({
            key,
            // The day as the calendar spells it, which is what a host shows in a tagline.
            title: asDateText(dateMask, key) ?? key,
          })),
          excludeMembers: false,
        }),
      );
    },
    [
      attribute,
      dateMask,
      filter.config,
      resolvedGranularity,
      updateFilter,
      onDateLevelChange,
      setDateGranularity,
      t,
    ],
  );

  /**
   * Abandoning the draft, in full: drop the drafted level and the drafted selection.
   *
   * Nothing was published and the committed level never moved, so there is no filter
   * update to reverse and no query to re-run — the widget is already in the state the
   * panel opened on.
   */
  const handleDateCancel = useCallback(() => {
    setDraftLevel(null);
    setDateDraft(null);
  }, []);

  // ── Date level change ──────────────────────────────────────────────────────
  const translatedGranularities = useMemo(
    () =>
      granularities
        .filter((g) => !(excludedDateLevels ?? []).includes(g.value))
        .map((g) => ({ ...g, displayValue: t(g.displayValue) })),
    [t, excludedDateLevels],
  );

  /**
   * The date panel drafting a level. Nothing leaves the widget: the committed level, the
   * members query and the filter all stay where they are until `Apply`.
   *
   * The periods belong to the level that produced them — `Q3 2025` is not a month — so
   * the drafted selection empties with the level rather than lingering over a list that
   * no longer offers it.
   */
  const handleDraftLevelChange = useCallback((newGranularity: string) => {
    setDraftLevel(newGranularity);
    setDateDraft(asClearAllSelection());
  }, []);

  const placeholder = t('filterWidget.placeholders.setFilter');

  // The level list the date panel offers, and the current level's own name — both from
  // the already-translated, already-excluded granularities.
  const levelItems = useMemo(
    () => translatedGranularities.map((g) => ({ id: g.value, label: g.displayValue })),
    [translatedGranularities],
  );
  /** The name of the level the panel is showing — the drafted one when there is one. */
  const draftLevelLabel = useMemo(() => {
    const level = draftLevel ?? resolvedGranularity;
    return translatedGranularities.find((g) => g.value === level)?.displayValue ?? level;
  }, [translatedGranularities, draftLevel, resolvedGranularity]);

  /** Paging for the panel's list, which may be the drafted level's rather than the widget's. */
  const handleDateListScroll = useCallback(
    ({ top, direction }: DropdownScrollEvent) => {
      if (!dateMembers.isLoading && top > LIST_SCROLL_LOAD_MORE_THRESHOLD && direction === 'down') {
        dateMembers.loadMore(QUERY_MEMBERS_COUNT);
      }
    },
    [dateMembers],
  );

  // When no dimension has been selected yet (placeholder attribute with empty expression),
  // render a compact dashboard setup button or the editor illustration — never a broken query.
  // All hooks are called above unconditionally to satisfy the Rules of Hooks.
  const layout = membersFilterWidgetDesign;
  /* The two steps and the placement are resolved against the defaults; the colours go to
     the controls as the style itself, so a colour it never set can still fall through to
     the dashboard theme (see `useFieldPalette`) rather than to a default that would
     silently outrank it. */
  const { tokens, containerAlign } = resolveFilterWidgetControlStyle(controlStyleOptions);

  const membersSelect = (
    <FilterSelect
      members={allMembers}
      selectedMembers={selectedMembers}
      excludeMembers={excludeMembers}
      enableMultiSelection={effectiveMultiselect}
      isMembersLoading={membersLoading}
      searchValue={searchValue}
      onSearchValueChange={onSearchValueChange}
      showSearch={!isDateAttribute}
      onSelectMember={handleSelectMember}
      onSelectAll={handleSelectAll}
      onClearAll={handleClearAll}
      onListScroll={handleListScroll}
      placeholder={placeholder}
      width="100%"
      size={tokens.size}
      radius={tokens.cornerRadius}
      controlStyle={controlStyleOptions}
      totalMembersCount={searchValue.length === 0 ? totalMembersCount : undefined}
    />
  );

  if (!attribute.expression) {
    const showSetup = emptyState === 'setupButton' || typeof onSetup === 'function';
    if (showSetup) {
      return (
        <FilterWidgetSetup
          onSetup={onSetup}
          onReady={onReady}
          controlStyleOptions={controlStyleOptions}
          attributeValueType={attributeValueType}
        />
      );
    }
    const empty = filterWidgetDesign.noDimPlaceholder;
    return (
      <div
        data-testid="filter-widget-no-dimension"
        data-filter-attribute-value-type={attributeValueType ?? 'unsupported'}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: 24,
          boxSizing: BORDER_BOX,
          textAlign: 'center',
          color: empty.color,
        }}
      >
        <div
          style={{
            ...empty.title,
            marginBottom: empty.gapTitleToSubtitle,
          }}
        >
          {t('filterWidget.setupTitle', 'Set up a filter widget')}
        </div>
        <div
          style={{
            ...empty.subtitle,
            marginBottom: empty.gapSubtitleToImage,
          }}
        >
          {t('filterWidget.setupSubtitle', 'Set a dimension and configure how the filter works')}
        </div>
        <img
          src={filterWidgetSetupImage}
          alt=""
          style={{
            width: '100%',
            maxWidth: empty.imageMaxWidth,
            height: 'auto',
            display: 'block',
          }}
        />
      </div>
    );
  }

  // Condition mode: text / numeric ConditionFilter; date and other types show unsupported.
  if (isConditionMode) {
    const isTextCondition = attributeValueType === 'text';
    const isNumericCondition = attributeValueType === 'numeric';
    const attributeUnsupported =
      isTextCondition || isNumericCondition ? null : attributeValueType ?? 'unsupported';
    const conditionKind = isNumericCondition ? 'numeric' : 'text';
    /*
     * Linked filter after create / List→Condition / blank Apply is often a MembersFilter
     * (include-all `{ all: true }`, empty members, or leftover List members). Members are
     * never a Condition expression — treat any MembersFilter as an empty Condition seed.
     * Keep the stub only for real expressions this control cannot round-trip
     * (nested AND/OR, exclude, …).
     */
    const blankBackground =
      filterFromProps == null ||
      isIncludeAllMembersFilter(filterFromProps) ||
      isMembersFilter(filterFromProps);
    const conditionFilter = blankBackground
      ? null
      : isEditableTextConditionFilter(filterFromProps)
      ? filterFromProps
      : isEditableNumericConditionFilter(filterFromProps)
      ? filterFromProps
      : null;
    const filterUnsupported = !blankBackground && conditionFilter == null;

    return (
      <div
        data-testid="filter-widget-condition"
        data-filter-type="condition"
        data-filter-attribute-value-type={attributeValueType ?? 'unsupported'}
        style={containerAlign}
      >
        <div
          style={{
            padding: `${layout.padding.top}px ${layout.padding.right}px ${layout.padding.bottom}px ${layout.padding.left}px`,
            width: '100%',
            minWidth: layout.minWidth,
            maxWidth: layout.maxWidth,
            boxSizing: BORDER_BOX,
          }}
        >
          {attributeUnsupported || filterUnsupported ? (
            <div
              data-testid="filter-widget-condition-unsupported"
              style={{
                fontSize: 13,
                lineHeight: '16px',
                color: 'var(--secondary-text-color, #9ea2ae)',
              }}
            >
              {attributeUnsupported
                ? t(
                    'filterWidget.conditionUnsupported',
                    'Condition is available for text and numeric fields',
                  )
                : t(
                    'filterWidget.conditionNotRepresentable',
                    'This condition cannot be edited here',
                  )}
            </div>
          ) : (
            <ConditionFilter
              attribute={effectiveAttribute}
              conditionKind={conditionKind}
              filter={conditionFilter}
              onFilterUpdate={updateFilterFromProps}
              dataSource={dataSource}
              parentFilters={parentFilters}
              placeholder={placeholder}
              width="100%"
              size={tokens.size}
              radius={tokens.cornerRadius}
              controlStyle={controlStyleOptions}
            />
          )}
        </div>
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
      data-filter-type={filterType ?? 'members'}
      data-filter-attribute-value-type={attributeValueType ?? 'unsupported'}
      /* The control's resolved selection mode. Exposed because it is a function of the
         widget's own setting and the member count, so which shape rendered — and why — is
         otherwise invisible from outside. */
      data-multiselect={String(effectiveMultiselect)}
      style={containerAlign}
    >
      <div
        style={{
          padding: `${layout.padding.top}px ${layout.padding.right}px ${layout.padding.bottom}px ${layout.padding.left}px`,
          width: '100%',
          minWidth: layout.minWidth,
          maxWidth: layout.maxWidth,
          boxSizing: BORDER_BOX,
        }}
      >
        {isCalendarMode ? (
          <div data-testid="filter-widget-date-picker">
            <DatePickerFilter
              /* The committed members, not a draft: the calendar holds its own draft and
                 only reports on Apply, so there is nothing of its own to read back. */
              /* Active members only. A deactivated member is one the host is holding
                 aside, so showing it as chosen would be wrong on its own — and worse, the
                 next Apply would republish it as active, since the calendar reports the
                 whole selection and `withMembersFilterSelection` re-splits what it is
                 given. The member count reads them the same way. */
              value={asDateTexts(
                dateMask,
                selectedMembers.filter((member) => !member.inactive).map((member) => member.key),
              )}
              onChange={handleDatePickerChange}
              multiselect={effectiveMultiselect}
              earliestData={dayStats?.min ? new Date(dayStats.min) : undefined}
              latestData={dayStats?.max ? new Date(dayStats.max) : undefined}
              width="100%"
              size={tokens.size}
              radius={tokens.cornerRadius}
              controlStyle={controlStyleOptions}
            />
          </div>
        ) : isDateAttribute ? (
          <div data-testid="filter-widget-date-select">
            <PeriodFilter
              levelItems={levelItems}
              level={draftLevel ?? resolvedGranularity}
              levelLabel={draftLevelLabel}
              onLevelChange={handleDraftLevelChange}
              members={dateMembers.allMembers}
              /* Cast rationale: `MembersFilterSelection` holds them readonly; the control takes
                 a mutable array and never writes to it. */
              selectedMembers={dateSelection.selectedMembers as SelectedMember[]}
              excludeMembers={dateSelection.excludeMembers}
              enableMultiSelection={effectiveMultiselect}
              isMembersLoading={dateMembers.isLoading}
              searchValue={searchValue}
              onSearchValueChange={onSearchValueChange}
              onSelectMember={handleDraftSelectMember}
              onSelectAll={handleDraftSelectAll}
              onClearAll={handleDraftClearAll}
              onClearFilter={handleDateClearFilter}
              onListScroll={handleDateListScroll}
              totalMembersCount={
                searchValue.length === 0 ? dateMembers.totalMembersCount : undefined
              }
              onApply={handleDateApply}
              onCancel={handleDateCancel}
              placeholder={placeholder}
              width="100%"
              size={tokens.size}
              radius={tokens.cornerRadius}
              controlStyle={controlStyleOptions}
            />
          </div>
        ) : (
          <div data-testid="filter-widget-members-select">{membersSelect}</div>
        )}
      </div>
    </div>
  );
};
