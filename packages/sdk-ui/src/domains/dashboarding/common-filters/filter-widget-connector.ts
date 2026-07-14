import { Attribute, Filter } from '@sisense/sdk-data';

import { FilterWidgetProps } from '@/domains/widgets/components/filter-widget/types';
import { isSameAttribute } from '@/shared/utils/filters.js';

/** Link stored in `widgetsOptions[id].filterWidgetOptions`. */
type FilterWidgetLink = { filterId: string };

/**
 * Resolves the dashboard filter backing a FilterWidget.
 *
 * The attribute-identity match (same semantic as Fusion's dim|level|bucket key) is
 * authoritative. The guid link is only a runtime stability hint and is re-validated
 * on every read: a link pointing to a filter whose attribute no longer matches
 * (edited externally) is stale and ignored; a link whose filter is merely absent
 * stays valid — its guid is reused on re-add to keep filterRelations references.
 *
 * Single source of truth for the resolution rule — every consumer (the connector
 * below, `hiddenFilterIds` in useComposedDashboard) must use it so one derivation
 * cannot desync from the other.
 * @internal
 */
export function resolveFilterWidgetFilter(
  filters: readonly Filter[],
  attribute: Attribute,
  link: FilterWidgetLink | undefined,
): { filter: Filter | null; validLinkGuid: string | undefined } {
  const filterByLink: Filter | null = link?.filterId
    ? filters.find((f) => f.config.guid === link.filterId) ?? null
    : null;

  const isLinkStale = filterByLink !== null && !isSameAttribute(filterByLink.attribute, attribute);
  const linkedFilter = isLinkStale ? null : filterByLink;
  const validLinkGuid = isLinkStale ? undefined : link?.filterId;

  const adoptionCandidate: Filter | null = !validLinkGuid
    ? filters.find((f) => isSameAttribute(f.attribute, attribute)) ?? null
    : null;

  return { filter: linkedFilter ?? adoptionCandidate, validLinkGuid };
}

/**
 * Overwrites the readonly `config.guid` in place. Intentional mutation: the
 * stable guid must survive filter replacement so filterRelations references
 * keep pointing to the same id.
 */
function overrideFilterGuid(filter: Filter, guid: string): void {
  (filter.config as { guid: string }).guid = guid;
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
 * The attribute-identity match (same semantic as Fusion's dim|level|bucket key) is
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
    const { filter, validLinkGuid } = resolveFilterWidgetFilter(filters, attribute, link);

    // When no valid link exists, the resolved filter (if any) is the adoption
    // candidate whose guid the write path claims on first selection.
    const adoptionCandidate = validLinkGuid ? null : filter;

    // --- Write path ---
    const onChange = (newFilter: Filter | null): void => {
      if (newFilter === null) {
        // Remove the linked filter; if no valid link, no-op
        if (validLinkGuid) {
          setFilters(filters.filter((f) => f.config.guid !== validLinkGuid));
        }
        return;
      }

      const existingGuid = validLinkGuid;

      if (existingGuid) {
        // Stable-guid update: reuse the linked guid so filterRelations refs stay valid.
        overrideFilterGuid(newFilter, existingGuid);
        const withReplacement = filters.map((f) =>
          f.config.guid === existingGuid ? newFilter : f,
        );
        // Re-add if linked filter was removed externally (keeps claim valid)
        const result = filters.some((f) => f.config.guid === existingGuid)
          ? withReplacement
          : [...withReplacement, newFilter];
        setFilters(result);
      } else if (adoptionCandidate) {
        // First selection: adopt the existing same-attribute filter's guid.
        overrideFilterGuid(newFilter, adoptionCandidate.config.guid);
        setLink({ filterId: adoptionCandidate.config.guid });
        setFilters(
          filters.map((f) => (f.config.guid === adoptionCandidate.config.guid ? newFilter : f)),
        );
      } else {
        // First selection, no existing filter: use the new filter's auto-generated guid
        setLink({ filterId: newFilter.config.guid });
        setFilters([...filters, newFilter]);
      }
    };

    return { filter, onChange };
  };
}
