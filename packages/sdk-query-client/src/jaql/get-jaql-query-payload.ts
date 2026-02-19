import {
  Attribute,
  convertJaqlDataSource,
  DataSource,
  DEFAULT_PIVOT_GRAND_TOTALS,
  Filter,
  FilterRelationsJaql,
  isPivotAttribute,
  isPivotMeasure,
  Measure,
  MetadataItem,
  PivotAttribute,
  PivotGrandTotals,
  PivotMeasure,
} from '@sisense/sdk-data';
import merge from 'ts-deepmerge';
import { v4 as uuid } from 'uuid';

import {
  JaqlQueryPayload,
  PivotQueryDescription,
  QueryDescription,
  QueryOptions,
} from '../types.js';
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
  const {
    attributes,
    measures,
    filters,
    filterRelations,
    highlights,
    dataSource,
    count,
    offset,
    ungroup,
  } = queryDescription;
  // "ungroup: true" will be set in JAQL when two conditions are met:
  // (1) ungroup is set to true
  // AND
  // (2) the query has no measures (unaggregated query)
  const includeUngroup = ungroup && measures.length === 0;
  const queryPayload = {
    metadata: prepareQueryMetadata(
      { attributes, measures, filters, filterRelations, highlights },
      shouldSkipHighlightsWithoutAttributes,
    ),
    ...prepareQueryOptions(dataSource, count, offset, includeUngroup),
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

  const getFilterJaql = (f: Filter): MetadataItem | MetadataItem[] => {
    const jaql = f.jaql();
    if (filterRelations) {
      // instanceid is needed for filter relations only
      if (Array.isArray(jaql)) {
        return jaql.map((j) => ({ ...j, instanceid: f.config.guid }));
      } else {
        return { ...jaql, instanceid: f.config.guid };
      }
    }
    return jaql;
  };
  const filtersMetadata = (
    shouldSkipHighlightsWithoutAttributes
      ? filters.flatMap((d) => getFilterJaql(d))
      : [...filters, ...highlightsWithoutAttributes].flatMap((d) => getFilterJaql(d))
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

/**
 * WORKAROUND
 *
 * Ensures that any `text`-typed context fields with `agg: "count"`
 * in analytic functions like `trend` or `forecast` are converted to `numeric`.
 *
 * This helps maintain compatibility with analytic functions that expect
 * numeric input for aggregation.
 *
 * @param {MetadataItem} metadataItem - The metadata item to check and adjust.
 * @returns {MetadataItem} A cloned and modified metadata item if needed, or the original one.
 *
 * @internal
 */
function ensureNumericCountInContext(metadataItem: MetadataItem): MetadataItem {
  const formula = metadataItem.jaql?.formula;
  if (!formula || (!formula.includes('trend') && !formula.includes('forecast'))) {
    return metadataItem;
  }

  const clonedItem = structuredClone(metadataItem);
  const context = clonedItem.jaql?.context;

  if (context) {
    for (const key in context) {
      const item = context[key];
      if (item.datatype === 'text' && item.agg === 'count') {
        item.datatype = 'numeric';
      }
    }
  }

  return clonedItem;
}

function prepareQueryMetadata(
  metadataDescription: MetadataDescription,
  shouldSkipHighlightsWithoutAttributes: boolean,
): MetadataItem[] {
  const { attributes, measures, filters, filterRelations, highlights } = metadataDescription;
  const attributesMetadata: MetadataItem[] = attributes.map((d) => d.jaql() as MetadataItem);
  const measuresMetadata: MetadataItem[] = measures.map((d) =>
    ensureNumericCountInContext(d.jaql()),
  );

  const filtersMetadata = prepareFilterMetadata(
    attributesMetadata,
    filters,
    filterRelations,
    highlights,
    shouldSkipHighlightsWithoutAttributes,
  );

  return [...attributesMetadata, ...measuresMetadata, ...filtersMetadata];
}

export function prepareQueryOptions(
  dataSource: DataSource,
  count?: number,
  offset?: number,
  includeUngroup?: boolean,
): QueryOptions {
  return {
    datasource: convertJaqlDataSource(dataSource),
    by: JAQL_BY_CSDK,
    queryGuid: uuid(),
    ...(includeUngroup ? { ungroup: true } : {}),
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
      { rowsAttributes, columnsAttributes, measures, filters, highlights, filterRelations },
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
  if (isPivotAttribute(a)) {
    const isSortedRowAttribute = panel === 'rows' && a.sort && a.sort.direction !== 'sortNone';

    const jaql = {
      ...a.attribute.jaql(true),
      ...(isSortedRowAttribute
        ? preparePivotRowJaqlSortOptions(a.sort!, index, metadataStats)
        : {}),
    };

    if (a.name) {
      jaql.title = a.name;
    }

    const result: MetadataItem = {
      jaql,
      panel,
      field: { index: index, id: `${panel}-${index}` },
    };

    if (a.includeSubTotals) {
      result.format = { subtotal: true };
    }

    return result;
  } else {
    return {
      jaql: a.jaql(true),
      panel,
      field: { index: index, id: `${panel}-${index}` },
    };
  }
}

function jaqlPivotMeasure(m: Measure | PivotMeasure, panel: string, index: number): MetadataItem {
  return {
    ...(isPivotMeasure(m)
      ? merge(m.measure.jaql(), {
          jaql: { subtotalAgg: m.totalsCalculation },
          format: {
            databars: m.dataBars || false,
            ...(m.shouldRequestMinMax && {
              color: { type: 'range' },
            }),
          },
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
    datasource: convertJaqlDataSource(dataSource),
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
