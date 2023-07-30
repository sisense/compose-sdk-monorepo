import { v4 as uuid } from 'uuid';
import { JaqlQueryPayload, MetadataItem, QueryDescription, QueryOptions } from '../types.js';
import { DataSource } from '@sisense/sdk-data';
import { applyHighlightFilters, matchHighlightsWithAttributes } from './metadata/highlights.js';

export function getJaqlQueryPayload(
  queryDescription: QueryDescription,
  shouldSkipHighlightsWithoutAttributes: boolean,
): JaqlQueryPayload {
  const { attributes, measures, filters, highlights, dataSource, count, offset } = queryDescription;
  return {
    metadata: prepareQueryMetadata(
      { attributes, measures, filters, highlights },
      shouldSkipHighlightsWithoutAttributes,
    ),
    ...prepareQueryOptions(dataSource, count, offset),
  };
}

type MetadataDescription = Pick<
  QueryDescription,
  'attributes' | 'measures' | 'filters' | 'highlights'
>;

function prepareQueryMetadata(
  metadataDescription: MetadataDescription,
  shouldSkipHighlightsWithoutAttributes: boolean,
): MetadataItem[] {
  const { attributes, measures, filters, highlights } = metadataDescription;
  const attributesMetadata: MetadataItem[] = attributes.map((d) => d.jaql() as MetadataItem);
  const measuresMetadata: MetadataItem[] = measures.map((d) => d.jaql() as MetadataItem);

  const [highlightsWithAttributes, highlightsWithoutAttributes] = matchHighlightsWithAttributes(
    attributesMetadata,
    highlights,
  );
  attributesMetadata.forEach((d) => applyHighlightFilters(d, highlightsWithAttributes));

  const filtersMetadata = (
    shouldSkipHighlightsWithoutAttributes
      ? filters.map((d) => d.jaql() as MetadataItem)
      : [...filters, ...highlightsWithoutAttributes].map((d) => d.jaql() as MetadataItem)
  ).filter((f) => {
    return Object.keys(f.jaql.filter || {}).length !== 0;
  });

  if (shouldSkipHighlightsWithoutAttributes && highlightsWithoutAttributes.length > 0) {
    console.warn(
      `The following highlight filters were not applied due to missing attributes: [${highlightsWithoutAttributes
        .map((f) => f.attribute.name)
        .join(', ')}].`,
    );
  }

  return [...attributesMetadata, ...measuresMetadata, ...filtersMetadata];
}

function prepareQueryOptions(
  dataSource: DataSource,
  count?: number,
  offset?: number,
): QueryOptions {
  return {
    datasource: dataSource,
    by: 'ComposeSDK',
    queryGuid: uuid(),
    ...(count ? { count } : {}),
    ...(offset ? { offset } : {}),
  };
}
