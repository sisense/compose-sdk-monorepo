import { getFilterListAndRelationsJaql } from '@sisense/sdk-data';
import isEqual from 'lodash-es/isEqual';

import { isFiltersChanged, isRelationsChanged } from '@/shared/utils/filters-comparator';
import { areMeasuresChanged } from '@/shared/utils/measures-comparator.js';

import { useHasChanged } from '../../../../shared/hooks/use-has-changed';
import { BaseQueryParams, ExecuteQueryParams } from '../../types.js';

/** List of parameters that can be compared by deep comparison */
const simplySerializableParamNames: (keyof ExecuteQueryParams)[] = [
  'dataSource',
  'dimensions',
  'count',
  'offset',
  'includeRowCount',
  'onBeforeQuery',
];

/**
 * Deep-compares two sets of query params for a meaningful (non-cosmetic) difference —
 * dataSource, dimensions, measures, filters (including {@link FilterRelations} structure), and
 * highlights. Ignores randomly generated filter names/guids (see {@link isFiltersChanged}).
 *
 * @param previous - Previous query params
 * @param next - Next query params
 * @returns Whether the query params have changed
 * @sisenseInternal
 */
export function haveQueryParamsChanged(previous: BaseQueryParams, next: BaseQueryParams): boolean {
  const { filters: prevFilterList, relations: prevRelationsList } = getFilterListAndRelationsJaql(
    previous.filters,
  );
  const { filters: nextFilterList, relations: nextRelationsList } = getFilterListAndRelationsJaql(
    next.filters,
  );

  return (
    !isEqual(previous.dataSource, next.dataSource) ||
    !isEqual(previous.dimensions, next.dimensions) ||
    areMeasuresChanged(previous.measures, next.measures) ||
    isFiltersChanged(prevFilterList, nextFilterList) ||
    isRelationsChanged(prevFilterList, nextFilterList, prevRelationsList, nextRelationsList) ||
    isFiltersChanged(previous.highlights, next.highlights)
  );
}

/**
 * Tracks whether `params` changed meaningfully since the previous render, via
 * {@link haveQueryParamsChanged}.
 *
 * @param params - Current query params
 * @returns Whether the query params changed since the previous render
 * @internal
 */
export function useQueryParamsChanged(params: ExecuteQueryParams) {
  return useHasChanged(params, simplySerializableParamNames, (params, prev) =>
    haveQueryParamsChanged(prev, params),
  );
}
