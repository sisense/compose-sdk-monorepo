/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Filter, isIncludeAllMembersFilter, MetadataItem } from '@sisense/sdk-data';

export function applyHighlightFilters(metadataItem: MetadataItem, highlights: Filter[]) {
  const filter = highlights?.find((f) => getMetadataItemId(metadataItem) === f.attribute.id);

  if (filter && !filter.config.disabled && !isIncludeAllMembersFilter(filter)) {
    if (filter.isScope) {
      filter.isScope = false;
    }

    metadataItem.jaql.in = {
      selected: filter.jaql(),
    };
  }
  return metadataItem;
}

export function matchHighlightsWithAttributes(
  attributesMetadata: MetadataItem[],
  highlights: Filter[],
) {
  const highlightsWithAttributes: Filter[] = [];
  const highlightsWithoutAttributes: Filter[] = [];

  highlights.forEach((filter) => {
    if (isIncludeAllMembersFilter(filter)) {
      return;
    }
    const isMatch = attributesMetadata.some((d) => getMetadataItemId(d) === filter.attribute.id);
    if (isMatch) {
      highlightsWithAttributes.push(filter);
    } else {
      highlightsWithoutAttributes.push(filter);
    }
  });

  return [highlightsWithAttributes, highlightsWithoutAttributes];
}

/**
 * Builds the identity key used to match a highlight filter to a query dimension.
 *
 * Keyed on `dim` for a regular attribute. A calculated dimension has no `dim`, so its `formula` is
 * used instead (matching `DimensionalCalculatedAttribute.id`, which returns the formula). Without
 * this fallback a calculated-dimension highlight never matches its query dimension and would be
 * applied as a standalone slice filter instead of being embedded as a highlight on the dimension.
 *
 * @param metadataItem - The dimension or filter metadata item to derive an identity from
 * @returns The identity key: `dim` (or `formula` for a calculated dimension), suffixed with the
 * level and bucket when present.
 * @internal
 */
export function getMetadataItemId(metadataItem: MetadataItem): string {
  const { dim, formula, level, dateTimeLevel, bucket } = metadataItem.jaql;
  let id = `${dim ?? formula}`;

  if (level || dateTimeLevel) {
    id += `_${level || dateTimeLevel}`;
  }

  if (bucket) {
    id += `_${bucket}`;
  }

  return id;
}
