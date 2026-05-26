import {
  type Attribute,
  convertJaqlDataSource,
  type DataSource,
  type Measure,
} from '@sisense/sdk-data';
import { v4 as uuid } from 'uuid';

/** `by` field for JAQL export requests. */
export const EXCEL_EXPORT_JAQL_BY = 'export';

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
 * Formats values for XLSX export metadata.
 * Numeric: wraps the format string as `{ mask: "<fmt>" }`.
 * Datetime: returns the format object as-is (already `{ mask: { <level>: "<fmt>" } }`).
 */
function formatDataForXlsx(metadataItem: any): Record<string, any> {
  if (!metadataItem.format) return {};
  if (metadataItem.jaql.datatype === 'numeric') return { mask: metadataItem.format };
  if (metadataItem.jaql.datatype === 'datetime') return metadataItem.format;
  return {};
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
}: {
  jaqlItem: any;
  formatItem?: any;
  panel: ExcelExportDimensionPanel | 'measures';
  merged: boolean;
  extraJaql?: Record<string, unknown>;
  id: string;
  index: number;
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
    format: formatDataForXlsx(formatItem ?? jaqlItem),
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
      return createPanelMetadataItem({
        jaqlItem,
        formatItem: metadataItem,
        panel: 'measures',
        merged: !!jaqlItem.agg,
        extraJaql: { agg: jaqlItem.agg },
        id: measure.id,
        index: dimensionCount + index,
      });
    }) ?? [];

  return [...rowsMetadata, ...measuresMetadata];
}

export function buildJaqlForExcelExport(
  params: XlsxExportQueryParams,
  context: ExcelExportJaqlWidgetContext,
): Record<string, unknown> {
  const { dimensions, measures } = params;

  return {
    datasource: convertJaqlDataSource(context.dataSource),
    widget: `${context.widgetOid};${context.widgetTitle}`,
    queryGuid: createExcelExportQueryGuid(),
    metadata: createPanelsMetadataForXlsx(dimensions, measures, context.mergeRows),
    mergeRows: context.mergeRows,
    // Default JAQL options for the XLSX download endpoint.
    count: -1,
    by: EXCEL_EXPORT_JAQL_BY,
    ungroup: false,
  };
}
