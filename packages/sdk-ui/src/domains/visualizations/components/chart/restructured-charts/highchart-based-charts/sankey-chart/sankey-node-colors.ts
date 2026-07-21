import { normalizeName } from '@sisense/sdk-data';

import { StyledColumn } from '@/domains/visualizations/core/chart-data-options/types.js';
import { getDataOptionTitle } from '@/domains/visualizations/core/chart-data-options/utils.js';
import { MultiColumnValueToColorMap, ValueToColorMap } from '@/types';

/**
 * Type guard that distinguishes a flat value→color map from a column→nested-map structure.
 */
function isValueToColorMap(
  seriesToColorMap: ValueToColorMap | MultiColumnValueToColorMap,
): seriesToColorMap is ValueToColorMap {
  const values = Object.values(seriesToColorMap);
  return values.length > 0 && values.every((value) => typeof value === 'string');
}

/**
 * Parses the category column index embedded in a Sankey node id (`{index}__{displayValue}`).
 */
function parseSankeyNodeColumnIndex(nodeId: string): number | undefined {
  const separatorIndex = nodeId.indexOf('__');
  if (separatorIndex <= 0) {
    return undefined;
  }
  const index = Number.parseInt(nodeId.slice(0, separatorIndex), 10);
  return Number.isNaN(index) ? undefined : index;
}

/**
 * Returns column keys to try when resolving a nested {@link MultiColumnValueToColorMap} entry.
 */
function getSankeyColumnColorMapKeys(category: StyledColumn): readonly string[] {
  const keys = new Set<string>();
  const title = getDataOptionTitle(category);
  if (title) {
    keys.add(title);
    keys.add(normalizeName(title));
  }
  keys.add(category.column.name);
  keys.add(normalizeName(category.column.name));
  if ('title' in category.column && typeof category.column.title === 'string') {
    keys.add(category.column.title);
    keys.add(normalizeName(category.column.title));
  }
  return [...keys];
}

/**
 * Resolves an explicit color for a Sankey node from `seriesToColorMap`.
 *
 * Supports both {@link ValueToColorMap} (flat, keyed by display name) and
 * {@link MultiColumnValueToColorMap} (nested, keyed by category column then display name).
 * Multi-column lookup uses the column index encoded in the node id.
 */
export function getSankeyNodeColorFromMap(
  nodeId: string,
  displayName: string,
  categories: readonly StyledColumn[],
  seriesToColorMap?: ValueToColorMap | MultiColumnValueToColorMap,
): string | undefined {
  if (!seriesToColorMap) {
    return undefined;
  }

  if (isValueToColorMap(seriesToColorMap)) {
    const color = seriesToColorMap[displayName];
    return typeof color === 'string' ? color : undefined;
  }

  const columnIndex = parseSankeyNodeColumnIndex(nodeId);
  if (columnIndex === undefined || columnIndex >= categories.length) {
    return undefined;
  }

  for (const columnKey of getSankeyColumnColorMapKeys(categories[columnIndex])) {
    const columnColorMap = seriesToColorMap[columnKey];
    const color = columnColorMap?.[displayName];
    if (typeof color === 'string') {
      return color;
    }
  }

  return undefined;
}
