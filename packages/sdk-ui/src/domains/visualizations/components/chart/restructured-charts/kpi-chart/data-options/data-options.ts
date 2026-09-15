import { Attribute, isDatetime, Measure } from '@sisense/sdk-data';

import { getColorConditionMeasures } from '@/domains/visualizations/core/chart-data-options/coloring/conditional-coloring.js';
import {
  ChartDataOptionsInternal,
  KpiChartDataOptions,
  KpiChartDataOptionsInternal,
  KpiComparison,
  KpiComparisonInternal,
  StyledColumn,
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
  const value = normalizeMeasureColumn(dataOptions.value);
  const colorConditionMeasures = getColorConditionMeasures(value.color);

  return {
    value,
    category: dataOptions.category ? normalizeColumn(dataOptions.category) : undefined,
    valueMode: dataOptions.valueMode ?? 'last',
    comparison: dataOptions.comparison ? translateKpiComparison(dataOptions.comparison) : undefined,
    ...(colorConditionMeasures.length && { colorConditionMeasures }),
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
 * Checks whether a KPI `category` column carries dates -- the single question that decides
 * everything date-shaped on the card: whether the headline's bucket has an epoch to caption the
 * header with, whether a sparkline point's `x` is an epoch or a plain bucket ordinal, whether the
 * tooltip footer is a formatted date or the bucket's own label, and whether the
 * `'previous-period'` comparison may name a granularity ("vs prior month") rather than the
 * granularity-agnostic "vs prior period".
 *
 * The card's public `category` accepts any column, not just a date dimension, so none of those
 * may be assumed: a numeric attribute's values are finite numbers that would silently read as
 * epochs (`7` -> January 1970), and a text attribute's would fall back to the row index (`0` ->
 * January 1970) just as silently.
 *
 * Typed as a predicate so a `true` branch also narrows away the `undefined` case, letting callers
 * read the column itself without a non-null assertion.
 *
 * @param category - Internal category column of the KPI data options, if any
 * @returns `true` when a category is set and its column holds datetime values
 * @internal
 */
export function isDateCategory(category: StyledColumn | undefined): category is StyledColumn {
  return !!category && isDatetime(category.column.type);
}

/**
 * Extracts every measure a KPI chart's query needs: the headline `value`, the hidden measures
 * backing its formula-driven conditional color rules, and whichever comparison measure
 * (`delta`/`target`/`value`) is configured.
 * @internal
 */
export function getKpiMeasures(dataOptions: KpiChartDataOptionsInternal): Measure[] {
  const styledMeasures: StyledMeasureColumn[] = [
    dataOptions.value,
    // Hidden, never rendered: each one resolves the threshold of a formula-driven conditional
    // color rule on the headline value -- see KpiChartDataOptionsInternal.colorConditionMeasures.
    ...(dataOptions.colorConditionMeasures ?? []),
  ];

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
