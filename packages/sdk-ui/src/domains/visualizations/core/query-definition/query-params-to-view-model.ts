import type {
  Attribute,
  Filter,
  FilterRelations,
  FilterRelationsNode,
  Measure,
} from '@sisense/sdk-data';

import type { BaseQueryParams } from '@/domains/query-execution/types';

import type { QueryDefinitionViewModel, QueryPillItem } from './types';

function getAttributeLabel(attr: Attribute): string {
  return attr.name ?? String(attr);
}

function getMeasureLabel(measure: Measure): string {
  return measure.name ?? String(measure);
}

function getFilterLabel(filter: Filter): string {
  return filter.attribute?.name;
}

/**
 * Builds the query definition view model from base query params.
 * Order: Measures → "by" → Dimensions → "for"/"where" → Filters.
 * Operators (comparison/sort) are not derived from BaseQueryParams in v1.
 *
 * @param params - BaseQueryParams from chart or query
 * @returns QueryDefinitionViewModel (pills and connectors)
 * @internal
 */
export function baseQueryParamsToViewModel(params: BaseQueryParams): QueryDefinitionViewModel {
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
    result.push({
      type: 'pill',
      label: getAttributeLabel(d),
      category: 'dimension',
      id: `dimension-${i}-${getAttributeLabel(d)}`,
      tooltipData: d,
    });
  });

  if ((measures.length > 0 || dimensions.length > 0) && filters.length > 0) {
    result.push({ type: 'connector', label: 'where' });
  }

  const filterToModel = (f: Filter, i: number): QueryPillItem => {
    const label = getFilterLabel(f) ?? '';
    return {
      type: 'pill',
      label,
      category: 'filter',
      id: `filter-${i}-${label}`,
      tooltipData: f,
    };
  };
  const filterRelationsToModel = (f: FilterRelations, i: number): QueryDefinitionViewModel => {
    const result: QueryDefinitionViewModel = [];
    result.push({ type: 'connector', label: '(' });
    const pushNode = (node: FilterRelationsNode) => {
      if ((node as Filter).attribute) {
        result.push(filterToModel(node as Filter, i));
      } else if (Array.isArray(node)) {
        node.forEach((leftFilter, idx) => {
          if (idx > 0) {
            result.push({ type: 'connector', label: 'AND' });
          }
          result.push(filterToModel(leftFilter, i + idx));
        });
      } else {
        result.push(...filterRelationsToModel(node as FilterRelations, i + 1));
      }
    };
    pushNode(f.left);
    result.push({ type: 'connector', label: f.operator });
    pushNode(f.right);
    result.push({ type: 'connector', label: ')' });
    return result;
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
