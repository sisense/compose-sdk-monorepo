import type {
  Attribute,
  Measure,
  MetadataItem,
  MetadataItemJaql,
  PivotAttribute,
  PivotMeasure,
  PivotRowsSort,
  SortDirection,
} from '@sisense/sdk-data';

/**
 * Represents statistics about a pivot table metadata.
 */
export type PivotMetadataStats = {
  rowsCount: number;
  columnsCount: number;
  measuresCount: number;
};

/**
 * Calculates statistics about the pivot table metadata.
 */
export function getPivotMetadataStats(
  rowsAttributes: (Attribute | PivotAttribute)[],
  columnsAttributes: (Attribute | PivotAttribute)[],
  measures: (Measure | PivotMeasure)[],
): PivotMetadataStats {
  return {
    rowsCount: rowsAttributes.length,
    columnsCount: columnsAttributes.length,
    measuresCount: measures.length,
  };
}

/**
 * Converts sort direction to JAQL sort direction.
 */
export function convertSortDirectionToJaqlSort(direction: SortDirection) {
  switch (direction) {
    case 'sortAsc':
      return 'asc';
    case 'sortDesc':
      return 'desc';
    default:
      return 'none';
  }
}

/**
 * Prepares JAQL sort options for pivot table row.
 */
export function preparePivotRowJaqlSortOptions(
  sort: PivotRowsSort,
  rowIndex: number,
  metadataStats: PivotMetadataStats,
) {
  const sortDirection = convertSortDirectionToJaqlSort(sort.direction);
  const isLastRow = rowIndex === metadataStats.rowsCount - 1;
  const sortDetails: MetadataItemJaql['sortDetails'] = {
    dir: sortDirection,
    initialized: true,
    field:
      sort.by && 'valuesIndex' in sort.by
        ? metadataStats.rowsCount + metadataStats.columnsCount + sort.by.valuesIndex!
        : rowIndex,
  };

  if (isLastRow) {
    sortDetails.sortingLastDimension = true;
  }

  if (sort.by) {
    sortDetails.measurePath = (sort.by.columnsMembersPath || []).reduce(
      (path, columnMember, columnIndex) => ({
        ...path,
        [metadataStats.rowsCount + columnIndex]: columnMember,
      }),
      {},
    );
  }

  return {
    sort: sortDirection,
    sortDetails,
  };
}

/**
 * Normalizes sorting for the last row of the pivot table.
 *
 * According to the existing pivot JAQL structure, the sorting configuration of the last row
 * may be located inside the target measure metadata
 */
export function normalizeLastRowSorting(
  metadata: MetadataItem[],
  metadataStats: PivotMetadataStats,
) {
  const lastRowIndex = metadataStats.rowsCount - 1;
  const lastRowMetadata = metadata[lastRowIndex];
  const { sortDetails, sort, ...jaqlWithoutSortOptions } = lastRowMetadata.jaql;

  const isSortedByMeasure =
    sortDetails && sortDetails.field !== lastRowIndex && sortDetails.field! < metadata.length;

  if (isSortedByMeasure) {
    const targetMeasureMetadata = metadata[sortDetails.field!];
    targetMeasureMetadata.jaql.sortDetails = sortDetails;
    targetMeasureMetadata.jaql.sort = sort;
    lastRowMetadata.jaql = jaqlWithoutSortOptions;
  }
}
