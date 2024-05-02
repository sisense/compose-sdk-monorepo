import { v4 as uuid } from 'uuid';
import merge from 'ts-deepmerge';
import {
  JaqlQueryPayload,
  MetadataItem,
  QueryDescription,
  PivotQueryDescription,
  QueryOptions,
  JaqlDataSource,
} from '../types.js';
import {
  Attribute,
  DataSource,
  isPivotAttribute,
  isPivotMeasure,
  Measure,
  PivotAttribute,
  PivotMeasure,
  Filter,
  PivotGrandTotals,
  DEFAULT_PIVOT_GRAND_TOTALS,
  FilterRelationsJaql,
  isDataSourceInfo,
} from '@sisense/sdk-data';
import { applyHighlightFilters, matchHighlightsWithAttributes } from './metadata/highlights.js';
import {
  getPivotMetadataStats,
  normalizeLastRowSorting,
  PivotMetadataStats,
  preparePivotRowJaqlSortOptions,
} from './pivot/pivot-query-utils.js';

const JAQL_BY_CSDK = 'ComposeSDK';

/**
 * @internal
 */
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

function prepareFilterMetadata(
  attributesMetadata: MetadataItem[],
  filters: Filter[],
  filterRelations: FilterRelationsJaql | undefined,
  highlights: Filter[],
  shouldSkipHighlightsWithoutAttributes: boolean,
): MetadataItem[] {
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
  return filtersMetadata;
}

function prepareQueryMetadata(
  metadataDescription: MetadataDescription,
  shouldSkipHighlightsWithoutAttributes: boolean,
): MetadataItem[] {
  const { attributes, measures, filters, filterRelations, highlights } = metadataDescription;
  const attributesMetadata: MetadataItem[] = attributes.map((d) => d.jaql() as MetadataItem);
  const measuresMetadata: MetadataItem[] = measures.map((d) => d.jaql() as MetadataItem);

  const filtersMetadata = prepareFilterMetadata(
    attributesMetadata,
    filters,
    filterRelations,
    highlights,
    shouldSkipHighlightsWithoutAttributes,
  );

  return [...attributesMetadata, ...measuresMetadata, ...filtersMetadata];
}

function prepareQueryOptions(
  dataSource: DataSource,
  count?: number,
  offset?: number,
): QueryOptions {
  return {
    datasource: getJaqlDataSource(dataSource),
    by: JAQL_BY_CSDK,
    queryGuid: uuid(),
    ...(count ? { count } : {}),
    ...(offset ? { offset } : {}),
  };
}

/**
 * Converts a pivot query description to a JAQL query payload.
 *
 * @param pivotQueryDescription
 * @param shouldSkipHighlightsWithoutAttributes
 * @returns jaql query payload
 */
export function getPivotJaqlQueryPayload(
  pivotQueryDescription: PivotQueryDescription,
  shouldSkipHighlightsWithoutAttributes: boolean,
): JaqlQueryPayload {
  const {
    rowsAttributes,
    columnsAttributes,
    measures,
    filters,
    filterRelations,
    grandTotals,
    highlights,
    dataSource,
    count,
    offset,
  } = pivotQueryDescription;
  const queryPayload = {
    metadata: preparePivotQueryMetadata(
      { rowsAttributes, columnsAttributes, measures, filters, highlights },
      shouldSkipHighlightsWithoutAttributes,
    ),
    ...preparePivotQueryOptions(dataSource, grandTotals, count, offset),
  };

  if (filterRelations) {
    return { ...queryPayload, filterRelations };
  }

  return queryPayload;
}

type PivotMetadataDescription = Pick<
  PivotQueryDescription,
  'rowsAttributes' | 'columnsAttributes' | 'measures' | 'filters' | 'filterRelations' | 'highlights'
>;

function jaqlPivotAttribute(
  a: Attribute | PivotAttribute,
  panel: string,
  index: number,
  metadataStats: PivotMetadataStats,
): MetadataItem {
  const isSortedRowAttribute =
    panel === 'rows' && isPivotAttribute(a) && a.sort && a.sort.direction !== 'sortNone';
  const jaql = {
    ...(isPivotAttribute(a) ? a.attribute.jaql(true) : a.jaql(true)),
    ...(isSortedRowAttribute && preparePivotRowJaqlSortOptions(a.sort!, index, metadataStats)),
  };
  return {
    jaql,
    ...(isPivotAttribute(a) && a.includeSubTotals ? { format: { subtotal: true } } : {}),
    panel,
    field: { index: index, id: `${panel}-${index}` },
  } as MetadataItem;
}

function jaqlPivotMeasure(m: Measure | PivotMeasure, panel: string, index: number): MetadataItem {
  return {
    ...(isPivotMeasure(m)
      ? merge(m.measure.jaql(), {
          jaql: { subtotalAgg: m.totalsCalculation },
          format: { databars: m.dataBars || false },
        })
      : m.jaql()),
    panel,
    field: { index: index, id: `${panel}-${index}` },
  } as MetadataItem;
}

/**
 * Prepares the metadata part of the JAQL payload for a pivot query.
 *
 * @param pivotMetadataDescription
 * @param shouldSkipHighlightsWithoutAttributes
 * @returns array of metadata items of the JAQL payload
 */
function preparePivotQueryMetadata(
  pivotMetadataDescription: PivotMetadataDescription,
  shouldSkipHighlightsWithoutAttributes: boolean,
): MetadataItem[] {
  const { rowsAttributes, columnsAttributes, measures, filters, filterRelations, highlights } =
    pivotMetadataDescription;
  const metadataStats = getPivotMetadataStats(rowsAttributes, columnsAttributes, measures);
  let fieldIndex = 0; // used as a global counter to build field.index in Jaql MetadataItem
  const rowsAttributesMetadata: MetadataItem[] = rowsAttributes.map((a, index) =>
    jaqlPivotAttribute(a, 'rows', index + fieldIndex, metadataStats),
  );
  fieldIndex = fieldIndex + rowsAttributes.length;

  const columnsAttributesMetadata: MetadataItem[] = columnsAttributes.map((a, index) =>
    jaqlPivotAttribute(a, 'columns', index + fieldIndex, metadataStats),
  );
  fieldIndex = fieldIndex + columnsAttributes.length;

  const attributesMetadata: MetadataItem[] = [
    ...rowsAttributesMetadata,
    ...columnsAttributesMetadata,
  ];

  const measuresMetadata: MetadataItem[] = measures.map((m, index) =>
    jaqlPivotMeasure(m, 'measures', index + fieldIndex),
  );

  const filtersMetadata = prepareFilterMetadata(
    attributesMetadata,
    filters,
    filterRelations,
    highlights,
    shouldSkipHighlightsWithoutAttributes,
  );

  const metadata = [...attributesMetadata, ...measuresMetadata, ...filtersMetadata];

  normalizeLastRowSorting(metadata, metadataStats);

  return metadata;
}

/**
 * Prepares the options part of the JAQL payload for a pivot query.
 *
 * @param dataSource
 * @param grandTotals
 * @param count
 * @param offset
 */
function preparePivotQueryOptions(
  dataSource: DataSource,
  grandTotals: PivotGrandTotals,
  count?: number,
  offset?: number,
): QueryOptions {
  return {
    datasource: getJaqlDataSource(dataSource),
    by: JAQL_BY_CSDK,
    queryGuid: uuid(),
    dashboard: JAQL_BY_CSDK,
    widget: JAQL_BY_CSDK,
    format: 'pivot',
    ...(count ? { count } : {}),
    ...(offset ? { offset } : {}),
    ...{ grandTotals: { ...DEFAULT_PIVOT_GRAND_TOTALS, ...grandTotals } },
  };
}

/**
 * Converts a DataSource to a description of data source used in JAQL.
 */
function getJaqlDataSource(dataSource: DataSource): JaqlDataSource {
  return isDataSourceInfo(dataSource)
    ? {
        title: dataSource.title,
        live: dataSource.type === 'live',
      }
    : dataSource;
}
