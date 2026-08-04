import { Attribute, Measure } from '@sisense/sdk-data';

import {
  ChartDataOptionsInternal,
  KpiChartDataOptions,
  KpiChartDataOptionsInternal,
  KpiComparison,
  KpiComparisonInternal,
  StyledMeasureColumn,
} from '@/domains/visualizations/core/chart-data-options/types.js';
import {
  isMeasureColumn,
  normalizeColumn,
  normalizeMeasureColumn,
} from '@/domains/visualizations/core/chart-data-options/utils.js';
import { ChartDataOptions } from '@/types';

import { isAttributeColumn } from '../../highchart-based-charts/cartesians/helpers/data-options.js';

/**
 * Translates the public comparison union into its internal, normalized shape.
 * Each variant carries its own baseline, so there is nothing to validate/fall back on here —
 * invalid combinations are unrepresentable at the type level (see {@link KpiComparison}).
 */
function translateKpiComparison(comparison: KpiComparison): KpiComparisonInternal {
  switch (comparison.type) {
    case 'previous-period':
      return { type: 'previous-period' };
    case 'delta':
      return { type: 'delta', value: normalizeMeasureColumn(comparison.value) };
    case 'value':
      return { type: 'value', value: normalizeMeasureColumn(comparison.value) };
    case 'target':
      return {
        type: 'target',
        target:
          typeof comparison.target === 'number'
            ? comparison.target
            : normalizeMeasureColumn(comparison.target),
      };
  }
}

/**
 * Translates the public KPI data options into their internal, normalized shape.
 * @internal
 */
export function translateKpiChartDataOptions(
  dataOptions: KpiChartDataOptions,
): KpiChartDataOptionsInternal {
  return {
    value: normalizeMeasureColumn(dataOptions.value),
    category: dataOptions.category ? normalizeColumn(dataOptions.category) : undefined,
    valueMode: dataOptions.valueMode ?? 'last',
    comparison: dataOptions.comparison ? translateKpiComparison(dataOptions.comparison) : undefined,
  };
}

/**
 * Extracts the attribute(s) a KPI chart's query needs, from its `category` column when present.
 *
 * @param dataOptions - Internal KPI data options to read the `category` column from
 * @returns The category attribute as a single-element array, or an empty array when none is set
 * @internal
 */
export function getKpiAttributes(dataOptions: KpiChartDataOptionsInternal): Attribute[] {
  if (dataOptions.category && isAttributeColumn(dataOptions.category.column)) {
    return [dataOptions.category.column as Attribute];
  }
  return [];
}

/**
 * Extracts every measure a KPI chart's query needs: the headline `value`, plus whichever
 * comparison measure (`delta`/`target`/`value`) is configured.
 * @internal
 */
export function getKpiMeasures(dataOptions: KpiChartDataOptionsInternal): Measure[] {
  const styledMeasures: StyledMeasureColumn[] = [dataOptions.value];

  const comparison = dataOptions.comparison;
  if (comparison?.type === 'delta' || comparison?.type === 'value') {
    styledMeasures.push(comparison.value);
  } else if (comparison?.type === 'target' && typeof comparison.target !== 'number') {
    styledMeasures.push(comparison.target);
  }

  return styledMeasures
    .filter((styled) => isMeasureColumn(styled.column))
    .map((styled) => styled.column as Measure);
}

/**
 * Checks whether the given chart data options are shaped as {@link KpiChartDataOptions}.
 * @internal
 */
export function isKpiChartDataOptions(
  dataOptions: ChartDataOptions,
): dataOptions is KpiChartDataOptions {
  return (
    'value' in dataOptions &&
    !!dataOptions.value &&
    !Array.isArray(dataOptions.value) &&
    // a single-column `category` is KPI's own axis; an ARRAY `category` marks other chart
    // shapes (cartesian/categorical/boxplot are also caught by their array `value`; a
    // sankey-like shape — array `category` with a singular `value` — only by this clause)
    (!('category' in dataOptions) || !Array.isArray(dataOptions.category)) &&
    !('x' in dataOptions) &&
    !('y' in dataOptions) &&
    !('geo' in dataOptions) &&
    !('locations' in dataOptions) &&
    !('min' in dataOptions) &&
    !('max' in dataOptions)
  );
}

/**
 * Checks whether the given internal chart data options are shaped as
 * {@link KpiChartDataOptionsInternal}.
 * @internal
 */
export function isKpiChartDataOptionsInternal(
  dataOptions: ChartDataOptionsInternal,
): dataOptions is KpiChartDataOptionsInternal {
  return (
    'value' in dataOptions &&
    typeof dataOptions.value === 'object' &&
    dataOptions.value !== null &&
    !Array.isArray(dataOptions.value) &&
    'valueMode' in dataOptions
  );
}
