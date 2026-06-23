import {
  type Attribute,
  convertJaqlDataSource,
  type DataSource,
  type Filter,
  type FilterRelations,
  type FilterRelationsJaql,
  getFilterListAndRelationsJaql,
  type Measure,
  type MetadataItem,
} from '@sisense/sdk-data';
import { v4 as uuid } from 'uuid';

import type { MeasureWithExcelExportFormat } from '@/domains/widgets/helpers/excel-export-map-dimensions-measures.js';
import { numberFormatConfigToNumericMask } from '@/domains/widgets/helpers/number-format-config-to-numeric-mask.js';
import type { NumberFormatConfig } from '@/types';

/** `by` field for JAQL export requests. */
export const EXCEL_EXPORT_JAQL_BY = 'export';

/** Default Fusion numeric mask for XLSX export when Compose only provides a numeral format string. */
const DEFAULT_XLSX_NUMERIC_MASK = {
  type: 'number',
  abbreviations: { t: false, b: false, m: false, k: false },
  abbreviateAll: false,
  separated: true,
  decimals: 'auto',
  isdefault: true,
} as const;

function getDecimalsFromNumeralPattern(pattern: string): number | 'auto' {
  const decimalMatch = pattern.match(/\.(0+)/);
  return decimalMatch ? decimalMatch[1].length : 'auto';
}

/**
 * Builds the `format` object for XLSX export metadata.
 * Compose measures use `{ number: "0,0" }`; the export API expects a Fusion `{ mask: { ... } }`.
 */
function formatMetadataForXlsx(
  metadataItem: MetadataItem,
  numberFormatConfig?: NumberFormatConfig,
): Record<string, unknown> {
  const { format, jaql } = metadataItem;

  if (jaql.datatype === 'datetime') {
    return format ?? {};
  }

  if (jaql.datatype !== 'numeric' && !jaql.agg) {
    return {};
  }

  if (numberFormatConfig) {
    return { mask: numberFormatConfigToNumericMask(numberFormatConfig) };
  }

  if (!format) {
    return {};
  }

  if (format.mask && typeof format.mask === 'object') {
    return { mask: mergeNumericMask(format.mask as Record<string, unknown>) };
  }

  if (typeof format.number === 'string') {
    const decimals = getDecimalsFromNumeralPattern(format.number);
    const separated = format.number.includes(',');

    if (format.number.includes('%')) {
      return {
        mask: mergeNumericMask({ type: 'percent', percent: true, separated, decimals }),
      };
    }
    return {
      mask: mergeNumericMask({ separated, decimals }),
    };
  }

  return {};
}

function mergeNumericMask(mask: Record<string, unknown>): Record<string, unknown> {
  const abbreviations = mask.abbreviations;
  return {
    ...DEFAULT_XLSX_NUMERIC_MASK,
    ...mask,
    ...(abbreviations && typeof abbreviations === 'object'
      ? {
          abbreviations: {
            ...DEFAULT_XLSX_NUMERIC_MASK.abbreviations,
            ...abbreviations,
          },
        }
      : {}),
  };
}

/**
 * Optional pivot row/column hint on {@link Attribute} for XLSX metadata `panel`
 * (set by pivot Excel download; chart dimensions omit it and default to `rows`).
 */
export type ExcelExportDimensionPanel = 'rows' | 'columns';

type AttributeWithExcelDimensionPanel = Attribute & {
  readonly panel?: ExcelExportDimensionPanel;
};

type ExcelExportJaqlWidgetContext = {
  widgetOid: string;
  widgetTitle: string;
  dataSource: DataSource;
  /** Repeat rows (`false`) vs merge rows (`true`) for the export JAQL. */
  mergeRows: boolean;
};

/**
 * Returns a new unique `queryGuid` for a JAQL export request.
 */
function createExcelExportQueryGuid(): string {
  return uuid();
}

type XlsxExportQueryParams = {
  dimensions?: readonly Attribute[];
  measures?: readonly Measure[];
  filters?: readonly Filter[] | FilterRelations;
};

/**
 * Resolves XLSX metadata `panel` for a dimension.
 * When `mergeRows` is `false` (repeat rows), always returns `rows` so column dimensions are flattened into rows.
 * When `mergeRows` is `true`, uses {@link Attribute} `panel` when set (pivot column axes → `columns`), else `rows`.
 */
export function resolveExcelDimensionMetadataPanel(
  dimension: Attribute,
  mergeRows: boolean,
): ExcelExportDimensionPanel {
  if (!mergeRows) {
    return 'rows';
  }
  const panel = (dimension as AttributeWithExcelDimensionPanel).panel;
  return panel === 'columns' ? 'columns' : 'rows';
}

/**
 * Creates a single metadata item for an XLSX export panel.
 */
function createPanelMetadataItem({
  jaqlItem,
  formatItem,
  panel,
  merged,
  extraJaql = {},
  id,
  index,
  numberFormatConfig,
}: {
  jaqlItem: MetadataItem['jaql'];
  formatItem?: MetadataItem;
  panel: ExcelExportDimensionPanel | 'measures';
  merged: boolean;
  extraJaql?: Record<string, unknown>;
  id: string;
  index: number;
  numberFormatConfig?: NumberFormatConfig;
}) {
  return {
    jaql: {
      ...extraJaql,
      column: jaqlItem.title,
      title: jaqlItem.title,
      dim: jaqlItem.dim,
      merged,
    },
    field: { id, index },
    format: formatMetadataForXlsx(
      formatItem ?? { jaql: jaqlItem, format: undefined },
      numberFormatConfig,
    ),
    panel,
  };
}

/**
 * Returns export metadata items describing XLSX table panels (rows/measures).
 * `field.index` on each metadata item is sequential across dimensions then measures (0…n−1).
 *
 * @param mergeRows - When `false`, every dimension metadata item uses panel `rows` (see {@link resolveExcelDimensionMetadataPanel}).
 * @returns Metadata entries for JAQL `metadata` used by the XLSX export endpoint.
 */
export function createPanelsMetadataForXlsx(
  dimensions: XlsxExportQueryParams['dimensions'],
  measures: XlsxExportQueryParams['measures'],
  mergeRows: boolean,
) {
  const rowsMetadata =
    dimensions?.map((dimension, index) => {
      const metadataItem = dimension.jaql();
      const jaqlItem = metadataItem.jaql;
      // Date dimensions require level/dateTimeLevel/bucket for the backend to resolve date granularity.
      const { level, dateTimeLevel, bucket } = jaqlItem;
      const granularityJaql = {
        ...(level !== undefined && { level }),
        ...(dateTimeLevel !== undefined && { dateTimeLevel }),
        ...(bucket !== undefined && { bucket }),
      };
      return createPanelMetadataItem({
        jaqlItem,
        formatItem: metadataItem,
        panel: resolveExcelDimensionMetadataPanel(dimension, mergeRows),
        merged: !!dimension.merged,
        extraJaql: granularityJaql,
        id: dimension.id,
        index: index,
      });
    }) ?? [];

  const dimensionCount = rowsMetadata.length;

  const measuresMetadata =
    measures?.map((measure, index) => {
      const metadataItem = measure.jaql();
      const jaqlItem = metadataItem.jaql;
      const numberFormatConfig = (measure as MeasureWithExcelExportFormat).excelNumberFormatConfig;
      return createPanelMetadataItem({
        jaqlItem,
        formatItem: metadataItem,
        panel: 'measures',
        merged: !!jaqlItem.agg,
        extraJaql: { agg: jaqlItem.agg },
        id: measure.id,
        index: dimensionCount + index,
        numberFormatConfig,
      });
    }) ?? [];

  return [...rowsMetadata, ...measuresMetadata];
}

function toFilterMetadataJaql(
  filter: Filter,
  filterRelations: FilterRelationsJaql | undefined,
): MetadataItem | MetadataItem[] {
  const jaql = filter.jaql() as MetadataItem | MetadataItem[];
  const withScopePanel = (item: MetadataItem): MetadataItem => ({
    ...item,
    panel: 'scope',
  });

  if (!filterRelations) {
    return Array.isArray(jaql) ? jaql.map(withScopePanel) : withScopePanel(jaql);
  }
  if (Array.isArray(jaql)) {
    return jaql.map((item) => withScopePanel({ ...item, instanceid: filter.config.guid }));
  }
  return withScopePanel({ ...jaql, instanceid: filter.config.guid });
}

function hasNonemptyFilterJaql(metadataItem: MetadataItem): boolean {
  return Object.keys(metadataItem.jaql.filter ?? {}).length > 0;
}

/**
 * Returns `scope`-panel metadata for filters.
 *
 * @param filters - Scope filters (plain list or filter relations)
 * @returns Filter metadata for the export JAQL
 */
export function createFiltersMetadataForXlsx(
  filters: readonly Filter[] | FilterRelations | undefined,
): MetadataItem[] {
  const { filters: filterList, relations: filterRelations } = getFilterListAndRelationsJaql(
    filters as Filter[] | FilterRelations | undefined,
  );

  return [...(filterList ?? [])]
    .flatMap((filter) => toFilterMetadataJaql(filter, filterRelations))
    .filter(hasNonemptyFilterJaql);
}

export function buildJaqlForExcelExport(
  params: XlsxExportQueryParams,
  context: ExcelExportJaqlWidgetContext,
): Record<string, unknown> {
  const { dimensions, measures, filters } = params;
  const panelsMetadata = createPanelsMetadataForXlsx(dimensions, measures, context.mergeRows);
  const filtersMetadata = createFiltersMetadataForXlsx(filters);

  return {
    datasource: convertJaqlDataSource(context.dataSource),
    widget: `${context.widgetOid};${context.widgetTitle}`,
    queryGuid: createExcelExportQueryGuid(),
    metadata: [...panelsMetadata, ...filtersMetadata],
    mergeRows: context.mergeRows,
    // Default JAQL options for the XLSX download endpoint.
    count: -1,
    by: EXCEL_EXPORT_JAQL_BY,
    ungroup: false,
  };
}
