import { v4 as uuid } from 'uuid';
import { JaqlQueryPayload, MetadataItem, QueryDescription, QueryOptions } from '../types.js';
import { DataSource, Filter } from '@sisense/sdk-data';
import { applyHighlightFilters, matchHighlightsWithAttributes } from './metadata/highlights.js';

export function getJaqlQueryPayload(
  queryDescription: QueryDescription,
  shouldSkipHighlightsWithoutAttributes: boolean,
): JaqlQueryPayload {
  const { attributes, measures, filters, filterRelations, highlights, dataSource, count, offset } =
    queryDescription;
  const queryPayload = {
    metadata: prepareQueryMetadata(
      { attributes, measures, filters, filterRelations, highlights },
      shouldSkipHighlightsWithoutAttributes,
    ),
    ...prepareQueryOptions(dataSource, count, offset),
  };

  if (filterRelations) {
    return { ...queryPayload, filterRelations };
  }

  return queryPayload;
}

type MetadataDescription = Pick<
  QueryDescription,
  'attributes' | 'measures' | 'filters' | 'filterRelations' | 'highlights'
>;

function prepareQueryMetadata(
  metadataDescription: MetadataDescription,
  shouldSkipHighlightsWithoutAttributes: boolean,
): MetadataItem[] {
  const { attributes, measures, filters, filterRelations, highlights } = metadataDescription;
  const attributesMetadata: MetadataItem[] = attributes.map((d) => d.jaql() as MetadataItem);
  const measuresMetadata: MetadataItem[] = measures.map((d) => d.jaql() as MetadataItem);

  const [highlightsWithAttributes, highlightsWithoutAttributes] = matchHighlightsWithAttributes(
    attributesMetadata,
    highlights,
  );
  attributesMetadata.forEach((d) => applyHighlightFilters(d, highlightsWithAttributes));

  const getFilterJaql = (f: Filter) => {
    if (filterRelations) {
      return { ...f.jaql(), instanceid: f.guid };
    }
    return f.jaql();
  };
  const filtersMetadata = (
    shouldSkipHighlightsWithoutAttributes
      ? filters.map((d) => getFilterJaql(d) as MetadataItem)
      : [...filters, ...highlightsWithoutAttributes].map((d) => getFilterJaql(d) as MetadataItem)
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
