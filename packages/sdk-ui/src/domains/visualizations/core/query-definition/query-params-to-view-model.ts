import type { TFunction } from '@sisense/sdk-common';
import type {
  Attribute,
  CalculatedMeasure,
  Filter,
  FilterRelations,
  FilterRelationsNode,
  Measure,
} from '@sisense/sdk-data';
import {
  FORECAST_PREFIX,
  getColumnNameFromAttribute,
  isDimensionalLevelAttribute,
  MetadataTypes,
  TREND_PREFIX,
} from '@sisense/sdk-data';

import type { BaseQueryParams } from '@/domains/query-execution/types';
import { generateAttributeName } from '@/shared/utils/generate-attribute-name';

import { toReadableFilterLabel } from './filter-to-readable-label';
import { formatChipLabel } from './format-chip-label';
import { isPillItem, type QueryDefinitionViewModel, type QueryPillItem } from './types';

/**
 * Pill label for a dimension (or filter) attribute; `t` enables date-level strings via {@link generateAttributeName}.
 *
 * @param attr - Attribute to label.
 * @param t - Optional i18n translate function for date-level attributes.
 * @returns Display label for the attribute.
 * @internal
 */
export function getAttributeLabel(attr: Attribute, t?: TFunction): string {
  if (t && isDimensionalLevelAttribute(attr)) {
    return generateAttributeName(t, getColumnNameFromAttribute(attr), attr.granularity);
  }
  return formatChipLabel(attr);
}

const COMPANION_MEASURES = [
  { prefix: `${FORECAST_PREFIX}_`, key: 'advanced.tooltip.forecast', fallback: 'Forecast' },
  { prefix: `${TREND_PREFIX}_`, key: 'advanced.tooltip.trend', fallback: 'Trend' },
] as const;

/**
 * Readable label for a forecast/trend companion measure (`$forecast_Revenue` → "Revenue forecast").
 *
 * @param name - Measure name.
 * @param t - Optional i18n translate function.
 * @returns The label, or undefined when `name` is not a companion measure name.
 */
function getCompanionMeasureLabel(name: string, t?: TFunction): string | undefined {
  const companion = COMPANION_MEASURES.find(({ prefix }) => name.startsWith(prefix));
  if (!companion) {
    return undefined;
  }
  const suffix = t ? t(companion.key) : companion.fallback;
  return formatChipLabel(`${name.slice(companion.prefix.length)} ${suffix}`);
}

function normalizeFormula(formula: string): string {
  return formula.replace(/\s+/g, '').toLowerCase();
}

function getContextItemLabel(item: unknown, t?: TFunction): string | undefined {
  if (MetadataTypes.isFilter(item)) {
    return getFilterLabel(item as Filter, t) || undefined;
  }
  if (MetadataTypes.isMeasure(item)) {
    return getMeasureLabel(item as Measure, t);
  }
  if (MetadataTypes.isAttribute(item)) {
    return getAttributeLabel(item, t);
  }
  return undefined;
}

/**
 * A custom formula named after its own formula (no real title) gets its formula with every
 * `[key]` replaced by the readable label of the context item it refers to.
 *
 * @param measure - Measure to label.
 * @param t - Optional i18n translate function.
 * @returns The label, or undefined when `measure` is not a custom formula named after its formula.
 */
function getGeneratedFormulaLabel(measure: Measure, t?: TFunction): string | undefined {
  if (!MetadataTypes.isCalculatedMeasure(measure)) {
    return undefined;
  }
  const { expression, context } = measure as CalculatedMeasure;
  if (!expression || !context || normalizeFormula(measure.name) !== normalizeFormula(expression)) {
    return undefined;
  }
  const contextByKey = new Map(
    Object.entries(context).map(([key, item]) => [key.toLowerCase(), item]),
  );
  return expression
    .replace(/\[[^\]]+\]/g, (token) => {
      const item: unknown = contextByKey.get(token.toLowerCase());
      return getContextItemLabel(item, t) ?? token;
    })
    .replace(/\s*,\s*/g, ', ');
}

/**
 * Pill label from measure display name. A distinct Friendly Name is used verbatim; otherwise
 * system-generated names get a readable label: forecast/trend companions (`$forecast_…`,
 * `$trend_…`) and custom formulas named after their own formula.
 *
 * @param measure - Measure to label.
 * @param t - Optional i18n translate function.
 * @returns Display label for the measure.
 * @internal
 */
export function getMeasureLabel(measure: Measure, t?: TFunction): string {
  const hasFriendlyName = Boolean(measure.title) && measure.title !== measure.name;
  if (hasFriendlyName) {
    return formatChipLabel(measure);
  }
  return (
    getCompanionMeasureLabel(measure.name, t) ??
    getGeneratedFormulaLabel(measure, t) ??
    formatChipLabel(measure)
  );
}

/**
 * Pill label from filter attribute and operator/value; empty when the filter should render no chip.
 *
 * @param filter - Filter to label.
 * @param t - Optional i18n translate function for date-level attributes.
 * @returns Readable chip text, or an empty string when the filter should render no chip.
 * @internal
 */
export function getFilterLabel(filter: Filter, t?: TFunction): string {
  if (!filter.attribute) {
    return '';
  }
  const attributeLabel = getAttributeLabel(filter.attribute, t);
  return toReadableFilterLabel(filter, attributeLabel);
}

/**
 * Builds the query definition view model from base query params.
 * Order: Measures → "by" → Dimensions → "for"/"where" → Filters.
 * Operators (comparison/sort) are not derived from base query fields in v1.
 *
 * @param params - Base query fields from chart or query; accepts {@link ExecuteQueryParams} (execution-only fields are ignored).
 * @param t - Optional i18n translate function. When provided, date-level (`DimensionalLevelAttribute`)
 *   dimensions and filters use `attribute.datetimeName.*` strings (e.g. "Months in Date"). When omitted,
 *   the field label follows the chip-label rule on `title`/`name`.
 * @returns QueryDefinitionViewModel (pills and connectors)
 * @sisenseInternal
 */
export function baseQueryParamsToViewModel(
  params: BaseQueryParams,
  t?: TFunction,
): QueryDefinitionViewModel {
  const result: QueryDefinitionViewModel = [];
  const measures = params.measures ?? [];
  const dimensions = params.dimensions ?? [];
  const filters = Array.isArray(params.filters)
    ? params.filters
    : params.filters
    ? [params.filters]
    : [];

  // Measures
  measures.forEach((m, i) => {
    const label = getMeasureLabel(m, t);
    result.push({
      type: 'pill',
      label,
      category: 'measure',
      id: `measure-${i}-${label}`,
      tooltipData: m,
    });
  });

  if (measures.length > 0 && dimensions.length > 0) {
    result.push({ type: 'connector', label: 'by' });
  }

  // Dimensions
  dimensions.forEach((d, i) => {
    const label = getAttributeLabel(d, t);
    result.push({
      type: 'pill',
      label,
      category: 'dimension',
      id: `dimension-${i}-${label}`,
      tooltipData: d,
    });
  });

  const filterToModel = (f: Filter, i: number): QueryPillItem | undefined => {
    const label = getFilterLabel(f, t);
    if (!label) {
      return undefined;
    }
    return {
      type: 'pill',
      label,
      category: 'filter',
      id: `filter-${i}-${label}`,
      tooltipData: f,
    };
  };
  const relationNodeToModel = (node: FilterRelationsNode, i: number): QueryDefinitionViewModel => {
    if (Array.isArray(node)) {
      const items: QueryDefinitionViewModel = [];
      node.forEach((leftFilter, idx) => {
        const pill = filterToModel(leftFilter, i + idx);
        if (!pill) {
          return;
        }
        if (items.some(isPillItem)) {
          items.push({ type: 'connector', label: 'AND' });
        }
        items.push(pill);
      });
      return items;
    }
    if (isFilterRelations(node)) {
      return filterRelationsToModel(node, i);
    }
    const pill = filterToModel(node, i);
    return pill ? [pill] : [];
  };
  const filterRelationsToModel = (f: FilterRelations, i: number): QueryDefinitionViewModel => {
    const leftItems = relationNodeToModel(f.left, i);
    const rightItems = relationNodeToModel(f.right, i);
    const leftHasPill = leftItems.some(isPillItem);
    const rightHasPill = rightItems.some(isPillItem);
    if (!leftHasPill && !rightHasPill) {
      return [];
    }
    if (!leftHasPill) {
      return rightItems;
    }
    if (!rightHasPill) {
      return leftItems;
    }
    return [
      { type: 'connector', label: '(' },
      ...leftItems,
      { type: 'connector', label: f.operator },
      ...rightItems,
      { type: 'connector', label: ')' },
    ];
  };
  const filterItems: QueryDefinitionViewModel = [];
  filters.forEach((f, i) => {
    if ((f as FilterRelations).left) {
      filterItems.push(...filterRelationsToModel(f as FilterRelations, i));
    } else {
      const pill = filterToModel(f as Filter, i);
      if (pill) {
        filterItems.push(pill);
      }
    }
  });

  if ((measures.length > 0 || dimensions.length > 0) && filterItems.length > 0) {
    result.push({ type: 'connector', label: 'where' });
  }
  result.push(...filterItems);

  return result;
}

function isFilterRelations(node: FilterRelationsNode): node is FilterRelations {
  return typeof node === 'object' && node !== null && !Array.isArray(node) && 'left' in node;
}
