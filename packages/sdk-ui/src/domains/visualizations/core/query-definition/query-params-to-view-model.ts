import type { TFunction } from '@sisense/sdk-common';
import type {
  Attribute,
  Filter,
  FilterRelations,
  FilterRelationsNode,
  Measure,
} from '@sisense/sdk-data';
import { getColumnNameFromAttribute, isDimensionalLevelAttribute } from '@sisense/sdk-data';

import type { BaseQueryParams } from '@/domains/query-execution/types';
import { generateAttributeName } from '@/shared/utils/generate-attribute-name';

import { toReadableFilterLabel } from './filter-to-readable-label';
import { formatChipLabel } from './format-chip-label';
import { isPillItem, type QueryDefinitionViewModel, type QueryPillItem } from './types';

/** Pill label for a dimension (or filter) attribute; `t` enables date-level strings via {@link generateAttributeName}. */
function getAttributeLabel(attr: Attribute, t?: TFunction): string {
  if (t && isDimensionalLevelAttribute(attr)) {
    return generateAttributeName(t, getColumnNameFromAttribute(attr), attr.granularity);
  }
  return formatChipLabel(attr);
}

/** Pill label from measure display name. */
function getMeasureLabel(measure: Measure): string {
  return formatChipLabel(measure);
}

/** Pill label from filter attribute and operator/value; empty when the filter should render no chip. */
function getFilterLabel(filter: Filter, t?: TFunction): string {
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
    result.push({
      type: 'pill',
      label: getMeasureLabel(m),
      category: 'measure',
      id: `measure-${i}-${getMeasureLabel(m)}`,
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
