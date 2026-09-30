import {
  Attribute,
  convertJaqlDataSource,
  DataSource,
  DEFAULT_PIVOT_GRAND_TOTALS,
  Filter,
  FilterRelationsJaql,
  getDateMeasureAggregation,
  isDateMeasure,
  isPivotAttribute,
  isPivotMeasure,
  Measure,
  MetadataItem,
  PivotAttribute,
  PivotGrandTotals,
  PivotMeasure,
} from '@sisense/sdk-data';
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
  const queryPayload = {
    metadata: prepareQueryMetadata(
      { attributes, measures, filters, filterRelations, highlights },
      shouldSkipHighlightsWithoutAttributes,
    ),
    ...prepareQueryOptions(dataSource, count, offset, ungroup),
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

// A date PART is an ordinal, not a date: week-of-year answers 1 to 53. Sub-day levels are not in
// here: they answer with a real datetime, and sdk-ui already shows them with a day format
// (`getDefaultDateMeasureFormat`).
const isDatePartJaql = (jaql: MetadataItem['jaql']): boolean => jaql.dateTimePart !== undefined;

/**
 * Resolves the datatype of a pivot measure item.
 *
 * The pivot backend returns null cells unless the item is sent with datatype `'datetime'`, so a
 * date measure is sent as `'datetime'`. A date part is sent as `'numeric'` because its answer is a
 * number.
 *
 * @param measure - The measure behind the item.
 * @param base - The jaql the measure produced.
 * @returns The datatype to send.
 */
function pivotMeasureDatatype(measure: Measure, base: MetadataItem['jaql']): string {
  const isDateNotDatePart = isDateMeasure(measure) && !isDatePartJaql(base);
  // `jaql()` is typed `any` and `datatype` is optional, so the datetime is checked rather than
  // asserted; anything else a measure could carry is a number to the pivot backend
  return isDateNotDatePart && base.datatype === 'datetime' ? 'datetime' : 'numeric';
}

/**
 * Checks whether a pivot measure goes on the wire carrying a date.
 *
 * The pivot table hook turns off data bars and the totals calculation for a date measure. It must
 * agree with the payload builder about which measures are dates, so both call this. It does NOT
 * narrow to `BaseMeasure`: a Fusion date measure is a formula and has no `aggregation` to read.
 *
 * @param measure - The measure behind the item.
 * @returns True when the item is sent with a datetime datatype.
 * @internal
 */
export function isMeasureSentAsDatetime(measure: Measure): boolean {
  const { jaql: base } = measure.jaql() as MetadataItem;
  return pivotMeasureDatatype(measure, base) === 'datetime';
}

/**
 * Builds the metadata item for one pivot value column.
 *
 * A `PivotMeasure` adds the caller's totals, data bars and range colour on top of the measure's own
 * jaql. Data bars and range colour are dropped for a datetime item; the totals calculation is
 * replaced with the measure's own aggregation.
 *
 * @param m - The measure, wrapped when the caller set pivot-only options on it.
 * @param panel - The panel the item belongs to.
 * @param index - The item's position within that panel.
 * @returns The metadata item to send.
 */
function jaqlPivotMeasure(m: Measure | PivotMeasure, panel: string, index: number): MetadataItem {
  const field = { index: index, id: `${panel}-${index}` };

  if (isPivotMeasure(m)) {
    const base = m.measure.jaql();
    const datatype = pivotMeasureDatatype(m.measure, base.jaql);
    // decided by what we are about to send, not by the measure, so a granularity that stays numeric
    // keeps its totals, data bars and range colour
    const isDate = datatype === 'datetime';

    return {
      ...base,
      jaql: {
        ...base.jaql,
        // a date subtotal only makes sense as the measure's own min or max, so any other totals
        // calculation from the caller is dropped. A formula keeps it in its expression, not in `agg`
        subtotalAgg: isDate ? getDateMeasureAggregation(m.measure) : m.totalsCalculation,
        datatype,
      },
      format: {
        ...base.format,
        // a date has no numeric scale, so data bars and range colour are turned off here too, for
        // callers that skip the pivot table hook
        databars: !isDate && (m.dataBars || false),
        ...(!isDate &&
          m.shouldRequestMinMax && {
            color: { type: 'range' },
          }),
      },
      panel,
      field,
    };
  }

  const base = m.jaql();
  return {
    ...base,
    jaql: {
      ...base.jaql,
      datatype: pivotMeasureDatatype(m, base.jaql),
    },
    panel,
    field,
  };
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
