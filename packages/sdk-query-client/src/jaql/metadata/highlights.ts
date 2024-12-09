/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Filter, MetadataItem } from '@sisense/sdk-data';

export function applyHighlightFilters(metadataItem: MetadataItem, highlights: Filter[]) {
  const filter = highlights?.find((f) => getMetadataItemId(metadataItem) === f.attribute.id);

  if (filter && !filter.config.disabled) {
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
    const isMatch = attributesMetadata.some((d) => getMetadataItemId(d) === filter.attribute.id);
    if (isMatch) {
      highlightsWithAttributes.push(filter);
    } else {
      highlightsWithoutAttributes.push(filter);
    }
  });

  return [highlightsWithAttributes, highlightsWithoutAttributes];
}

export function getMetadataItemId(metadataItem: MetadataItem): string {
  const { dim, level, dateTimeLevel, bucket } = metadataItem.jaql;
  let id = `${dim}`;

  if (level || dateTimeLevel) {
    id += `_${level || dateTimeLevel}`;
  }

  if (bucket) {
    id += `_${bucket}`;
  }

  return id;
}
