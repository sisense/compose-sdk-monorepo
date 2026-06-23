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
import type { QueryDefinitionViewModel, QueryPillItem } from './types';

/** Pill label for a dimension (or filter) attribute; `t` enables date-level strings via {@link generateAttributeName}. */
function getAttributeLabel(attr: Attribute, t?: TFunction): string {
  const fallback = attr.title;
  if (t && isDimensionalLevelAttribute(attr)) {
    return generateAttributeName(t, getColumnNameFromAttribute(attr), attr.granularity);
  }
  return fallback;
}

/** Pill label from measure display name. */
function getMeasureLabel(measure: Measure): string {
  return measure.title;
}

/** Pill label from filter attribute and operator/value; empty when the filter has no attribute. */
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
 *   labels match the previous behavior (`attr.name` only).
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

  if ((measures.length > 0 || dimensions.length > 0) && filters.length > 0) {
    result.push({ type: 'connector', label: 'where' });
  }

  const filterToModel = (f: Filter, i: number): QueryPillItem => {
    const label = getFilterLabel(f, t);
    return {
      type: 'pill',
      label,
      category: 'filter',
      id: `filter-${i}-${label}`,
      tooltipData: f,
    };
  };
  const filterRelationsToModel = (f: FilterRelations, i: number): QueryDefinitionViewModel => {
    const relationResult: QueryDefinitionViewModel = [];
    relationResult.push({ type: 'connector', label: '(' });
    const pushNode = (node: FilterRelationsNode) => {
      if ((node as Filter).attribute) {
        relationResult.push(filterToModel(node as Filter, i));
      } else if (Array.isArray(node)) {
        node.forEach((leftFilter, idx) => {
          if (idx > 0) {
            relationResult.push({ type: 'connector', label: 'AND' });
          }
          relationResult.push(filterToModel(leftFilter, i + idx));
        });
      } else {
        relationResult.push(...filterRelationsToModel(node as FilterRelations, i + 1));
      }
    };
    pushNode(f.left);
    relationResult.push({ type: 'connector', label: f.operator });
    pushNode(f.right);
    relationResult.push({ type: 'connector', label: ')' });
    return relationResult;
  };
  // Filters
  filters.forEach((f, i) => {
    if ((f as FilterRelations).left) {
      const rs = filterRelationsToModel(f as FilterRelations, i);
      result.push(...rs);
    } else {
      result.push(filterToModel(f as Filter, i));
    }
  });

  return result;
}
