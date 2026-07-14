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
import { createLevelAttribute } from '@/shared/utils/create-level-attribute';

import { membersFilterWidgetDesign } from './filter-widget-design';
import type { FilterWidgetProps } from './types';

const LIST_SCROLL_LOAD_MORE_THRESHOLD = 0.75;
const QUERY_MEMBERS_COUNT = 50;
const SEARCH_VALUE_UPDATE_DELAY = 300;

type FilterWidgetDropdownProps = Pick<
  FilterWidgetProps,
  'attribute' | 'dataSource' | 'title' | 'isMultiselect' | 'filter' | 'parentFilters'
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
  title,
  isMultiselect = true,
  filter: filterFromProps = null,
  onFilterUpdate: updateFilterFromProps,
  parentFilters = [],
  onDateLevelChange,
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

  // For date attributes, create a LevelAttribute that includes the selected granularity.
  // For non-date attributes the plain attribute is used as-is.
  const effectiveAttribute = useMemo(() => {
    if (!isDateAttribute || !attribute.expression) return attribute;
    // Cast rationale: isDateAttribute guarantees a datetime attribute here.
    return createLevelAttribute(attribute as DimensionalLevelAttribute, dateGranularity);
  }, [isDateAttribute, attribute, dateGranularity]);

  // searchFilter drives the text-search API query for list (non-date) dimensions.
  // For date dimensions this is unused — member fetch is driven by the level attribute only.
  const [searchFilter, setSearchFilter] = useState<Filter>(() =>
    attribute.expression
      ? filterFactory.contains(attribute, '')
      : filterFactory.members(attribute, []),
  );

  // Resync local state when the DIMENSION changes (a later prop swap, e.g. the widget
  // editor picking a different field). `dateGranularity`/`searchFilter` are seeded once,
  // so without this they'd stay tied to the previous dimension until the user interacts.
  // Keyed on the dimension expression: a same-dimension granularity change is already
  // handled by `handleDateLevelChange`, so it must not reset here.
  const prevExpressionRef = useRef(attribute.expression);
  useEffect(() => {
    if (prevExpressionRef.current === attribute.expression) return;
    prevExpressionRef.current = attribute.expression;
    setDateGranularity((attribute as DimensionalLevelAttribute).granularity ?? DateLevels.Years);
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
  });

  const { selectedMembers, allMembers, excludeMembers, enableMultiSelection } = data ?? {
    selectedMembers: [],
    allMembers: [],
    excludeMembers: false,
    enableMultiSelection: false,
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
    () => granularities.map((g) => ({ ...g, displayValue: t(g.displayValue) })),
    [t],
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

  const placeholder = t('filterEditor.placeholders.selectFromList');

  // When no dimension has been selected yet (placeholder attribute with empty expression),
  // render a minimal placeholder instead of making broken queries.
  // All hooks are called above unconditionally to satisfy the Rules of Hooks.
  const design = membersFilterWidgetDesign;

  if (!attribute.expression) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          ...design.placeholder,
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
  const innerWidth = design.width - design.padding.left - design.padding.right;

  return (
    <div
      style={{
        padding: `${design.padding.top}px ${design.padding.right}px ${design.padding.bottom}px ${design.padding.left}px`,
        width: design.width,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: design.rowGap,
      }}
    >
      {/* Dimension label */}
      <div style={design.label}>{title ?? attribute.name}</div>

      {isDateAttribute ? (
        <div style={{ display: 'flex', gap: design.dateRow.gap }}>
          <SingleSelect<string>
            style={{
              width: innerWidth - design.dateRow.gap - design.dateRow.valueWidth,
              flexShrink: 0,
            }}
            value={dateGranularity}
            items={translatedGranularities}
            onChange={handleDateLevelChange}
          />
          {effectiveMultiselect ? (
            <SearchableMultiSelect<string>
              width={design.dateRow.valueWidth}
              values={selectedKeys}
              placeholder={placeholder}
              onChange={handleMultiChange}
              onListScroll={handleListScroll}
              showListLoader={membersLoading}
              showSearch={false}
              items={items}
            />
          ) : (
            <SearchableSingleSelect<string>
              key={singleSelectKey}
              width={design.dateRow.valueWidth}
              value={selectedKey}
              placeholder={placeholder}
              onChange={handleSingleChange}
              onListScroll={handleListScroll}
              showListLoader={membersLoading}
              showSearch={false}
              items={items}
            />
          )}
        </div>
      ) : effectiveMultiselect ? (
        <SearchableMultiSelect<string>
          items={items}
          values={selectedKeys}
          placeholder={placeholder}
          onChange={handleMultiChange}
          onListScroll={handleListScroll}
          showListLoader={membersLoading}
          onSearchUpdate={onSearchUpdate}
          width="100%"
        />
      ) : (
        <SearchableSingleSelect<string>
          key={singleSelectKey}
          items={items}
          value={selectedKey}
          placeholder={placeholder}
          onChange={handleSingleChange}
          onListScroll={handleListScroll}
          showListLoader={membersLoading}
          onSearchUpdate={onSearchUpdate}
          width="100%"
        />
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
