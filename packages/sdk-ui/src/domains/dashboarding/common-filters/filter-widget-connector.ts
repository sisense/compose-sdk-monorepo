import { Attribute, Filter, filterFactory } from '@sisense/sdk-data';

import { FilterWidgetProps } from '@/domains/widgets/components/filter-widget/types';
import { cloneFilter, isSameAttribute } from '@/shared/utils/filters.js';

/** Link stored in `widgetsOptions[id].filterWidgetOptions`. */
type FilterWidgetLink = { filterId: string };

/**
 * Resolves the dashboard filter backing a FilterWidget.
 *
 * The attribute-identity match (same semantic as the dim|level|bucket key) is
 * authoritative. The guid link is only a runtime stability hint and is re-validated
 * on every read: a link pointing to a filter whose attribute no longer matches
 * (edited externally) is stale and ignored; a link whose filter is merely absent
 * stays valid — its guid is reused on re-add to keep filterRelations references.
 *
 * Single source of truth for the resolution rule — every consumer (the connector
 * below, `filterWidgetLinkedIds` in useComposedDashboard) must use it so one derivation
 * cannot desync from the other.
 * @internal
 */
export function resolveFilterWidgetFilter(
  filters: readonly Filter[],
  attribute: Attribute,
  link: FilterWidgetLink | undefined,
): {
  filter: Filter | null;
  validLinkGuid: string | undefined;
  /**
   * The linked filter when the link went stale on GRANULARITY ALONE — the widget's own
   * filter at a level its `attribute` does not name. It is also the resolved `filter`,
   * and it is what the write path replaces so moving level cannot leave the widget's
   * previous filter behind as a second tile.
   */
  ownFilterAtOtherLevel: Filter | null;
} {
  const filterByLink: Filter | null = link?.filterId
    ? filters.find((f) => f.config.guid === link.filterId) ?? null
    : null;

  const isLinkStale = filterByLink !== null && !isSameAttribute(filterByLink.attribute, attribute);
  const linkedFilter = isLinkStale ? null : filterByLink;
  const validLinkGuid = isLinkStale ? undefined : link?.filterId;

  const adoptionCandidate: Filter | null = !validLinkGuid
    ? filters.find((f) => isSameAttribute(f.attribute, attribute)) ?? null
    : null;

  // Same dimension, so the same widget's filter — only its level moved. A stale link on
  // another dimension is a foreign filter and stays untouched.
  const ownFilterAtOtherLevel =
    isLinkStale && filterByLink!.attribute.expression === attribute.expression
      ? filterByLink
      : null;

  /* Own before adopted, matching the write path: the widget's own filter is handed back even
     though its `attribute` names another level, because the level that filter carries IS the
     level the widget committed. A host whose copy of the widget lags (the widget metadata
     never receives the level event) would otherwise leave the widget with no filter at all —
     it then read its level off the stale attribute, re-published its members there, and the
     commit walked back a level: `2010` at Years returning as `Q1 2010`. Resolving an adoption
     candidate first would show the widget a stranger's selection at the level it happens to
     have moved to, while the write path replaced its own filter. */
  return {
    filter: linkedFilter ?? ownFilterAtOtherLevel ?? adoptionCandidate,
    validLinkGuid,
    ownFilterAtOtherLevel,
  };
}

/**
 * Returns a copy of `filter` with `guid` assigned in config.
 * @param filter - Filter to copy
 * @param guid - Guid to assign on the copy
 * @returns Returns a new filter with `guid` in config; does not mutate `filter`.
 * @internal
 */
function withFilterGuid(filter: Filter, guid: string): Filter {
  const withGuid = cloneFilter(filter);
  (withGuid.config as { guid: string }).guid = guid;
  return withGuid;
}

/**
 * Resets an existing filter to include-all while preserving its guid, disabled state, and
 * backgroundFilter.
 *
 * Clear / blank Condition Apply resets the linked filter to include-all
 * (`{ all: true }` / empty MembersFilter), it does not delete the tile. Condition mode
 * seeds that as an empty Condition UI; List mode reads it as Set filter / Include all.
 * @param existing - The filter to reset
 * @param guid - The stable guid to assign to the cleared filter
 * @returns Returns a new filter expression representing include-all under `guid`.
 * @internal
 */
function resetLinkedFilterToIncludeAll(existing: Filter, guid: string): Filter {
  const { attribute, config } = existing;
  return filterFactory.members(attribute, [], {
    guid,
    disabled: config.disabled,
    ...('backgroundFilter' in config && config.backgroundFilter
      ? { backgroundFilter: config.backgroundFilter }
      : {}),
  });
}

/**
 * Replaces the filter with `guid` in `filters`, or appends `replacement` when absent.
 * @param filters - Current dashboard filters
 * @param guid - Guid of the filter slot to replace
 * @param replacement - Filter to install under `guid`
 * @returns Returns a new filters array with `replacement` installed under `guid`.
 * @internal
 */
function replaceFilterUnderGuid(
  filters: readonly Filter[],
  guid: string,
  replacement: Filter,
): Filter[] {
  const installed = withFilterGuid(replacement, guid);
  const withReplacement = filters.map((f) => (f.config.guid === guid ? installed : f));
  return filters.some((f) => f.config.guid === guid)
    ? withReplacement
    : [...withReplacement, installed];
}

type ConnectorInput = {
  filters: readonly Filter[];
  setFilters: (filters: Filter[]) => void;
  link: FilterWidgetLink | undefined;
  setLink: (link: FilterWidgetLink) => void;
};

type FilterWidgetConnection = {
  filter: Filter | null;
  onChange: (filter: Filter | null) => void;
};

/**
 * Pure connector between a FilterWidget and the shared dashboard filter state.
 *
 * The attribute-identity match (same semantic as the dim|level|bucket key) is
 * authoritative. The guid link is only a runtime stability hint: it disambiguates
 * replacement so filterRelations references stay valid, and it is re-validated on
 * every read — a link whose filter no longer matches the widget attribute (e.g. the
 * filter was re-leveled externally) is treated as absent.
 *
 * Read path: resolves the widget's current filter by validated guid link, falling back
 * to attribute match (adoption). Never mutates filter objects or calls setters during read.
 *
 * Write path: establishes or repairs the link on selection (adopting an existing
 * same-attribute filter's guid, or using the new filter's auto-generated guid), then
 * replaces under the stable linked guid to preserve filterRelations references.
 * @internal
 */
export function connectFilterWidgetToProps(
  input: ConnectorInput,
): (widgetProps: Pick<FilterWidgetProps, 'attribute'>) => FilterWidgetConnection {
  return (widgetProps) => {
    const { attribute } = widgetProps;
    const { filters, setFilters, link, setLink } = input;

    // --- Read path (pure — no mutations, no setter calls) ---
    const { filter, validLinkGuid, ownFilterAtOtherLevel } = resolveFilterWidgetFilter(
      filters,
      attribute,
      link,
    );

    /* What a selection replaces, in order of how strongly the filter is this widget's own:
       the validly linked one, then its own filter at another level (the level moved, so no
       attribute match can find it), and only then an ADOPTION candidate — a filter at the
       widget's level that some other hand created, which is the widget's to claim only while it
       has none of its own. Ordering matters: adoption used to come first, so a filter that
       happened to sit at the level the widget moved TO was claimed while the widget's own filter
       stayed behind in the array as a second linked tile. */
    const ownFilterElsewhere = validLinkGuid ? null : ownFilterAtOtherLevel;
    const adoptionCandidate = validLinkGuid || ownFilterElsewhere ? null : filter;

    // --- Write path ---
    const onChange = (newFilter: Filter | null): void => {
      if (newFilter === null) {
        /* Reset expression to include-all under the stable linked guid — never drop the tile. */
        const guidToReset =
          validLinkGuid ??
          ownFilterElsewhere?.config.guid ??
          adoptionCandidate?.config.guid ??
          filter?.config.guid;
        if (!guidToReset) return;

        const existing =
          filters.find((f) => f.config.guid === guidToReset) ??
          ownFilterElsewhere ??
          adoptionCandidate ??
          filter;
        if (!existing) return;

        const cleared = resetLinkedFilterToIncludeAll(existing, guidToReset);
        if (!validLinkGuid && guidToReset) {
          setLink({ filterId: guidToReset });
        }
        setFilters(replaceFilterUnderGuid(filters, guidToReset, cleared));
        return;
      }

      const existingGuid = validLinkGuid;

      if (existingGuid) {
        // Stable-guid update: reuse the linked guid so filterRelations refs stay valid.
        setFilters(replaceFilterUnderGuid(filters, existingGuid, newFilter));
      } else if (ownFilterElsewhere || adoptionCandidate) {
        /* Replace under the claimed filter's guid — the widget's own at the level it came from,
           or the one it is adopting. Keeping that guid is what holds a widget to ONE filter
           through a level change and keeps filterRelations references pointing at it. */
        const claimedGuid = (ownFilterElsewhere ?? adoptionCandidate)!.config.guid;
        const installed = withFilterGuid(newFilter, claimedGuid);
        setLink({ filterId: claimedGuid });
        setFilters(filters.map((f) => (f.config.guid === claimedGuid ? installed : f)));
      } else {
        // First selection, no existing filter: use the new filter's auto-generated guid
        setLink({ filterId: newFilter.config.guid });
        setFilters([...filters, newFilter]);
      }
    };

    return { filter, onChange };
  };
}
